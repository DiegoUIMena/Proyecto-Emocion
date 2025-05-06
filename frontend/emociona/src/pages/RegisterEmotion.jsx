import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import styles from "../styles/RegisterEmotion.module.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAuth } from "firebase/auth"; // Importar Firebase Auth
import { updateEmotionalHistory } from "../components/firebaseUtils"; // Importar la función para actualizar el historial emocional
import config from "../config"; // Importar la configuración del backend


const RegisterEmotion = () => {
  const [emotion, setEmotion] = useState("");
  const [notes, setNotes] = useState("");
  const [externalFactors, setExternalFactors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  
const handleSubmit = async (e) => {
  e.preventDefault();
  const auth = getAuth(); // Obtener la instancia de autenticación
  const user = auth.currentUser; // Usuario autenticado

  try {
    // Guardar el registro emocional en Firestore
    await addDoc(collection(db, "EmotionalRecords"), {
      emotion: emotion,
      notes: notes,
      externalFactors: externalFactors,
      timestamp: Timestamp.now(),
      userId: user.uid, // Guardar el ID del usuario autenticado
    });

    // Llamar al backend para analizar el texto y generar una recomendación
    console.log("Llamando al backend para analizar el texto...");
    const response = await fetch(`${config.backendUrl}/analyze-emotion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: notes, userId: user.uid, emotion: emotion  }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al analizar la emoción.");
    }

    const result = await response.json();
    console.log("Recomendación generada por OpenAI:", result.recommendation);



      // Actualizar el historial emocional
    await updateEmotionalHistory(user.uid, emotion);
    console.log("Usuario:", user.uid);
    console.log("Emoción:", emotion);

    // Mostrar mensaje de éxito
    setSuccessMessage("Estado emocional registrado con éxito.");
    setEmotion("");
    setNotes("");
    setExternalFactors("");
    setTimeout(() => navigate("/dashboard/patient"), 2000); // Redirigir al Dashboard después de 2 segundos
  } catch (error) {
    console.error("Error al registrar el estado emocional: ", error);
  }
  };

  return (
    <>
      <Header />
    <div className={styles.registerContainer}>
      <h1>Registrar Estado Emocional</h1>
      <form onSubmit={handleSubmit} className={styles.emotionForm}>
        <label>
          ¿Cómo te sientes hoy?
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            required
          >
            <option value="">Selecciona una emoción</option>
            <option value="Feliz">Feliz</option>
            <option value="Triste">Triste</option>
            <option value="Ansioso">Ansioso</option>
            <option value="Enojado">Enojado</option>
            <option value="Relajado">Relajado</option>
          </select>
        </label>
        <label>
          Notas adicionales:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe algo sobre cómo te sientes..."
          ></textarea>
        </label>
        <label>
          Factores externos:
          <textarea
            value={externalFactors}
            onChange={(e) => setExternalFactors(e.target.value)}
            placeholder="Escribe los factores externos que influyen en tu estado..."
          ></textarea>
        </label>
        <button type="submit">Registrar</button>
      </form>
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
    </div>
    </>
  );
};

export default RegisterEmotion;