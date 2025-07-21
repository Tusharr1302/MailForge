import { Client } from "@elastic/elasticsearch"
import type { Email, SearchQuery } from "./types"

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
})

const EMAIL_INDEX = "emails"

export async function initializeElasticsearch(): Promise<void> {
  try {
    // Check if index exists
    const exists = await client.indices.exists({ index: EMAIL_INDEX })

    if (!exists) {
      // Create index with mapping
      await client.indices.create({
        index: EMAIL_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: "keyword" },
              messageId: { type: "keyword" },
              subject: {
                type: "text",
                analyzer: "standard",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              from: {
                type: "text",
                analyzer: "standard",
                fields: {
                  keyword: { type: "keyword" },
                },
              },
              to: { type: "text" },
              body: {
                type: "text",
                analyzer: "standard",
              },
              date: { type: "date" },
              folder: { type: "keyword" },
              account: { type: "keyword" },
              category: { type: "keyword" },
              isRead: { type: "boolean" },
            },
          },
        },
      })

      console.log("Elasticsearch index created successfully")
    }
  } catch (error) {
    console.error("Error initializing Elasticsearch:", error)
  }
}

export async function indexEmail(email: Email): Promise<void> {
  try {
    await client.index({
      index: EMAIL_INDEX,
      id: email.id,
      body: {
        ...email,
        date: email.date.toISOString(),
      },
    })

    console.log(`Email indexed: ${email.id}`)
  } catch (error) {
    console.error("Error indexing email:", error)
  }
}

export async function searchEmails(query: SearchQuery): Promise<Email[]> {
  try {
    const must: any[] = []

    if (query.query) {
      must.push({
        multi_match: {
          query: query.query,
          fields: ["subject^2", "from^1.5", "body"],
        },
      })
    }

    if (query.account) {
      must.push({ term: { account: query.account } })
    }

    if (query.folder) {
      must.push({ term: { folder: query.folder } })
    }

    if (query.category) {
      must.push({ term: { category: query.category } })
    }

    if (query.isRead !== undefined) {
      must.push({ term: { isRead: query.isRead } })
    }

    if (query.dateFrom || query.dateTo) {
      const range: any = {}
      if (query.dateFrom) range.gte = query.dateFrom.toISOString()
      if (query.dateTo) range.lte = query.dateTo.toISOString()
      must.push({ range: { date: range } })
    }

    const response = await client.search({
      index: EMAIL_INDEX,
      body: {
        query: {
          bool: { must },
        },
        sort: [{ date: { order: "desc" } }],
        size: 100,
      },
    })

    return response.body.hits.hits.map((hit: any) => ({
      ...hit._source,
      date: new Date(hit._source.date),
    }))
  } catch (error) {
    console.error("Error searching emails:", error)
    return []
  }
}

export async function updateEmailCategory(emailId: string, category: string): Promise<void> {
  try {
    await client.update({
      index: EMAIL_INDEX,
      id: emailId,
      body: {
        doc: { category },
      },
    })
  } catch (error) {
    console.error("Error updating email category:", error)
  }
}
