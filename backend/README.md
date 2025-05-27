# Sales Practice AI - Backend

Express.js backend server for the AI-powered sales practice tool with LM Studio integration.

## 🚀 Quick Start

```bash
npm install
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Session Management

#### Start New Session
```http
POST /api/session/start
Content-Type: application/json

{
  "product": "CRM Software",
  "customerProfile": "Small business owner, tech-savvy, budget-conscious",
  "scenario": "Product demo follow-up" // optional
}
```

**Response:**
```json
{
  "sessionId": "uuid-string",
  "message": "Session started successfully",
  "context": {
    "product": "CRM Software",
    "customerProfile": "Small business owner...",
    "scenario": "Product demo follow-up",
    "startTime": "2024-01-01T00:00:00.000Z",
    "messageCount": 0
  }
}
```

#### Send Chat Message
```http
POST /api/chat
Content-Type: application/json

{
  "sessionId": "uuid-string",
  "userMessage": "Hello, I wanted to follow up on our demo yesterday."
}
```

**Response:**
```json
{
  "reply": "Hi! Yes, I remember the demo. I have a few questions about pricing...",
  "sessionInfo": {
    "messageCount": 1,
    "sessionDuration": 30000
  }
}
```

#### Update Session Context
```http
POST /api/session/update-context
Content-Type: application/json

{
  "sessionId": "uuid-string",
  "product": "Updated Product Name",
  "customerProfile": "Updated customer profile",
  "scenario": "New scenario"
}
```

#### Get Performance Analysis
```http
POST /api/session/analyze
Content-Type: application/json

{
  "sessionId": "uuid-string"
}
```

**Response:**
```json
{
  "analysis": "Detailed performance analysis text...",
  "sessionStats": {
    "duration": 300000,
    "messageCount": 10,
    "context": { ... }
  }
}
```

### Utility Endpoints

#### Health Check
```http
GET /health
```

#### Get Session History
```http
GET /api/session/:sessionId/history
```

#### Delete Session
```http
DELETE /api/session/:sessionId
```

#### List Active Sessions
```http
GET /api/sessions
```

## ⚙️ Configuration

Edit `config.js` to modify settings:

```javascript
module.exports = {
  PORT: 5000,
  LLM_ENDPOINT: 'http://localhost:1234/v1/chat/completions',
  LLM_MODEL: 'mistral-7b-instruct',
  CORS_ORIGIN: 'http://localhost:3000'
};
```

## 🔧 LM Studio Integration

The backend integrates with LM Studio's OpenAI-compatible API:

- **Endpoint**: `/v1/chat/completions`
- **Model**: Configurable (default: mistral-7b-instruct)
- **Temperature**: 0.7 for conversations, 0.3 for analysis
- **Max Tokens**: 500 for conversations, 1000 for analysis

### System Prompt Engineering

The backend automatically creates context-aware system prompts:

```javascript
const createSystemPrompt = (product, customerProfile, scenario) => {
  return `You are a professional sales coach AI helping a salesperson practice their skills. 

SCENARIO DETAILS:
- Product/Service: ${product}
- Customer Profile: ${customerProfile}
- Scenario: ${scenario || 'General sales conversation'}

YOUR ROLE:
You will act as the CUSTOMER in this sales roleplay...`;
};
```

## 🛡️ Error Handling

The API provides comprehensive error handling:

- **400**: Bad Request (missing required fields)
- **404**: Session not found
- **500**: Internal server error
- **503**: LM Studio server unavailable

## 📊 Session Management

Sessions are stored in memory with the following structure:

```javascript
sessions[sessionId] = [
  { role: 'system', content: 'System prompt...' },
  { role: 'user', content: 'User message' },
  { role: 'assistant', content: 'AI response' }
];

sessionContexts[sessionId] = {
  product: 'Product name',
  customerProfile: 'Customer description',
  scenario: 'Sales scenario',
  startTime: Date,
  messageCount: Number,
  lastActivity: Date
};
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## 📝 Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **body-parser**: Request body parsing
- **axios**: HTTP client for LM Studio API
- **uuid**: Session ID generation 