# Barsat Cloud Workshop

Welcome to the **Barsat Cloud Workshop**!  
This project demonstrates how to build a modern, intelligent, and scalable serverless pipeline on AWS. The main goal is to set up a Lambda function that gets triggered by new files in an S3 bucket, automatically summarizes the content using Generative AI, and sends the summary via email.

## Features

- **Seamless S3 Integration:** Monitors an S3 bucket for new file uploads.
- **AWS Lambda Automation:** Event-driven Lambda function for zero-maintenance operation.
- **GenAI Summarization:** Utilizes cutting-edge Generative AI (LLM) to summarize uploaded file content.
- **Automated Email Notification:** Sends the summary directly to the recipient’s email.
- **Fully Serverless:** Scalable, cost-effective, and easy to deploy.

## Architecture Overview

1. **File Upload:**  
   User uploads a file (e.g., text, PDF) to a designated S3 bucket.

2. **Trigger:**  
   The S3 `ObjectCreated` event automatically invokes the Lambda function.

3. **Summarization:**  
   Lambda downloads the file, processes its contents, and calls a Generative AI service (e.g., Bedrock, OpenAI, or similar) to generate a concise summary.

4. **Email Delivery:**  
   The summary is emailed to a predefined address (could leverage AWS SES or other reliable email services).
