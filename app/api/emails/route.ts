import { type NextRequest, NextResponse } from "next/server"
import { searchEmails } from "@/lib/elasticsearch"
import type { SearchQuery } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query: SearchQuery = {
      query: searchParams.get("q") || undefined,
      account: searchParams.get("account") || undefined,
      folder: searchParams.get("folder") || undefined,
      category: (searchParams.get("category") as any) || undefined,
      isRead: searchParams.get("isRead") ? searchParams.get("isRead") === "true" : undefined,
    }

    const emails = await searchEmails(query)

    return NextResponse.json({ emails })
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
  }
}
