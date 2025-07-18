import { S3 } from "@aws-sdk/client-s3";
import axios from "axios";
import nodemailer from "nodemailer";

console.log("Loading function");
const s3 = new S3();

export const handler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    // Get the object from the event
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );
    const fileName = key.split("/").pop();

    console.log(`Processing file: ${fileName} from bucket: ${bucket}`);

    const params = {
      Bucket: bucket,
      Key: key,
    };

    const { ContentType, Body } = await s3.getObject(params);
    console.log("CONTENT TYPE:", ContentType);

    // Convert the stream to buffer
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Convert buffer to base64 for file upload
    const fileBase64 = fileBuffer.toString("base64");
    console.log("File size:", fileBuffer.length, "bytes");

    // Call Gemini API for file analysis
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Determine mime type based on file extension or content type
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

    // Parse the response from Gemini
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

    console.log("Generated summary:", summary);

    // Send email with summary
    await sendEmailSummary(fileName, summary, bucket, key);

    // Send summary to webhook
    const webhookPayload = {
      event: event,
      file_info: {
        bucket: bucket,
        key: key,
        fileName: fileName,
        contentType: ContentType,
        size: event.Records[0].s3.object.size,
      },
      summary: summary,
      processed_at: new Date().toISOString(),
      email_sent: true,
    };

    const { data } = await axios.post(
      `https://webhook.site/330b91f5-4e0b-4684-a78e-5cee7c8c9642`,
      webhookPayload
    );

    console.log("Webhook response:", data);

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

    // Send error to webhook too
    try {
      await axios.post(
        `https://webhook.site/330b91f5-4e0b-4684-a78e-5cee7c8c9642`,
        {
          error: true,
          message: err.message,
          event: event,
          processed_at: new Date().toISOString(),
        }
      );
    } catch (webhookErr) {
      console.error("Failed to send error to webhook:", webhookErr);
    }

    const message = `Error processing S3 event: ${err.message}`;
    console.log(message);
    throw new Error(message);
  }
};

async function sendEmailSummary(fileName, summary, bucket, key) {
  try {
    // Email configuration from environment variables
    const emailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Validate required email environment variables
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error(
        "SMTP_USER and SMTP_PASSWORD environment variables are required"
      );
    }

    const recipientEmail = process.env.EMAIL_RECIPIENT || emailConfig.auth.user;

    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified");

    // Email content
    const mailOptions = {
      from: `${process.env.EMAIL_SENDER}`,
      to: recipientEmail,
      subject: `Summary of ${fileName}`,
      text: summary,
    };

    // Send email
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
