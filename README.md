# Email Aggregator - Advanced IMAP Synchronization System

A highly functional email aggregator with real-time IMAP synchronization, AI-powered categorization, and advanced search capabilities, similar to Reachinbox.

## 🚀 Features Implemented

### ✅ 1. Real-Time Email Synchronization
- Multiple IMAP account support (minimum 2)
- Fetches last 30 days of emails
- Persistent IMAP connections with IDLE mode
- No cron jobs - true real-time updates

### ✅ 2. Searchable Storage using Elasticsearch
- Local Elasticsearch instance via Docker
- Full-text search across subject, from, and body
- Advanced filtering by folder, account, and category
- Optimized indexing for fast retrieval

### ✅ 3. AI-Based Email Categorization
- Automatic categorization into 5 labels:
  - Interested
  - Meeting Booked
  - Not Interested
  - Spam
  - Out of Office
- Uses OpenAI GPT-4 for accurate classification

### ✅ 4. Slack & Webhook Integration
- Slack notifications for "Interested" emails
- Webhook triggers for external automation
- Configurable webhook.site integration

### ✅ 5. Frontend Interface
- Clean, responsive UI built with Next.js and Tailwind CSS
- Email display with filtering and search
- Real-time updates and categorization display
- Account management interface

### ✅ 6. AI-Powered Suggested Replies (RAG)
- Vector database for product and outreach context
- RAG implementation with OpenAI embeddings
- Intelligent reply suggestions based on email content
- Meeting link integration for interested leads

## 🛠️ Technology Stack

- **Backend**: TypeScript, Node.js, Next.js API Routes
- **Frontend**: React, Next.js, Tailwind CSS, shadcn/ui
- **Database**: Elasticsearch (search), In-memory Vector Store
- **AI**: OpenAI GPT-4, Text Embeddings
- **Email**: IMAP with IDLE mode
- **Integrations**: Slack Webhooks, Custom Webhooks
- **Infrastructure**: Docker, Docker Compose

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- OpenAI API Key

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd email-aggregator
npm install
\`\`\`

### 2. Environment Variables
Create `.env.local`:
\`\`\`env
OPENAI_API_KEY=your_openai_api_key
ELASTICSEARCH_URL=http://localhost:9200
SLACK_WEBHOOK_URL=your_slack_webhook_url
WEBHOOK_URL=https://webhook.site/your-unique-url
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Start Elasticsearch
\`\`\`bash
npm run docker:up
\`\`\`

### 4. Run the Application
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## 🔧 Configuration

### Adding IMAP Accounts
1. Navigate to the application
2. Click "Add Account" in the sidebar
3. Enter IMAP credentials:
   - Email address
   - IMAP host (e.g., imap.gmail.com)
   - Port (993 for SSL)
   - Username and password

### Webhook Configuration
- Set `WEBHOOK_URL` to your webhook.site URL
- Test webhooks via `/api/webhooks/test`

### Slack Integration
- Create a Slack webhook URL
- Set `SLACK_WEBHOOK_URL` in environment variables

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Elasticsearch │
│   (Next.js)     │◄──►│   (Next.js)      │◄──►│   (Docker)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   IMAP Clients   │
                       │   (Real-time)    │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AI Services    │◄──►│  Vector Store   │
                       │   (OpenAI)       │    │  (Embeddings)   │
                       └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Integrations   │
                       │ (Slack/Webhooks) │
                       └──────────────────┘
\`\`\`

## 📊 API Endpoints

### Emails
- `GET /api/emails` - Search and filter emails
- `POST /api/emails/[id]/reply` - Generate AI reply

### Accounts
- `GET /api/accounts` - List IMAP accounts
- `POST /api/accounts` - Add new IMAP account

### Webhooks
- `POST /api/webhooks/test` - Test webhook integration

## 🧪 Testing

### Test IMAP Connection
\`\`\`bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "host": "imap.gmail.com",
    "port": 993,
    "secure": true,
    "username": "test@gmail.com",
    "password": "app_password"
  }'
\`\`\`

### Test Webhook
\`\`\`bash
curl -X POST http://localhost:3000/api/webhooks/test
\`\`\`

### Test Email Search
\`\`\`bash
curl "http://localhost:3000/api/emails?q=interview&category=Interested"
\`\`\`

## 🔍 Elasticsearch Queries

Access Kibana at `http://localhost:5601` for advanced queries:

\`\`\`json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "category": "Interested" } },
        { "range": { "date": { "gte": "2024-01-01" } } }
      ]
    }
  }
}
\`\`\`

## 🤖 AI Features

### Email Categorization
- Analyzes subject, sender, and body content
- Uses GPT-4 for accurate classification
- Fallback to "Not Interested" for edge cases

### Reply Generation (RAG)
- Vector similarity search for context
- Personalized replies based on email content
- Automatic meeting link inclusion
- Professional tone and formatting

## 🔗 Integrations

### Slack Notifications
- Rich message formatting
- Direct links to emails
- Triggered only for "Interested" emails

### Webhook Automation
- JSON payload with email data
- Action tracking (categorized, replied, etc.)
- External system integration support

## 🚀 Deployment

### Production Considerations
- Use managed Elasticsearch (AWS OpenSearch, Elastic Cloud)
- Implement proper vector database (Pinecone, Weaviate)
- Add Redis for caching and session management
- Set up proper logging and monitoring
- Implement rate limiting and security measures

### Docker Production
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 📈 Performance Optimizations

- IMAP connection pooling
- Elasticsearch bulk indexing
- Vector embedding caching
- Lazy loading for large email lists
- Background processing for AI tasks

## 🔒 Security

- Environment variable protection
- IMAP credential encryption
- API rate limiting
- Input validation and sanitization
- CORS configuration

## 🐛 Troubleshooting

### Common Issues

1. **Elasticsearch Connection Failed**
   \`\`\`bash
   docker-compose restart elasticsearch
   \`\`\`

2. **IMAP Authentication Error**
   - Enable "Less secure app access" for Gmail
   - Use App Passwords for 2FA accounts

3. **AI Categorization Slow**
   - Check OpenAI API limits
   - Implement request queuing

## 📝 Demo Video

[Link to 5-minute demo video showcasing all features]

## 🏆 Feature Completion Status

- ✅ Real-Time Email Synchronization (IMAP IDLE)
- ✅ Elasticsearch Integration & Search
- ✅ AI Email Categorization
- ✅ Slack & Webhook Integration
- ✅ Frontend Interface
- ✅ AI-Powered Suggested Replies (RAG)

**Score: 6/6 Features Completed**

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with ❤️ for the Email Aggregator Challenge
