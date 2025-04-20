import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, where, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { FaSmile, FaFrown, FaMeh, FaAngry, FaLeaf } from "react-icons/fa"; // Importar íconos
import styles from "../styles/HistoryPage.module.css";
import Header from "../components/Header";
import { getAuth } from "firebase/auth";


const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [emotionalHistory, setEmotionalHistory] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

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
        setFilteredHistory(EmotionalRecords);
      });

      return () => unsubscribe();
    }
  }, [user]);

// Cargar el historial emocional del usuario desde Firestore
  useEffect(() => {
    if (user) {
      const fetchEmotionalHistory = async () => {
        const historyRef = doc(db, "emotionalHistory", user.uid);
        const historyDoc = await getDoc(historyRef);
  
        if (historyDoc.exists()) {
          console.log("Historial emocional:", historyDoc.data());
          setEmotionalHistory(historyDoc.data());
        } else {
          console.log("No se encontró un historial emocional para este usuario.");
        }
      };
  
      fetchEmotionalHistory();
    }
  }, [user]);


  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    const now = new Date();
    let filtered = history;

    if (value === "today") {
      filtered = history.filter((entry) => {
        const entryDate = new Date(entry.timestamp.toDate());
        return entryDate.toDateString() === now.toDateString();
      });
    } else if (value === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = history.filter((entry) => {
        const entryDate = new Date(entry.timestamp.toDate());
        return entryDate >= oneWeekAgo;
      });
    } else if (value === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = history.filter((entry) => {
        const entryDate = new Date(entry.timestamp.toDate());
        return entryDate >= oneMonthAgo;
      });
    }

    setFilteredHistory(filtered);
  };

  // Función para obtener el ícono según la emoción
  const getEmotionIcon = (emotion, size = "1.5rem") => {
    const iconStyles = { fontSize: size, verticalAlign: "middle", marginRight: "10px" };
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


  return (
    <>
      <Header />
      <div className={styles.historyContainer}>
        <h1>Historial de Registros</h1>
        <div className={styles.historySummary}>
          <h2>Resumen del Historial Emocional</h2>
          {emotionalHistory && emotionalHistory.summary ? (
            <ul>
              {Object.entries(emotionalHistory.summary).map(([emotion, count]) => (
                <li key={emotion}>
                  {getEmotionIcon(emotion)} <strong>{emotion}:</strong> {count}
                </li>
           ))}
          </ul>
       ) : (
          <p>No hay datos disponibles.</p>
      )}
      </div>
        <label>
          Filtrar por:
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">Todos</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </label>
        <ul>
          {filteredHistory.map((entry) => (
            <li key={entry.id} className={styles.historyItem}>
              {getEmotionIcon(entry.emotion)} <strong>{entry.emotion}</strong> - {entry.notes} <br />
              <em>Factores externos: {entry.externalFactors}</em> <br />
              <small>{new Date(entry.timestamp.toDate()).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default HistoryPage;