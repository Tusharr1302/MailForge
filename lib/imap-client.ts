import Imap from "imap"
import { simpleParser } from "mailparser"
import { EventEmitter } from "events"
import type { Email, IMAPAccount, EmailCategory } from "./types"
import { categorizeEmail } from "./ai-categorizer"
import { indexEmail } from "./elasticsearch"
import { sendSlackNotification } from "./slack-integration"
import { triggerWebhook } from "./webhook-integration"

export class IMAPClient extends EventEmitter {
  private imap: Imap
  private account: IMAPAccount
  private isConnected = false

  constructor(account: IMAPAccount) {
    super()
    this.account = account
    this.imap = new Imap({
      user: account.username,
      password: account.password,
      host: account.host,
      port: account.port,
      tls: account.secure,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: true,
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.imap.once("ready", () => {
      console.log(`IMAP connection ready for ${this.account.email}`)
      this.isConnected = true
      this.emit("connected")
      this.syncEmails()
    })

    this.imap.once("error", (err: Error) => {
      console.error(`IMAP connection error for ${this.account.email}:`, err)
      this.emit("error", err)
    })

    this.imap.once("end", () => {
      console.log(`IMAP connection ended for ${this.account.email}`)
      this.isConnected = false
      this.emit("disconnected")
    })

    this.imap.on("mail", (numNewMsgs: number) => {
      console.log(`${numNewMsgs} new messages for ${this.account.email}`)
      this.fetchNewEmails()
    })
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once("ready", resolve)
      this.imap.once("error", reject)
      this.imap.connect()
    })
  }

  async syncEmails(): Promise<void> {
    try {
      // Sync last 30 days of emails
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      for (const folder of this.account.folders) {
        await this.syncFolder(folder, thirtyDaysAgo)
      }

      // Enable IDLE mode for real-time updates
      this.enableIdle()
    } catch (error) {
      console.error(`Error syncing emails for ${this.account.email}:`, error)
      this.emit("error", error)
    }
  }

  private async syncFolder(folder: string, since: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folder, true, (err, box) => {
        if (err) {
          reject(err)
          return
        }

        const searchCriteria = ["SINCE", since]
        this.imap.search(searchCriteria, (err, results) => {
          if (err) {
            reject(err)
            return
          }

          if (results.length === 0) {
            resolve()
            return
          }

          const fetch = this.imap.fetch(results, {
            bodies: "",
            struct: true,
            envelope: true,
          })

          fetch.on("message", (msg, seqno) => {
            this.processMessage(msg, folder)
          })

          fetch.once("error", reject)
          fetch.once("end", resolve)
        })
      })
    })
  }

  private async processMessage(msg: any, folder: string): Promise<void> {
    let buffer = ""
    let envelope: any
    let struct: any

    msg.on("body", (stream: any) => {
      stream.on("data", (chunk: any) => {
        buffer += chunk.toString("utf8")
      })
    })

    msg.once("attributes", (attrs: any) => {
      envelope = attrs.envelope
      struct = attrs.struct
    })

    msg.once("end", async () => {
      try {
        const parsed = await simpleParser(buffer)

        const email: Email = {
          id: `${this.account.id}-${envelope.messageId}`,
          messageId: envelope.messageId,
          subject: envelope.subject,
          from: envelope.from[0].address,
          to: envelope.to?.map((addr: any) => addr.address).join(", ") || "",
          cc: envelope.cc?.map((addr: any) => addr.address).join(", "),
          bcc: envelope.bcc?.map((addr: any) => addr.address).join(", "),
          body: parsed.text || "",
          htmlBody: parsed.html,
          date: envelope.date,
          folder,
          account: this.account.email,
          category: "Not Interested" as EmailCategory, // Will be updated by AI
          isRead: false,
          headers: parsed.headers as any,
        }

        // AI categorization
        const category = await categorizeEmail(email)
        email.category = category

        // Index in Elasticsearch
        await indexEmail(email)

        // Send Slack notification for interested emails
        if (category === "Interested") {
          await sendSlackNotification(email)
          await triggerWebhook(email, "categorized")
        }

        this.emit("email", email)
      } catch (error) {
        console.error("Error processing message:", error)
      }
    })
  }

  private async fetchNewEmails(): Promise<void> {
    // Fetch new emails when IDLE detects new messages
    this.imap.search(["UNSEEN"], (err, results) => {
      if (err || !results.length) return

      const fetch = this.imap.fetch(results, {
        bodies: "",
        struct: true,
        envelope: true,
      })

      fetch.on("message", (msg, seqno) => {
        this.processMessage(msg, "INBOX")
      })
    })
  }

  private enableIdle(): void {
    this.imap.openBox("INBOX", false, (err) => {
      if (err) {
        console.error("Error opening INBOX for IDLE:", err)
        return
      }

      this.imap.on("mail", () => {
        this.fetchNewEmails()
      })

      // Start IDLE
      this.imap.idle()
    })
  }

  disconnect(): void {
    if (this.isConnected) {
      this.imap.end()
    }
  }
}
