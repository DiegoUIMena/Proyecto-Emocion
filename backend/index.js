require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Ruta para analizar emociones
app.post("/analyze-emotion", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "El texto es requerido." });
  }

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/tabularisai/multilingual-sentiment-analysis",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    console.log("Respuesta completa del modelo:", response.data);

    // Desanidar la respuesta
    const predictions = response.data[0]; // Extraer el array interno

    // Validar la estructura de la respuesta
    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
      console.error("Respuesta inválida del modelo:", response.data);
      return res.status(500).json({ error: "Error al procesar la respuesta del modelo." });
    }

    // Seleccionar la etiqueta con la puntuación más alta
    const highestScoreLabel = predictions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    ).label;

    if (!highestScoreLabel) {
      console.error("No se pudo determinar la etiqueta con mayor puntuación:", predictions);
      return res.status(500).json({ error: "No se pudo determinar la emoción." });
    }

    console.log("Etiqueta seleccionada:", highestScoreLabel);

    // Mapear el sentimiento detectado a emociones específicas
    const emotion = mapSentimentToEmotion(highestScoreLabel);

    // Generar una recomendación basada en la emoción detectada
    const recommendation = generateRecommendation(emotion);

    res.json({ emotion, recommendation });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("Modelo no encontrado:", error.message);
      return res.status(404).json({ error: "El modelo no está disponible. Verifica la URL." });
    }
    if (error.response && error.response.status === 503) {
      console.error("El modelo está ocupado:", error.message);
      return res.status(503).json({ error: "El modelo está ocupado. Intenta nuevamente más tarde." });
    }
    console.error("Error al analizar la emoción:", error.message);
    res.status(500).json({ error: "Error al analizar la emoción." });
  }
});

// Función para mapear sentimientos a emociones
const mapSentimentToEmotion = (sentiment) => {
  switch (sentiment.toLowerCase()) {
    case "very positive":
      return "Muy Feliz";
    case "positive":
      return "Feliz";
    case "neutral":
      return "Relajado"; // Personalización: "Neutral" se mapea a "Relajado"
    case "negative":
      return "Ansioso"; // Personalización: "Negative" se mapea a "Ansioso"
    case "very negative":
      return "Muy Triste";
    default:
      return "Neutral";
  }
};

// Función para generar recomendaciones predefinidas
const generateRecommendation = (emotion) => {
  switch (emotion) {
    case "Muy Feliz":
      return "Comparte tu felicidad con los demás y sigue disfrutando.";
    case "Feliz":
      return "Sigue haciendo lo que te hace feliz. ¡Mantén esa energía positiva!";
    case "Relajado":
      return "Disfruta de este momento de tranquilidad y sigue cuidando tu bienestar.";
    case "Ansioso":
      return "Practica técnicas de relajación como la respiración profunda o meditación.";
    case "Triste":
      return "Realiza una actividad que disfrutes para mejorar tu estado de ánimo.";
    case "Muy Triste":
      return "Habla con alguien de confianza o busca apoyo profesional.";
    default:
      return "No se pudo generar una recomendación.";
  }
};

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});