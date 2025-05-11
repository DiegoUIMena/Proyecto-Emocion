require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("./config/firebaseAdmin");
const OpenAI = require("openai");
const { validateUserData } = require("./middlewares/validationMiddleware"); // Importar el middleware

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
app.post("/analyze-emotion", validateUserData, async (req, res) => {
  const { text, userId, emotion } = req.body; // Recibimos también el userId
  console.log("Texto recibido:", text);
  console.log("UserID recibido:", userId);
  console.log("Emoción recibida:", emotion);

  try {
    // Verificar si ya existe una recomendación en Firestore
    const db = admin.firestore();
    const recommendationsRef = db.collection("RecomendationsIA");
    console.log("Buscando recomendación en Firestore...");
    const querySnapshot = await recommendationsRef
      .where("userId", "==", userId)
      .where("notes", "==", text)
      .get();

    if (!querySnapshot.empty) {
      // Si ya existe una recomendación, devolverla directamente
      const existingRecommendation = querySnapshot.docs[0].data().recommendation;
      console.log("Recomendación existente encontrada en Firestore:", existingRecommendation);
      return res.json({ recommendation: existingRecommendation });
    }

    // Si no existe una recomendación, llamar a OpenAI
    console.log("No se encontró recomendación en Firestore. Llamando a OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo de OpenAI
      messages: [
        { role: "system", content: "Eres un asistente que analiza emociones y genera recomendaciones." },
        { role: "user", content: `Analiza la emoción del siguiente texto y solamente genera una recomendación muy breve (máximo 20 palabras): "${text}"` },
      ],
    });

    // Extraer la respuesta completa del modelo
    const fullResponse = completion.choices[0]?.message?.content || "";
    console.log("Respuesta completa de OpenAI:", fullResponse);

    // Guardar la recomendación en Firestore
    console.log("Guardando recomendación en Firestore...");
    await recommendationsRef.add({
      emotion,
      notes: text,
      userId,
      recommendation: fullResponse, // Guardar la respuesta completa
      timestamp: admin.firestore.Timestamp.now(),
    });
    console.log("Recomendación guardada en Firestore.");

    res.json({ recommendation: fullResponse }); // Devuelve la recomendación
  } catch (error) {
    console.error("Error al analizar la emoción:", error.message);
    res.status(500).json({ error: "Error al analizar la emoción." });
  }
});

// Ruta para enviar notificaciones push
app.post("/send-notification", async (req, res) => {
  const { token, message } = req.body;

  console.log("Datos recibidos para enviar notificación:", { token, message });

  if (!token || !message) {
    return res.status(400).json({ error: "El token y el mensaje son requeridos." });
  }

  try {
    const messageId = await admin.messaging().send({
      token,
      notification: {
        title: "Nueva Notificación",
        body: message,
      },
    });

    console.log("Notificación enviada con éxito:", {
      token,
      message,
      messageId,
    });

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error("Error al enviar la notificación:", error);

    // Manejar el error de token no registrado
    if (error.errorInfo && error.errorInfo.code === "messaging/registration-token-not-registered") {
      console.log("El token de notificación no está registrado. Eliminándolo de la base de datos...");
      const db = admin.firestore();
      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("fcmToken", "==", token).get();
      snapshot.forEach(async (doc) => {
        await doc.ref.update({ fcmToken: admin.firestore.FieldValue.delete() });
        console.log(`Token inválido eliminado para el usuario: ${doc.id}`);
      });
    }

    res.status(500).json({ error: "Error al enviar la notificación.", details: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});