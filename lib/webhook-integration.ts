import type { Email, WebhookPayload } from "./types"

const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://webhook.site/your-unique-url"

export async function triggerWebhook(
  email: Email,
  action: "categorized" | "replied" | "marked_interested",
): Promise<void> {
  try {
    const payload: WebhookPayload = {
      email: {
        ...email,
        // Remove sensitive data if needed
        body: email.body.substring(0, 500), // Truncate body
      },
      action,
      timestamp: new Date(),
    }

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "EmailAggregator/1.0",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`)
    }

    console.log(`Webhook triggered for email: ${email.id}, action: ${action}`)
  } catch (error) {
    console.error("Error triggering webhook:", error)
  }
}
