import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, where, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { FaSmile, FaFrown, FaMeh, FaAngry, FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "../styles/PatientDashboard.module.css";
import Header from "../components/Header";
import { getAuth } from "firebase/auth";
import Notifications from "../components/Notifications";
import config from "../config";

const PatientDashboard = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const navigate = useNavigate();

  const lastEmotion = history.length > 0 ? history[0] : null;

  // Función para buscar la recomendación en Firestore
  const fetchRecommendationFromFirestore = async (notes) => {
    try {
      console.log("Buscando recomendación en Firestore para el texto:", notes);
      const q = query(
        collection(db, "RecomendationsIA"),
        where("userId", "==", user.uid),
        where("notes", "==", notes)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingRecommendation = querySnapshot.docs[0].data().recommendation;
        console.log("Recomendación encontrada en Firestore:", existingRecommendation);
        setRecommendation(existingRecommendation);
      } else {
        console.log("No se encontró una recomendación en Firestore.");
        setRecommendation("No se encontró una recomendación para este texto.");
      }
    } catch (error) {
      console.error("Error al buscar la recomendación en Firestore:", error);
      setRecommendation("Error al buscar la recomendación.");
    }
  };

  // Función para analizar emociones y generar recomendaciones
  const analyzeEmotion = async (text) => {
    try {
      console.log("Enviando texto al backend para analizar emociones:", text);
      const response = await fetch(`${config.backendUrl}/analyze-emotion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al analizar la emoción.");
      }

      const result = await response.json();
      console.log("Recomendación recibida del backend:", result.recommendation);

      setRecommendation(result.recommendation); // Actualizar la recomendación en el estado
    } catch (error) {
      console.error("Error al analizar la emoción:", error);
      setRecommendation("No se pudo generar una recomendación en este momento.");
    }
  };

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "EmotionalRecords"),
        where("userId", "==", user.uid),
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

  useEffect(() => {
    if (user && lastEmotion) {
      // Buscar la recomendación en Firestore al cargar el dashboard
      fetchRecommendationFromFirestore(lastEmotion.notes);
    }
  }, [user, lastEmotion]);

  return (
    <>
      <Header />
      <div className={styles.dashboardContainer}>
        <h1>Dashboard del Paciente</h1>
        {user && <Notifications userId={user.uid} />}
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