# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- **Node.js** (v16+): [Download here](https://nodejs.org/)
- **LM Studio**: [Download here](https://lmstudio.ai/)

### 2. Install Dependencies
```bash
# Install all dependencies (root, backend, frontend)
npm run install-all
```

### 3. Setup LM Studio
1. Open LM Studio
2. Go to "Discover" tab and download a model (recommended: Mistral 7B Instruct)
3. Go to "Local Server" tab
4. Load your downloaded model
5. Click "Start Server" (should start on http://localhost:1234)

### 4. Start the Application

#### Option A: Use the startup script (Windows)
```bash
start.bat
```

#### Option B: Use npm scripts
```bash
# Start both servers simultaneously
npm start

# Or start them separately
npm run start:backend    # Backend on http://localhost:5000
npm run start:frontend   # Frontend on http://localhost:3000
```

### 5. Open the Application
Visit `http://localhost:3000` in your browser

## 🎯 First Practice Session

1. Click "Configure Session"
2. Enter:
   - **Product**: "CRM Software"
   - **Customer Profile**: "Small business owner, 30-50 employees, currently using spreadsheets"
   - **Scenario**: "Product demo follow-up call"
3. Click "Start Session"
4. Begin with: "Hi John, thanks for taking the time for our demo yesterday. I wanted to follow up and see if you had any questions."

## 🔧 Troubleshooting

### LM Studio Not Connected
- Ensure LM Studio is running with a model loaded
- Check that the server is started (green indicator)
- Verify the endpoint: http://localhost:1234

### Port Already in Use
- Backend (5000): Change `PORT` in `backend/config.js`
- Frontend (3000): React will automatically suggest port 3001

### Voice Features Not Working
- Use Chrome or Edge browser
- Allow microphone permissions
- Ensure HTTPS or localhost

## 📱 Features to Try

- **Voice Input**: Click the microphone icon to speak your messages
- **Text-to-Speech**: Click the speaker icon on AI responses
- **Performance Analysis**: Get detailed feedback after conversations
- **Context Updates**: Change product/customer mid-session
- **Multiple Scenarios**: Practice different sales situations

## 🎓 Practice Tips

1. **Start Simple**: Begin with basic product introductions
2. **Handle Objections**: Practice common objections like price, timing, features
3. **Use Analysis**: Review feedback and focus on improvement areas
4. **Vary Scenarios**: Try cold calls, demos, follow-ups, closing calls
5. **Voice Practice**: Use voice features to practice tone and delivery

---

**Need Help?** Check the main README.md for detailed documentation. 