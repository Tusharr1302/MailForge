"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Search, Send, Calendar, X, AlertTriangle, Coffee } from "lucide-react"

interface Email {
  id: string
  subject: string
  from: string
  to: string
  body: string
  date: string
  folder: string
  account: string
  category: "Interested" | "Meeting Booked" | "Not Interested" | "Spam" | "Out of Office"
  isRead: boolean
}

interface Account {
  id: string
  email: string
  status: "connected" | "syncing" | "error"
  lastSync: string
}

const mockEmails: Email[] = [
  {
    id: "1",
    subject: "Re: Job Application - Software Engineer Position",
    from: "hr@techcorp.com",
    to: "user@example.com",
    body: "Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?",
    date: "2024-01-15T10:30:00Z",
    folder: "INBOX",
    account: "user@example.com",
    category: "Interested",
    isRead: false,
  },
  {
    id: "2",
    subject: "Meeting Confirmation - Technical Interview",
    from: "scheduler@techcorp.com",
    to: "user@example.com",
    body: "Your interview has been scheduled for tomorrow at 2 PM. Please join the meeting using the link provided.",
    date: "2024-01-14T15:45:00Z",
    folder: "INBOX",
    account: "user@example.com",
    category: "Meeting Booked",
    isRead: true,
  },
  {
    id: "3",
    subject: "Application Status Update",
    from: "noreply@company.com",
    to: "user@example.com",
    body: "Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.",
    date: "2024-01-13T09:15:00Z",
    folder: "INBOX",
    account: "user@example.com",
    category: "Not Interested",
    isRead: true,
  },
]

const mockAccounts: Account[] = [
  {
    id: "1",
    email: "user@example.com",
    status: "connected",
    lastSync: "2024-01-15T11:00:00Z",
  },
  {
    id: "2",
    email: "work@company.com",
    status: "syncing",
    lastSync: "2024-01-15T10:55:00Z",
  },
]

export default function EmailAggregator() {
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [suggestedReply, setSuggestedReply] = useState("")
  const [isGeneratingReply, setIsGeneratingReply] = useState(false)

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAccount = selectedAccount === "all" || email.account === selectedAccount
    const matchesFolder = selectedFolder === "all" || email.folder === selectedFolder
    const matchesCategory = selectedCategory === "all" || email.category === selectedCategory

    return matchesSearch && matchesAccount && matchesFolder && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Interested":
        return <Mail className="w-4 h-4" />
      case "Meeting Booked":
        return <Calendar className="w-4 h-4" />
      case "Not Interested":
        return <X className="w-4 h-4" />
      case "Spam":
        return <AlertTriangle className="w-4 h-4" />
      case "Out of Office":
        return <Coffee className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Interested":
        return "bg-green-100 text-green-800"
      case "Meeting Booked":
        return "bg-blue-100 text-blue-800"
      case "Not Interested":
        return "bg-red-100 text-red-800"
      case "Spam":
        return "bg-orange-100 text-orange-800"
      case "Out of Office":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const generateSuggestedReply = async (email: Email) => {
    setIsGeneratingReply(true)

    // Simulate AI reply generation
    setTimeout(() => {
      let reply = ""

      if (email.category === "Interested") {
        if (email.body.toLowerCase().includes("interview") || email.body.toLowerCase().includes("technical")) {
          reply =
            "Thank you for shortlisting my profile! I'm available for a technical interview. You can book a slot here: https://cal.com/example"
        } else {
          reply =
            "Thank you for your interest! I'm excited about this opportunity and would love to discuss further. Please let me know the next steps."
        }
      } else if (email.category === "Meeting Booked") {
        reply = "Thank you for the confirmation. I'll be there on time and look forward to our discussion."
      }

      setSuggestedReply(reply)
      setIsGeneratingReply(false)
    }, 2000)
  }

  const addAccount = async () => {
    // This would typically open a modal to add IMAP credentials
    const newAccount: Account = {
      id: Date.now().toString(),
      email: "new@example.com",
      status: "syncing",
      lastSync: new Date().toISOString(),
    }
    setAccounts([...accounts, newAccount])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Aggregator</h1>
          <p className="text-gray-600">Manage multiple email accounts with AI-powered categorization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{account.email}</p>
                      <p className="text-xs text-gray-500">
                        {account.status === "connected" && "✓ Connected"}
                        {account.status === "syncing" && "⟳ Syncing..."}
                        {account.status === "error" && "✗ Error"}
                      </p>
                    </div>
                  </div>
                ))}
                <Button onClick={addAccount} className="w-full bg-transparent" variant="outline">
                  Add Account
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Account</label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.email}>
                          {account.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Folder</label>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Folders</SelectItem>
                      <SelectItem value="INBOX">Inbox</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Meeting Booked">Meeting Booked</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                      <SelectItem value="Spam">Spam</SelectItem>
                      <SelectItem value="Out of Office">Out of Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="emails" className="space-y-6">
              <TabsList>
                <TabsTrigger value="emails">Emails</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="emails" className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Email List */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Emails ({filteredEmails.length})</h3>

                    {filteredEmails.map((email) => (
                      <Card
                        key={email.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedEmail?.id === email.id ? "ring-2 ring-blue-500" : ""
                        } ${!email.isRead ? "bg-blue-50" : ""}`}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1 line-clamp-1">{email.subject}</h4>
                              <p className="text-xs text-gray-600 mb-2">From: {email.from}</p>
                            </div>
                            {!email.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />}
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getCategoryColor(email.category)}`}>
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(email.category)}
                                {email.category}
                              </span>
                            </Badge>
                            <span className="text-xs text-gray-500">{new Date(email.date).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Email Detail */}
                  {selectedEmail && (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{selectedEmail.subject}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">From: {selectedEmail.from}</p>
                              <p className="text-sm text-gray-600">To: {selectedEmail.to}</p>
                            </div>
                            <Badge className={getCategoryColor(selectedEmail.category)}>
                              <span className="flex items-center gap-1">
                                {getCategoryIcon(selectedEmail.category)}
                                {selectedEmail.category}
                              </span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Suggested Reply */}
                      {(selectedEmail.category === "Interested" || selectedEmail.category === "Meeting Booked") && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">AI Suggested Reply</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {!suggestedReply && !isGeneratingReply && (
                              <Button onClick={() => generateSuggestedReply(selectedEmail)} className="w-full">
                                Generate AI Reply
                              </Button>
                            )}

                            {isGeneratingReply && (
                              <div className="flex items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2">Generating reply...</span>
                              </div>
                            )}

                            {suggestedReply && (
                              <div className="space-y-4">
                                <Textarea
                                  value={suggestedReply}
                                  onChange={(e) => setSuggestedReply(e.target.value)}
                                  rows={4}
                                  className="w-full"
                                />
                                <div className="flex gap-2">
                                  <Button className="flex-1">
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Reply
                                  </Button>
                                  <Button variant="outline" onClick={() => generateSuggestedReply(selectedEmail)}>
                                    Regenerate
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Mail className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Emails</p>
                          <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Interested</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {emails.filter((e) => e.category === "Interested").length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Meetings</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {emails.filter((e) => e.category === "Meeting Booked").length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Spam</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {emails.filter((e) => e.category === "Spam").length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
