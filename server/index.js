import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  if (!GEMINI_KEY || GEMINI_KEY === 'your_api_key_here') {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  try {
    const { history, systemPrompt } = req.body;

    const contents = history.map(m => ({
      role: m.role === 'leo' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          tools: [{
            functionDeclarations: [
              {
                name: "create_note",
                description: "Create a new note in the user's notebook. Provide a title, content, and comma-separated tags.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    content: { type: "STRING" },
                    tags: { type: "STRING", description: "comma separated tags" }
                  },
                  required: ["title", "content"]
                }
              },
              {
                name: "add_calendar_event",
                description: "Add an event to the user's calendar. Date must be YYYY-MM-DD, time HH:MM.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    desc: { type: "STRING" },
                    date: { type: "STRING", description: "YYYY-MM-DD" },
                    time: { type: "STRING", description: "HH:MM" }
                  },
                  required: ["name", "date", "time"]
                }
              },
              {
                name: "delete_calendar_event",
                description: "Delete an event from the user's calendar by its name.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" }
                  },
                  required: ["name"]
                }
              },
              {
                name: "start_focus_timer",
                description: "Start a focus timer for a specified duration in minutes.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    duration: { type: "NUMBER", description: "Duration in minutes" }
                  },
                  required: ["duration"]
                }
              }
            ]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    
    if (functionCall) {
      return res.json({ type: 'function', call: functionCall });
    }
    
    return res.json({ type: 'text', text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.' });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: error.message || 'Failed to call Gemini API' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
