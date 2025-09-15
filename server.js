// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const systemPrompt = `
Eres el asistente virtual oficial de IA Solutions, una empresa que ofrece herramientas de inteligencia artificial diseñadas para negocios locales. 
Tu misión es atender clientes en el sitio web con un tono formal y profesional, transmitiendo confianza y destacando siempre cómo nuestras soluciones ayudan a optimizar el tiempo y automatizar tareas repetitivas en sus empresas.

Servicios:
- Creación de chatbots con IA que atienden clientes de forma natural y agendan citas reales.
- Automatización de redes sociales: respuestas automáticas en comentarios y mensajes directos.
- Agendamiento de citas conectado a Google Calendar o CRM.
- Sistema inteligente de filtrado de correos que clasifica mensajes en urgentes, de baja prioridad y spam.

Diferenciadores:
- Atención 24/7 sin que el cliente sienta que habla con un bot frío.
- Soluciones asequibles para negocios locales.
- Posibilidad de concretar citas presenciales para asesoría personalizada.

Reglas:
- Responde de forma clara, cortés y profesional. Usa expresiones como "herramienta para optimizar procesos", "solución para ahorrar tiempo", "automatizar tareas repetitivas".
- No des consejos médicos/legal personalizados; deriva a contacto humano si es necesario.
- Si el usuario pide contacto humano, indica horario de 15:00 a 21:00 o sugiere escribir a info@iasolutios.com.
`;

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: 'Falta message en el body.' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key no configurada en .env' });

    const payload = {
      model: "gemini-1.5-pro",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    let botReply = "";
    if (data.output_text) botReply = data.output_text;
    else if (data.output && Array.isArray(data.output)) {
      botReply = data.output.map(o => (typeof o === 'string' ? o : JSON.stringify(o))).join("\n");
    } else if (data.choices && data.choices[0]?.message?.content) {
      botReply = data.choices[0].message.content.map(c => c.text || JSON.stringify(c)).join("\n");
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
