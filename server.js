// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar fetch para Node.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Prompt genérico, puedes dejar que el HTML de cada cliente lo especifique luego
const systemPrompt = `
Eres un asistente virtual profesional.
Responde de forma clara, cortés y profesional.
Si el usuario pide contacto humano, indica horario de 15:00 a 21:00 o sugiere escribir a info@cliente.com.
`;

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: 'Falta message en el body.' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key no configurada en .env' });

    const payload = {
      model: "gpt-3.5-turbo", // Aquí está el cambio a GPT-3.5
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    let botReply = "";
    if (data.choices && data.choices[0]?.message?.content) {
      botReply = data.choices[0].message.content;
    } else {
      botReply = JSON.stringify(data).slice(0, 1000);
    }

    return res.json({ reply: botReply });
  } catch (err) {
    console.error("Error /chat:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
