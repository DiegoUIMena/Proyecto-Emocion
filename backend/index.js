require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("./config/firebaseAdmin");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // clave desde el archivo .env
});

// Ruta para la raíz
app.get("/", (req, res) => {
  res.send("Servidor de Emocion@ funcionando......OK");
});

// Ruta para analizar emociones usando OpenAI
app.post("/analyze-emotion", async (req, res) => {
  const { text, userId, emotion } = req.body;

  if (!text || !userId || !emotion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    const db = admin.firestore();
    const recommendationsRef = db.collection("RecomendationsIA");

    const querySnapshot = await recommendationsRef
      .where("userId", "==", userId)
      .where("notes", "==", text)
      .get();

    if (!querySnapshot.empty) {
      const existingRecommendation = querySnapshot.docs[0].data().recommendation;
      return res.json({ recommendation: existingRecommendation });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente que analiza emociones y genera recomendaciones." },
        { role: "user", content: `Analiza la emoción del siguiente texto y genera una recomendación breve: "${text}"` },
      ],
    });

    const fullResponse = completion.choices[0]?.message?.content || "";

    await recommendationsRef.add({
      emotion,
      notes: text,
      userId,
      recommendation: fullResponse,
      timestamp: admin.firestore.Timestamp.now(),
    });

    res.json({ recommendation: fullResponse });
  } catch (error) {
    res.status(500).json({ error: "Error al analizar la emoción." });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});