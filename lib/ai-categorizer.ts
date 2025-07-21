import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Email, EmailCategory } from "./types"

const CATEGORIZATION_PROMPT = `
You are an AI email categorizer. Analyze the email content and categorize it into one of these categories:

1. "Interested" - The sender shows interest in a job, product, or service
2. "Meeting Booked" - The email is about scheduling or confirming a meeting
3. "Not Interested" - The sender declines or shows no interest
4. "Spam" - Promotional, marketing, or spam content
5. "Out of Office" - Automated out-of-office replies

Respond with only the category name, nothing else.

Email Subject: {subject}
Email From: {from}
Email Body: {body}
`

export async function categorizeEmail(email: Email): Promise<EmailCategory> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: CATEGORIZATION_PROMPT.replace("{subject}", email.subject)
        .replace("{from}", email.from)
        .replace("{body}", email.body.substring(0, 1000)), // Limit body length
      temperature: 0.1,
    })

    const category = text.trim() as EmailCategory

    // Validate category
    const validCategories: EmailCategory[] = ["Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"]

    if (validCategories.includes(category)) {
      return category
    }

    return "Not Interested" // Default fallback
  } catch (error) {
    console.error("Error categorizing email:", error)
    return "Not Interested" // Default fallback
  }
}

export async function generateReply(
  email: Email,
  context: {
    productInfo: string
    outreachAgenda: string
    meetingLink: string
  },
): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an AI assistant that generates professional email replies. 
      
      Context:
      - Product/Service: ${context.productInfo}
      - Outreach Goal: ${context.outreachAgenda}
      - Meeting Link: ${context.meetingLink}
      
      Generate a professional, concise reply that:
      1. Thanks the sender appropriately
      2. Addresses their specific message
      3. Includes the meeting link if they show interest in scheduling
      4. Maintains a professional tone
      5. Is personalized to their message`,
      prompt: `Generate a reply to this email:
      
      Subject: ${email.subject}
      From: ${email.from}
      Body: ${email.body}
      
      Category: ${email.category}`,
      temperature: 0.7,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating reply:", error)
    return "Thank you for your email. I will get back to you soon."
  }
}
