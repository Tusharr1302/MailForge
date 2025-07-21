export interface Email {
  id: string
  messageId: string
  subject: string
  from: string
  to: string
  cc?: string
  bcc?: string
  body: string
  htmlBody?: string
  date: Date
  folder: string
  account: string
  category: EmailCategory
  isRead: boolean
  attachments?: Attachment[]
  headers: Record<string, string>
}

export interface Attachment {
  filename: string
  contentType: string
  size: number
  data: Buffer
}

export type EmailCategory = "Interested" | "Meeting Booked" | "Not Interested" | "Spam" | "Out of Office"

export interface IMAPAccount {
  id: string
  email: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  status: "connected" | "syncing" | "error" | "disconnected"
  lastSync: Date
  folders: string[]
}

export interface SearchQuery {
  query?: string
  account?: string
  folder?: string
  category?: EmailCategory
  dateFrom?: Date
  dateTo?: Date
  isRead?: boolean
}

export interface AIReplyContext {
  productInfo: string
  outreachAgenda: string
  meetingLink: string
}

export interface WebhookPayload {
  email: Email
  action: "categorized" | "replied" | "marked_interested"
  timestamp: Date
}

export interface SlackNotification {
  channel: string
  text: string
  email: Email
}
