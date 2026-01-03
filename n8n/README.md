# n8n Backend Integration

This folder contains resources for integrating n8n as a backend for the WhatSay app.

## Setup Instructions

1.  **Install n8n**: If you haven't already, install n8n (e.g., `npm install n8n -g` or use the cloud version).
2.  **Import Workflow**:
    *   Open your n8n dashboard.
    *   Create a new workflow.
    *   Import the `sample-workflow.json` file found in this directory.
3.  **Activate Workflow**:
    *   Save the workflow.
    *   Click "Activate" to make the webhook live.
4.  **Get Webhook URL**:
    *   Open the "Webhook" node.
    *   Copy the "Production URL" (or "Test URL" for testing).
5.  **Configure App**:
    *   Update `api/n8nService.ts` with your webhook URL.

## Workflow Description

The sample workflow simply receives a POST request at `/test` and responds with a success message and the data it received. You can expand this to:
*   Fetch news articles.
*   Process user data.
*   Send emails/notifications.
