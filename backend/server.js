const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for sessions (in production, use Redis or database)
const sessions = {}; // Session ID to chat history mapping
const sessionContexts = {}; // Session ID to context mapping

// Helper function to create system prompt
const createSystemPrompt = (product, customerProfile, scenario) => {
  return `You are a professional sales coach AI helping a salesperson practice their skills. 

SCENARIO DETAILS:
- Product/Service: ${product}
- Customer Profile: ${customerProfile}
- Scenario: ${scenario || 'General sales conversation'}

YOUR ROLE:
You will act as the CUSTOMER in this sales roleplay. Simulate a realistic customer interaction based on the profile provided. You should:

1. Stay in character as the customer throughout the conversation
2. Ask relevant questions about the product/service
3. Raise realistic objections based on the customer profile
4. Show varying levels of interest and engagement
5. Challenge the salesperson appropriately
6. Provide realistic responses that help the salesperson practice

CUSTOMER BEHAVIOR GUIDELINES:
- Be realistic and authentic to the customer profile
- Don't make it too easy - provide appropriate challenges
- Ask questions that real customers would ask
- Express concerns or objections naturally
- Show interest when the salesperson makes good points
- Respond based on the customer's likely knowledge level and needs

Remember: You are the CUSTOMER, not the sales coach. The salesperson is practicing on you.`;
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sales Practice API is running' });
});

// Start a new chat session
app.post('/api/session/start', (req, res) => {
  const { product, customerProfile, scenario } = req.body;
  
  if (!product || !customerProfile) {
    return res.status(400).json({ 
      error: 'Product and customer profile are required' 
    });
  }

  const sessionId = uuidv4();
  const systemPrompt = createSystemPrompt(product, customerProfile, scenario);
  
  // Initialize session
  sessions[sessionId] = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  sessionContexts[sessionId] = {
    product,
    customerProfile,
    scenario,
    startTime: new Date(),
    messageCount: 0
  };

  res.json({ 
    sessionId,
    message: 'Session started successfully. You can now begin the sales conversation.',
    context: sessionContexts[sessionId]
  });
});

// Send message in chat
app.post('/api/chat', async (req, res) => {
  const { sessionId, userMessage } = req.body;

  if (!sessionId || !userMessage) {
    return res.status(400).json({ 
      error: 'Session ID and user message are required' 
    });
  }

  if (!sessions[sessionId]) {
    return res.status(404).json({ 
      error: 'Session not found. Please start a new session.' 
    });
  }

  // Add user message to session
  sessions[sessionId].push({ 
    role: 'user', 
    content: userMessage 
  });

  try {
    // Call LM Studio API
    const response = await axios.post(config.LLM_ENDPOINT, {
      model: config.LLM_MODEL,
      messages: sessions[sessionId],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const assistantReply = response.data.choices[0].message.content;
    
    // Add assistant response to session
    sessions[sessionId].push({ 
      role: 'assistant', 
      content: assistantReply 
    });

    // Update session context
    sessionContexts[sessionId].messageCount += 1;
    sessionContexts[sessionId].lastActivity = new Date();

    res.json({ 
      reply: assistantReply,
      sessionInfo: {
        messageCount: sessionContexts[sessionId].messageCount,
        sessionDuration: new Date() - sessionContexts[sessionId].startTime
      }
    });

  } catch (error) {
    console.error('LLM API Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'LM Studio server is not running. Please start LM Studio and load a model.' 
      });
    } else if (error.response) {
      res.status(error.response.status).json({ 
        error: `LLM API Error: ${error.response.data?.error || error.message}` 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to communicate with LLM. Please check your connection.' 
      });
    }
  }
});

