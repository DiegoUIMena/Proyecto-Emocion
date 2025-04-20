import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Importar configuración automática de Chart.js
import styles from "../styles/EmotionChart.module.css";
import Header from "../components/Header";
import { getAuth } from "firebase/auth";

const EmotionChart = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [doughnutChartData, setDoughnutChartData] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "EmotionalRecords"),
        where("userId", "==", user.uid), // Filtrar por el ID del usuario autenticado
        orderBy("timestamp", "asc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const EmotionalRecords = snapshot.docs.map((doc) => ({
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        }));

        // Procesar datos para el gráfico de líneas
        const labels = EmotionalRecords.map((entry) =>
          new Date(entry.timestamp).toLocaleDateString()
        );
        const emotionCounts = {
          Feliz: 0,
          Triste: 0,
          Ansioso: 0,
          Enojado: 0,
          Relajado: 0,
        };

        const datasets = [
          {
            label: "Feliz",
            data: EmotionalRecords.map((entry) =>
              entry.emotion === "Feliz" ? 1 : 0
            ),
            borderColor: "#FFB74D",
            backgroundColor: "rgba(255, 183, 77, 0.2)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Triste",
            data: EmotionalRecords.map((entry) =>
              entry.emotion === "Triste" ? 1 : 0
            ),
            borderColor: "#64B5F6",
            backgroundColor: "rgba(100, 181, 246, 0.2)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Ansioso",
            data: EmotionalRecords.map((entry) =>
              entry.emotion === "Ansioso" ? 1 : 0
            ),
            borderColor: "#FFD54F",
            backgroundColor: "rgba(255, 213, 79, 0.2)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Enojado",
            data: EmotionalRecords.map((entry) =>
              entry.emotion === "Enojado" ? 1 : 0
            ),
            borderColor: "#E57373",
            backgroundColor: "rgba(229, 115, 115, 0.2)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Relajado",
            data: EmotionalRecordss.map((entry) =>
              entry.emotion === "Relajado" ? 1 : 0
            ),
            borderColor: "#81C784",
            backgroundColor: "rgba(129, 199, 132, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ];

        // Contar emociones para el gráfico circular
        EmotionalRecords.forEach((entry) => {
          if (emotionCounts[entry.emotion] !== undefined) {
            emotionCounts[entry.emotion]++;
          }
        });

        setLineChartData({
          labels,
          datasets,
        });

        setDoughnutChartData({
          labels: Object.keys(emotionCounts),
          datasets: [
            {
              data: Object.values(emotionCounts),
              backgroundColor: [
                "#FFB74D",
                "#64B5F6",
                "#FFD54F",
                "#E57373",
                "#81C784",
              ],
            },
          ],
        });
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <>
      <Header />
      <div className={styles.chartContainer}>
        <h1>Evolución Emocional</h1>
        {lineChartData ? (
          <div className={styles.lineChart}>
            <Line data={lineChartData} />
          </div>
        ) : (
          <p>Cargando datos del gráfico de líneas...</p>
        )}
        {doughnutChartData ? (
          <div className={styles.doughnutChart}>
            <Doughnut data={doughnutChartData} />
          </div>
        ) : (
          <p>Cargando datos del gráfico circular...</p>
        )}
      </div>
    </>
  );
};

export default EmotionChart;