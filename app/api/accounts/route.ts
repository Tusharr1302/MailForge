import { type NextRequest, NextResponse } from "next/server"
import { IMAPClient } from "@/lib/imap-client"
import type { IMAPAccount } from "@/lib/types"

// In-memory storage for demo (use database in production)
const accounts: IMAPAccount[] = []
const clients: Map<string, IMAPClient> = new Map()

export async function GET() {
  return NextResponse.json({ accounts })
}

export async function POST(request: NextRequest) {
  try {
    const accountData = await request.json()

    const account: IMAPAccount = {
      id: Date.now().toString(),
      email: accountData.email,
      host: accountData.host,
      port: accountData.port,
      secure: accountData.secure,
      username: accountData.username,
      password: accountData.password,
      status: "disconnected",
      lastSync: new Date(),
      folders: ["INBOX", "SENT", "DRAFT"],
    }

    accounts.push(account)

    // Create and connect IMAP client
    const client = new IMAPClient(account)
    clients.set(account.id, client)

    client.on("connected", () => {
      account.status = "connected"
    })

    client.on("error", (error) => {
      account.status = "error"
      console.error(`IMAP error for ${account.email}:`, error)
    })

    client.on("email", (email) => {
      // Email processed and indexed
      console.log(`New email processed: ${email.subject}`)
    })

    // Connect to IMAP server
    await client.connect()

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error adding account:", error)
    return NextResponse.json({ error: "Failed to add account" }, { status: 500 })
  }
}
