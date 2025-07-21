import { type NextRequest, NextResponse } from "next/server"
import { triggerWebhook } from "@/lib/webhook-integration"
import type { Email } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Test webhook with sample email
    const testEmail: Email = {
      id: "test-" + Date.now(),
      messageId: "test@example.com",
      subject: "Test Webhook Email",
      from: "test@example.com",
      to: "user@example.com",
      body: "This is a test email for webhook integration.",
      date: new Date(),
      folder: "INBOX",
      account: "user@example.com",
      category: "Interested",
      isRead: false,
      headers: {},
    }

    await triggerWebhook(testEmail, "categorized")

    return NextResponse.json({
      success: true,
      message: "Test webhook triggered successfully",
    })
  } catch (error) {
    console.error("Error testing webhook:", error)
    return NextResponse.json({ error: "Failed to test webhook" }, { status: 500 })
  }
}
