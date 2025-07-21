import { type NextRequest, NextResponse } from "next/server"
import { generateReply } from "@/lib/ai-categorizer"
import { vectorStore } from "@/lib/vector-store"
import type { Email } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { email }: { email: Email } = await request.json()

    // Search vector store for relevant context
    const relevantDocs = await vectorStore.search(`${email.subject} ${email.body}`, 3)

    // Extract context from vector store
    const productInfo = relevantDocs.find((doc) => doc.metadata.type === "product")?.content || ""
    const outreachAgenda = relevantDocs.find((doc) => doc.metadata.type === "outreach")?.content || ""
    const meetingLink = "https://cal.com/example" // Extract from scheduling doc

    const reply = await generateReply(email, {
      productInfo,
      outreachAgenda,
      meetingLink,
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Error generating reply:", error)
    return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 })
  }
}
