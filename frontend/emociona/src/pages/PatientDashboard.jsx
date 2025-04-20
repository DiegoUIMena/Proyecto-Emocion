import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, where, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { FaSmile, FaFrown, FaMeh, FaAngry, FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "../styles/PatientDashboard.module.css";
import Header from "../components/Header";
import { getAuth } from "firebase/auth"; // Importar Firebase Auth

const PatientDashboard = () => {
  const auth = getAuth(); // Obtener la instancia de autenticación
  const user = auth.currentUser; // Usuario autenticado
  
  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null); // Estado para la recomendación
  const navigate = useNavigate();

  const lastEmotion = history.length > 0 ? history[0] : null;

  
  // Se envia al backend para el analisis de emociones
  const analyzeEmotion = async (text) => {
    try {
      const response = await fetch("http://localhost:5000/analyze-emotion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al analizar la emoción.");
      }
  
      // Guardar la recomendación en Firestore
      const result = await response.json();
      console.log("Emoción detectada:", result.emotion);
      console.log("Recomendación generada:", result.recommendation);

     
    if (user) {
      // Verificar si ya existe una recomendación para este usuario y texto
      const q = query(
        collection(db, "RecomendationsIA"),
        where("userId", "==", user.uid),
        where("notes", "==", text)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Si no existe, guardar la recomendación
        await addDoc(collection(db, "RecomendationsIA"), {
          emotion: result.emotion,
          notes: text, // El texto analizado
          userId: user.uid, // ID del usuario autenticado
          recommendation: result.recommendation,
          timestamp: Timestamp.now(), // Fecha y hora actual
        });
        console.log("Recomendación guardada en Firestore.");
      } else {
        console.log("La recomendación ya existe en Firestore. No se guardará nuevamente.");
      }
    }


      setRecommendation(result.recommendation); // Actualizar la recomendación en el estado
      return result.emotion; // Retorna la emoción detectada
    } catch (error) {
      console.error("Error al analizar la emoción:", error);
      setRecommendation("No se pudo generar una recomendación en este momento.");
      return "Error";
    }
  };



  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "EmotionalRecords"),
        where("userId", "==", user.uid), // Filtrar por el ID del usuario autenticado
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const EmotionalRecords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(EmotionalRecords);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const getEmotionIcon = (emotion, size = "3rem") => {
    const iconStyles = { fontSize: size, verticalAlign: "middle" };
    switch (emotion) {
      case "Feliz":
        return <FaSmile style={{ ...iconStyles, color: "green" }} />;
      case "Triste":
        return <FaFrown style={{ ...iconStyles, color: "blue" }} />;
      case "Ansioso":
        return <FaMeh style={{ ...iconStyles, color: "orange" }} />;
      case "Enojado":
        return <FaAngry style={{ ...iconStyles, color: "red" }} />;
      case "Relajado":
        return <FaLeaf style={{ ...iconStyles, color: "teal" }} />;
      default:
        return null;
    }
  };


  
  // Flujo completo en el frontend
  const handleEmotionAnalysisAndRecommendation = async (notes) => {
    await analyzeEmotion(notes); // Analizar emoción y actualizar la recomendación
  };





  useEffect(() => {
    if (lastEmotion) {
      handleEmotionAnalysisAndRecommendation(lastEmotion.notes);
    }
  }, [lastEmotion]);



  return (
    <>
      <Header />
      <div className={styles.dashboardContainer}>
        <h1>Dashboard del Paciente</h1>
        {lastEmotion && (
          <div className={styles.lastEmotionContainer}>
            <div className={styles.lastEmotionIcon}>
              {getEmotionIcon(lastEmotion.emotion, "5rem")}
            </div>
            <div className={styles.lastEmotionDetails}>
              <strong>{lastEmotion.emotion}</strong>
              <p>{lastEmotion.notes}</p>
              <small>
                {new Date(lastEmotion.timestamp.toDate()).toLocaleString()}
              </small>
            </div>
          </div>
        )}
        <button
          className={styles.registerButton}
          onClick={() => navigate("/register-emotion")}
        >
          Registrar Estado Emocional
        </button>
        <button
          className={styles.historyButton}
          onClick={() => navigate("/history")}
        >
          Historial de Registro
        </button>
        <button
          className={styles.chartButton}
          onClick={() => navigate("/emotion-chart")}
        >
          Gráfico Evolutivo Emocional
        </button>
        {recommendation && (
          <div className={styles.recommendationContainer}>
            <h2>Recomendación</h2>
            <p>{recommendation}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PatientDashboard;