import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!GEMINI_KEY });
});

// Main Gemini API proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, name, job } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!GEMINI_KEY) {
      return res.status(503).json({ 
        error: 'API key not configured on server',
        fallback: true 
      });
    }

    const systemPrompt = `You are Leo, an intelligent AI work assistant. The user's name is ${name || 'there'} and their job is: ${job}. Give concise, direct, genuinely helpful answers. Be specific, not vague. If you don't know something, say so. Format responses with **bold** for emphasis and \`code\` for technical terms.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';

    res.json({ success: true, text });
  } catch (error) {
    console.error('Chat API error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to get response from AI',
      fallback: true 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🦁 Leo server running on http://localhost:${PORT}`);
  console.log(`API key configured: ${!!GEMINI_KEY}`);
});
