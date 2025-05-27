# AI-Powered Sales Practice Tool

A comprehensive MERN stack application that helps salespeople practice and improve their skills through AI-powered roleplay conversations using LM Studio.

## 🚀 Features

### Core Functionality
- **AI-Powered Roleplay**: Practice sales conversations with an AI customer
- **Custom Context Setting**: Define product, customer profile, and scenarios
- **Session Management**: Start, update, and manage practice sessions
- **Performance Analysis**: Get detailed feedback on your sales performance
- **Voice Integration**: Speech-to-text input and text-to-speech output
- **Real-time Chat**: Smooth conversation flow with the AI customer

### Advanced Features
- **Dynamic Context Updates**: Change product or customer profile mid-session
- **Comprehensive Analysis**: 10-point performance evaluation covering:
  - Overall performance rating
  - Communication style assessment
  - Product knowledge evaluation
  - Objection handling analysis
  - Engagement and rapport building
  - Closing technique effectiveness
- **Session History**: Track conversation history and statistics
- **Modern UI**: Beautiful Material-UI interface with responsive design
- **Error Handling**: Robust error handling and user feedback

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **LM Studio API** integration for AI conversations
- **Axios** for HTTP requests
- **UUID** for session management
- **CORS** for cross-origin requests

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for modern UI components
- **Axios** for API communication
- **React Speech Recognition** for voice input
- **Web Speech API** for text-to-speech

### AI Integration
- **LM Studio** local AI server
- **OpenAI-compatible API** endpoints
- **Custom prompt engineering** for sales scenarios

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **LM Studio** installed and running
4. A compatible language model loaded in LM Studio

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sales-practice-ai
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. LM Studio Setup

1. **Download and Install LM Studio**
   - Visit [LM Studio website](https://lmstudio.ai/)
   - Download and install for your operating system

2. **Download a Model**
   - Open LM Studio
   - Go to the "Discover" tab
   - Download a recommended model (e.g., Mistral 7B Instruct, Llama 2 7B Chat)

3. **Start the Local Server**
   - Go to the "Local Server" tab in LM Studio
   - Load your downloaded model
   - Start the server (default: http://localhost:1234)
   - Ensure the server is running before starting the application

### 5. Configuration

The backend is pre-configured to work with LM Studio's default settings:
- **LM Studio Endpoint**: `http://localhost:1234/v1/chat/completions`
- **Default Model**: `mistral-7b-instruct`
- **Backend Port**: `5000`
- **Frontend Port**: `3000`

To modify these settings, edit `backend/config.js`:
```javascript
module.exports = {
  PORT: process.env.PORT || 5000,
  LLM_ENDPOINT: process.env.LLM_ENDPOINT || 'http://localhost:1234/v1/chat/completions',
  LLM_MODEL: process.env.LLM_MODEL || 'your-model-name',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
```

## 🚀 Running the Application

### 1. Start the Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Start the Frontend Application
```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### 3. Verify LM Studio Connection
- Ensure LM Studio is running with a model loaded
- Check the backend console for connection status
- Visit `http://localhost:5000/health` to verify the API is running

## 📖 Usage Guide

### Starting a Practice Session

1. **Configure Session Settings**
   - Click "Configure Session" or the settings icon
   - Enter the product/service you're selling
   - Describe your target customer profile
   - Optionally add a specific scenario

2. **Begin the Conversation**
   - Start with your opening message
   - The AI will respond as the customer
   - Continue the sales conversation naturally

3. **Use Voice Features** (Optional)
   - Click the microphone icon to use voice input
   - Click the speaker icon on AI messages to hear them read aloud

4. **Get Performance Analysis**
   - After having a conversation, click "Get Performance Analysis"
   - Review detailed feedback on your sales performance

### Example Session Configuration

**Product**: "Cloud-based CRM Software for Small Businesses"

**Customer Profile**: "Small business owner, 25-50 employees, currently using spreadsheets for customer management, budget-conscious but values efficiency, tech-savvy enough to adopt new tools"

**Scenario**: "Follow-up call after a product demo, customer expressed interest but has concerns about pricing and implementation time"

### API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/session/start` - Start a new practice session
- `POST /api/chat` - Send a message in the conversation
- `POST /api/session/analyze` - Get performance analysis
- `POST /api/session/update-context` - Update session context
- `GET /api/session/:sessionId/history` - Get conversation history
- `DELETE /api/session/:sessionId` - Delete a session
- `GET /api/sessions` - List all active sessions
- `GET /health` - Health check

## 🎯 Sales Practice Tips

### Effective Use of the Tool

1. **Start with Clear Objectives**
   - Define what specific skills you want to practice
   - Set realistic customer profiles based on your real prospects

2. **Practice Different Scenarios**
   - Cold calls vs. warm leads
   - Different objection types
   - Various customer personalities

3. **Use the Analysis Feature**
   - Review feedback after each session
   - Focus on one improvement area at a time
   - Practice the same scenario multiple times

4. **Leverage Voice Features**
   - Practice your tone and delivery
   - Get comfortable with natural conversation flow
   - Use voice input to simulate real phone calls

### Common Practice Scenarios

- **Cold Calling**: First-time outreach to prospects
- **Discovery Calls**: Understanding customer needs and pain points
- **Product Demos**: Presenting features and benefits
- **Objection Handling**: Addressing price, timing, or feature concerns
- **Closing Techniques**: Moving prospects to decision
- **Follow-up Conversations**: Nurturing leads through the sales cycle

## 🔧 Troubleshooting

### Common Issues

1. **LM Studio Connection Failed**
   - Ensure LM Studio is running and a model is loaded
   - Check that the server is started in LM Studio
   - Verify the endpoint URL in `backend/config.js`

2. **Voice Recognition Not Working**
   - Ensure you're using a supported browser (Chrome, Edge)
   - Check microphone permissions
   - Try refreshing the page

3. **Backend Server Won't Start**
   - Check if port 5000 is already in use
   - Verify all dependencies are installed (`npm install`)
   - Check the console for specific error messages

4. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for version compatibility issues
   - Ensure all peer dependencies are satisfied

### Performance Optimization

- **Model Selection**: Use smaller models (7B parameters) for faster responses
- **Session Management**: Clear old sessions periodically to free memory
- **Network**: Ensure stable connection between frontend and backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LM Studio** for providing an excellent local AI server solution
- **Material-UI** for the beautiful React components
- **OpenAI** for the API standard that enables easy integration

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the LM Studio documentation
3. Open an issue in the repository
4. Check that all prerequisites are properly installed

---

**Happy Selling! 🎯** Use this tool regularly to improve your sales skills and close more deals. 