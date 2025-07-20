import { S3 } from "@aws-sdk/client-s3";
import axios from "axios";
import nodemailer from "nodemailer";

const s3 = new S3();

const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true" || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};
const recipientEmail = process.env.EMAIL_RECIPIENT || emailConfig.auth.user;
const transporter = nodemailer.createTransport(emailConfig);
const geminiApiKey = process.env.GEMINI_API_KEY;
const webHookURI = process.env.WEBHOOK_URI;

export const handler = async (event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );
    const fileName = key.split("/").pop();

    const params = {
      Bucket: bucket,
      Key: key,
    };

    const { ContentType, Body } = await s3.getObject(params);
    console.log("CONTENT TYPE:", ContentType);

    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const fileBase64 = fileBuffer.toString("base64");
    console.log("File size:", fileBuffer.length, "bytes");

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    let mimeType = ContentType || "application/octet-stream";
    if (fileName.toLowerCase().endsWith(".txt")) {
      mimeType = "text/plain";
    } else if (fileName.toLowerCase().endsWith(".pdf")) {
      mimeType = "application/pdf";
    } else if (fileName.toLowerCase().endsWith(".docx")) {
      mimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (
      fileName.toLowerCase().endsWith(".jpg") ||
      fileName.toLowerCase().endsWith(".jpeg")
    ) {
      mimeType = "image/jpeg";
    } else if (fileName.toLowerCase().endsWith(".png")) {
      mimeType = "image/png";
    }

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: "Please provide a comprehensive summary of this file's content.",
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: fileBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
            },
          },
          required: ["summary"],
          propertyOrdering: ["summary"],
        },
      },
    };

    const modelId = "gemini-2.5-flash";
    const generateContentApi = "generateContent";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${generateContentApi}`;

    console.log("Calling Gemini API for file analysis...");
    const geminiResponse = await axios.post(geminiUrl, geminiPayload, {
      headers: {
        "x-goog-api-key": geminiApiKey,
        "Content-Type": "application/json",
      },
    });

    let summary = "";
    if (
      geminiResponse.data &&
      geminiResponse.data.candidates &&
      geminiResponse.data.candidates[0]
    ) {
      const candidate = geminiResponse.data.candidates[0];
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts[0]
      ) {
        const responseText = candidate.content.parts[0].text;
        try {
          const parsedContent = JSON.parse(responseText);
          summary = parsedContent.summary;
        } catch (parseError) {
          console.log("Error parsing JSON response:", parseError);
          // Fallback: use raw text if JSON parsing fails
          summary = responseText;
        }
      }
    }

    if (!summary) {
      throw new Error("Failed to extract summary from Gemini response");
    }

    await sendEmailSummary(fileName, summary, bucket, key);

    const webhookPayload = {
      file_info: {
        bucket: bucket,
        key: key,
        fileName: fileName,
        contentType: ContentType,
        mimeType: mimeType,
        size: event.Records[0].s3.object.size,
      },
      summary: summary,
      email_sent: true,
      processed_at: new Date().toISOString(),
    };

    const { data } = await axios.post(webHookURI, webhookPayload);

    return {
      statusCode: 200,
      body: {
        message: "File summarization completed successfully",
        bucket: bucket,
        key: key,
        fileName: fileName,
        contentType: ContentType,
        summary: summary,
        webhookResponse: data,
      },
    };
  } catch (err) {
    console.error("Error:", err);

    try {
      await axios.post(webHookURI, {
        error: true,
        message: err.message,
        event: event,
        processed_at: new Date().toISOString(),
      });
    } catch (webhookErr) {
      console.error("Failed to send error to webhook:", webhookErr);
    }

    const message = `Error processing S3 event: ${err.message}`;
    console.log(message);
    throw new Error(message);
  }
};

async function sendEmailSummary(fileName, summary) {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_SENDER}`,
      to: recipientEmail,
      subject: `Summary of ${fileName}`,
      text: summary,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
