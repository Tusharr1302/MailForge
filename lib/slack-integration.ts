import type { Email } from "./types"

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export async function sendSlackNotification(email: Email): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("Slack webhook URL not configured")
    return
  }

  try {
    const message = {
      text: `🎯 New Interested Email Received!`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎯 New Interested Email",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*From:* ${email.from}`,
            },
            {
              type: "mrkdwn",
              text: `*Subject:* ${email.subject}`,
            },
            {
              type: "mrkdwn",
              text: `*Account:* ${email.account}`,
            },
            {
              type: "mrkdwn",
              text: `*Date:* ${email.date.toLocaleString()}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Preview:* ${email.body.substring(0, 200)}${email.body.length > 200 ? "..." : ""}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Email",
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/emails/${email.id}`,
              style: "primary",
            },
          ],
        },
      ],
    }

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`)
    }

    console.log(`Slack notification sent for email: ${email.id}`)
  } catch (error) {
    console.error("Error sending Slack notification:", error)
  }
}
