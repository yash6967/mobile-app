module.exports = {
  PORT: process.env.PORT || 5000,
  LLM_ENDPOINT: process.env.LLM_ENDPOINT || 'http://localhost:1234/v1/chat/completions',
  LLM_MODEL: process.env.LLM_MODEL || 'mistral-7b-instruct',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
}; 