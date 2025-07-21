import { generateEmbedding } from "ai"
import { openai } from "@ai-sdk/openai"

interface VectorDocument {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
}

// In-memory vector store (in production, use a proper vector database like Pinecone, Weaviate, etc.)
class InMemoryVectorStore {
  private documents: VectorDocument[] = []

  async addDocument(id: string, content: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const { embedding } = await generateEmbedding({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
      })

      const document: VectorDocument = {
        id,
        content,
        embedding,
        metadata,
      }

      // Remove existing document with same ID
      this.documents = this.documents.filter((doc) => doc.id !== id)
      this.documents.push(document)

      console.log(`Document added to vector store: ${id}`)
    } catch (error) {
      console.error("Error adding document to vector store:", error)
    }
  }

  async search(query: string, limit = 5): Promise<VectorDocument[]> {
    try {
      const { embedding: queryEmbedding } = await generateEmbedding({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      })

      // Calculate cosine similarity
      const similarities = this.documents.map((doc) => ({
        document: doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
      }))

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((item) => item.document)
    } catch (error) {
      console.error("Error searching vector store:", error)
      return []
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }
}

export const vectorStore = new InMemoryVectorStore()

// Initialize with sample product and outreach data
export async function initializeVectorStore(): Promise<void> {
  await vectorStore.addDocument(
    "product-info",
    `We are a software development company specializing in AI-powered applications. 
    We build custom solutions for businesses looking to integrate artificial intelligence 
    into their workflows. Our services include machine learning model development, 
    natural language processing, computer vision, and AI consulting.`,
    { type: "product" },
  )

  await vectorStore.addDocument(
    "outreach-agenda",
    `I am applying for software engineering positions, particularly those involving 
    AI and machine learning. I have experience with Python, TypeScript, React, and 
    various AI frameworks. I'm looking for opportunities to work on innovative projects 
    and contribute to cutting-edge technology solutions. If interested, please schedule 
    a meeting using this link: https://cal.com/example`,
    { type: "outreach" },
  )

  await vectorStore.addDocument(
    "meeting-booking",
    `For scheduling meetings and interviews, please use this calendar link: 
    https://cal.com/example. I'm available for technical interviews, project discussions, 
    and consultation calls. The calendar shows my real-time availability.`,
    { type: "scheduling" },
  )
}