// Update session context (change product, customer profile, or scenario)
app.post('/api/session/update-context', (req, res) => {
  const { sessionId, product, customerProfile, scenario } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Update context
  const context = sessionContexts[sessionId];
  if (product) context.product = product;
  if (customerProfile) context.customerProfile = customerProfile;
  if (scenario) context.scenario = scenario;

  // Create new system prompt with updated context
  const newSystemPrompt = createSystemPrompt(
    context.product, 
    context.customerProfile, 
    context.scenario
  );

  // Update the system message in the session
  sessions[sessionId][0] = {
    role: 'system',
    content: newSystemPrompt
  };

  res.json({ 
    message: 'Context updated successfully',
    context: sessionContexts[sessionId]
  });
});

// Get session analysis
app.post('/api/session/analyze', async (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const conversation = sessions[sessionId]
    .filter(msg => msg.role !== 'system')
    .map(msg => `${msg.role === 'user' ? 'Salesperson' : 'Customer'}: ${msg.content}`)
    .join('\n\n');

  const analysisPrompt = `You are an expert sales coach. Analyze this sales conversation and provide detailed feedback.

CONVERSATION:
${conversation}

CONTEXT:
- Product: ${sessionContexts[sessionId].product}
- Customer Profile: ${sessionContexts[sessionId].customerProfile}
- Scenario: ${sessionContexts[sessionId].scenario || 'General sales conversation'}

Please provide a comprehensive analysis covering:

1. **Overall Performance** (1-10 rating)
2. **Strengths** - What the salesperson did well
3. **Areas for Improvement** - Specific areas to work on
4. **Communication Style** - Tone, clarity, professionalism
5. **Product Knowledge** - How well they demonstrated understanding
6. **Objection Handling** - How they addressed customer concerns
7. **Engagement & Rapport** - Connection with the customer
8. **Closing Technique** - Effectiveness of closing attempts
9. **Specific Recommendations** - Actionable advice for improvement
10. **Key Takeaways** - Main lessons from this practice session

Be constructive, specific, and provide actionable feedback that will help improve their sales skills.`;

  try {
    const response = await axios.post(config.LLM_ENDPOINT, {
      model: config.LLM_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert sales coach providing detailed feedback on sales conversations.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    res.json({ 
      analysis: response.data.choices[0].message.content,
      sessionStats: {
        duration: new Date() - sessionContexts[sessionId].startTime,
        messageCount: sessionContexts[sessionId].messageCount,
        context: sessionContexts[sessionId]
      }
    });

  } catch (error) {
    console.error('Analysis Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate analysis. Please try again.' 
    });
  }
});

// Get session history
app.get('/api/session/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const history = sessions[sessionId]
    .filter(msg => msg.role !== 'system')
    .map((msg, index) => ({
      id: index,
      role: msg.role,
      content: msg.content,
      timestamp: new Date()
    }));

  res.json({ 
    history,
    context: sessionContexts[sessionId]
  });
});

// Delete session
app.delete('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    delete sessionContexts[sessionId];
    res.json({ message: 'Session deleted successfully' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Get all active sessions (for debugging)
app.get('/api/sessions', (req, res) => {
  const activeSessions = Object.keys(sessions).map(sessionId => ({
    sessionId,
    context: sessionContexts[sessionId],
    messageCount: sessions[sessionId].length - 1 // Exclude system message
  }));

  res.json({ activeSessions });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/session/start',
      'POST /api/chat',
      'POST /api/session/update-context',
      'POST /api/session/analyze',
      'GET /api/session/:sessionId/history',
      'DELETE /api/session/:sessionId',
      'GET /api/sessions',
      'GET /health'
    ]
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Sales Practice API Server running on http://localhost:${config.PORT}`);
  console.log(`📡 LM Studio endpoint: ${config.LLM_ENDPOINT}`);
  console.log(`🤖 Using model: ${config.LLM_MODEL}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/session/start - Start new practice session`);
  console.log(`   POST /api/chat - Send message in conversation`);
  console.log(`   POST /api/session/analyze - Get conversation analysis`);
  console.log(`   GET /health - Health check`);
});

module.exports = app; 