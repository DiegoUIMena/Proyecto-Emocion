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
  const doughnutChartOptions = {
    maintainAspectRatio: false, // Permitir que el tamaño sea controlado por el CSS
  };

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

        // Asignar valores numéricos a las emociones
        const emotionValues = {
          Feliz: 5,
          Relajado: 4,
          Ansioso: 3,
          Triste: 2,
          Enojado: 1,
        };

        // Procesar datos para el gráfico de líneas
        const labels = EmotionalRecords.map((entry) =>
          new Date(entry.timestamp).toLocaleDateString()
        );
        const data = EmotionalRecords.map((entry) => emotionValues[entry.emotion] || 0);

        setLineChartData({
          labels,
          datasets: [
            {
              label: "Nivel Emocional",
              data,
              borderColor: "#4caf50",
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        });

        // Contar emociones para el gráfico circular
        const emotionCounts = {
          Feliz: 0,
          Triste: 0,
          Ansioso: 0,
          Enojado: 0,
          Relajado: 0,
        };

        EmotionalRecords.forEach((entry) => {
          if (emotionCounts[entry.emotion] !== undefined) {
            emotionCounts[entry.emotion]++;
          }
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

  // Configuración del gráfico de líneas
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Evolución Emocional",
      },
    },
    scales: {
      y: {
        min: 0, // Valor mínimo del eje Y
        max: 6, // Valor máximo del eje Y (mayor que el valor máximo de las emociones)
        ticks: {
          stepSize: 1, // Incrementos en el eje Y
        },
        title: {
          display: true,
          text: "Nivel Emocional",
        },
      },
      x: {
        title: {
          display: true,
          text: "Fecha",
        },
      },
    },
  };

  return (
    <>
      <Header />
      <div className={styles.chartContainer}>
        <h1>Evolución Emocional</h1>
        {lineChartData ? (
          <div className={styles.lineChart}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        ) : (
          <p>Cargando datos del gráfico de líneas...</p>
        )}

        {/* Valores de referencia de las emociones */}
        <div className={styles.emotionReference}>
          <h2>Valores de Referencia de las Emociones</h2>
          <ul>
            <li><strong>Feliz:</strong> 5</li>
            <li><strong>Relajado:</strong> 4</li>
            <li><strong>Ansioso:</strong> 3</li>
            <li><strong>Triste:</strong> 2</li>
            <li><strong>Enojado:</strong> 1</li>
          </ul>
        </div>

        {doughnutChartData ? (
  <div className={styles.doughnutChart}>
    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
    
  </div>
) : (
  <p>Cargando datos del gráfico circular...</p>
)}
      </div>
    </>
  );
};

export default EmotionChart;