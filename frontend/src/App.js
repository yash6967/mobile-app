import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  // State management
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [product, setProduct] = useState('');
  const [customerProfile, setCustomerProfile] = useState('');
  const [scenario, setScenario] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  // Voice recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Text-to-speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const chatContainerRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  // Handle voice input
  useEffect(() => {
    if (transcript && !listening) {
      setInput(transcript);
      resetTranscript();
    }
  }, [transcript, listening, resetTranscript]);

  // Text-to-speech function
  const speak = (text) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Start new session
  const startSession = async () => {
    if (!product.trim() || !customerProfile.trim()) {
      setError('Please provide both product and customer profile to start a session.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/session/start`, {
        product: product.trim(),
        customerProfile: customerProfile.trim(),
        scenario: scenario.trim() || undefined
      });

      setSessionId(response.data.sessionId);
      setSessionInfo(response.data.context);
      setIsSessionStarted(true);
      setChat([]);
      setAnalysis('');
      setSettingsOpen(false);

      // Add welcome message
      setChat([{
        role: 'system',
        content: `Session started! You're now practicing selling "${product}" to a customer with this profile: "${customerProfile}". ${scenario ? `Scenario: ${scenario}` : ''} Start the conversation!`
      }]);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start session. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError('');

    // Add user message to chat immediately
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        sessionId,
        userMessage
      });

      const aiReply = response.data.reply;
      
      // Add AI response to chat
      setChat(prev => [...prev, { role: 'ai', content: aiReply }]);
      
      // Update session info
      if (response.data.sessionInfo) {
        setSessionInfo(prev => ({
          ...prev,
          ...response.data.sessionInfo
        }));
      }

      // Auto-speak AI response if enabled
      // speak(aiReply);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
      // Remove the user message if sending failed
      setChat(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // Get conversation analysis
  const getAnalysis = async () => {
    if (!sessionId || chat.length < 2) {
      setError('Please have a conversation before requesting analysis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/session/analyze`, {
        sessionId
      });

      setAnalysis(response.data.analysis);
      setAnalysisOpen(true);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update session context
  const updateContext = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/session/update-context`, {
        sessionId,
        product: product.trim(),
        customerProfile: customerProfile.trim(),
        scenario: scenario.trim() || undefined
      });

      setSessionInfo(prev => ({
        ...prev,
        product: product.trim(),
        customerProfile: customerProfile.trim(),
        scenario: scenario.trim()
      }));

      setSettingsOpen(false);
      setError('');
    } catch (err) {
      setError('Failed to update context.');
    } finally {
      setLoading(false);
    }
  };

  // Reset session
  const resetSession = () => {
    setSessionId(null);
    setIsSessionStarted(false);
    setChat([]);
    setAnalysis('');
    setSessionInfo(null);
    setError('');
    stopSpeaking();
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Voice recognition controls
  const startListening = () => {
    if (browserSupportsSpeechRecognition) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <ChatIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1" color="primary">
              Sales Practice AI
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Session Settings">
              <IconButton onClick={() => setSettingsOpen(true)} color="primary">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            {isSessionStarted && (
              <Tooltip title="Reset Session">
                <IconButton onClick={resetSession} color="secondary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Session Info */}
        {sessionInfo && (
          <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Session
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Product:</Typography>
                  <Typography variant="body1">{sessionInfo.product}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Customer Profile:</Typography>
                  <Typography variant="body1">{sessionInfo.customerProfile}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Scenario:</Typography>
                  <Typography variant="body1">{sessionInfo.scenario || 'General sales conversation'}</Typography>
                </Grid>
              </Grid>
              {sessionInfo.messageCount > 0 && (
                <Box mt={2}>
                  <Chip 
                    label={`${sessionInfo.messageCount} messages exchanged`} 
                    size="small" 
                    color="primary" 
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        {isSessionStarted ? (
          <Grid container spacing={3}>
            {/* Chat Messages */}
            <Grid item xs={12}>
              <Paper 
                ref={chatContainerRef}
                className="chat-container"
                sx={{ 
                  height: 400, 
                  overflow: 'auto', 
                  p: 2, 
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                {chat.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="text.secondary">
                      Start the conversation by typing your opening message...
                    </Typography>
                  </Box>
                ) : (
                  chat.map((message, index) => (
                    <Box
                      key={index}
                      className={`message ${message.role}`}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        maxWidth: '80%',
                        ...(message.role === 'user' ? {
                          bgcolor: 'primary.main',
                          color: 'white',
                          ml: 'auto',
                          textAlign: 'right'
                        } : message.role === 'ai' ? {
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          mr: 'auto'
                        } : {
                          bgcolor: 'info.50',
                          color: 'info.main',
                          textAlign: 'center',
                          maxWidth: '100%'
                        })
                      }}
                    >
                      <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>
                        {message.role === 'user' ? 'You (Salesperson)' : 
                         message.role === 'ai' ? 'Customer' : 'System'}
                      </Typography>
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      {message.role === 'ai' && (
                        <Box mt={1}>
                          <Tooltip title="Read aloud">
                            <IconButton 
                              size="small" 
                              onClick={() => speak(message.content)}
                              disabled={isSpeaking}
                            >
                              <VolumeUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Message Input */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} alignItems="flex-end">
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={loading}
                  variant="outlined"
                />
                
                {/* Voice Controls */}
                {browserSupportsSpeechRecognition && (
                  <Box className="voice-controls">
                    <Tooltip title={listening ? "Stop recording" : "Start voice input"}>
                      <IconButton
                        color={listening ? "secondary" : "primary"}
                        onClick={listening ? stopListening : startListening}
                        className={listening ? "recording" : ""}
                        disabled={loading}
                      >
                        {listening ? <MicOffIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    {isSpeaking && (
                      <Tooltip title="Stop speaking">
                        <IconButton color="secondary" onClick={stopSpeaking}>
                          <VolumeUpIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}

                <Button
                  variant="contained"
                  endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </Box>
            </Grid>

            {/* Analysis Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={getAnalysis}
                  disabled={loading || chat.length < 2}
                  size="large"
                >
                  Get Performance Analysis
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          /* Session Setup */
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Start a New Sales Practice Session
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Configure your practice scenario and begin improving your sales skills with AI-powered roleplay.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setSettingsOpen(true)}
              startIcon={<SettingsIcon />}
            >
              Configure Session
            </Button>
          </Box>
        )}
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isSessionStarted ? 'Update Session Settings' : 'Configure New Session'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product/Service"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g., CRM Software, Life Insurance, Marketing Services"
                  helperText="What are you selling?"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Customer Profile"
                  value={customerProfile}
                  onChange={(e) => setCustomerProfile(e.target.value)}
                  placeholder="e.g., Small business owner, 35-45 years old, tech-savvy, budget-conscious, looking to improve efficiency"
                  helperText="Describe your target customer"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Scenario (Optional)"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="e.g., Cold call, Follow-up meeting, Product demo, Handling price objections"
                  helperText="Specific sales scenario to practice"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          {isSessionStarted ? (
            <Button onClick={updateContext} variant="contained" disabled={loading}>
              Update Session
            </Button>
          ) : (
            <Button onClick={startSession} variant="contained" disabled={loading}>
              Start Session
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={analysisOpen} onClose={() => setAnalysisOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Performance Analysis</DialogTitle>
        <DialogContent>
          <Box className="analysis-container">
            {analysis ? (
              <Typography className="analysis-content" variant="body1">
                {analysis}
              </Typography>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App; 