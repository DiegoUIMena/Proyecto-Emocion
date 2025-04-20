import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDocs, collection, addDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de que este archivo esté configurado correctamente
import Header from "../components/Header";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "../styles/TherapistDashboard.module.css";

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TherapistDashboard = () => {
  const auth = getAuth(); // Obtener la instancia de autenticación
  const user = auth.currentUser; // Usuario autenticado (terapeuta)

  const [patients, setPatients] = useState([]); // Lista de pacientes
  const [selectedPatient, setSelectedPatient] = useState(null); // Paciente seleccionado
  const [emotionalRecords, setEmotionalRecords] = useState([]); // Registros emocionales del paciente seleccionado
  const [professionalComment, setProfessionalComment] = useState(""); // Comentario profesional

  // Cargar la lista de pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      const patientsCollection = collection(db, "users"); // Cambia "users" si la colección tiene otro nombre
      const patientsSnapshot = await getDocs(patientsCollection);
      const patientsList = patientsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((patient) => patient.role === "Paciente"); // Filtrar solo los usuarios con rol "Paciente"
      setPatients(patientsList);
    };

    fetchPatients();
  }, []);

  // Cargar los registros emocionales del paciente seleccionado
  useEffect(() => {
    if (selectedPatient) {
      const fetchEmotionalRecords = async () => {
        const q = query(
          collection(db, "EmotionalRecords"), // Cambiar a la colección correcta
          where("userId", "==", selectedPatient.id), // Filtrar por el ID del paciente seleccionado
          orderBy("timestamp", "desc"),
          limit(5) // Obtener los últimos 5 registros
        );
        const recordsSnapshot = await getDocs(q);
        const patientRecords = recordsSnapshot.docs.map((doc) => doc.data());
        setEmotionalRecords(patientRecords);
      };

      fetchEmotionalRecords();
    }
  }, [selectedPatient]);

  // Enviar recomendación personalizada
  const handleSendRecommendation = async () => {
    if (!selectedPatient || !professionalComment.trim()) {
      alert("Selecciona un paciente y escribe una recomendación válida.");
      return;
    }

    try {
      await addDoc(collection(db, "therapySessions"), {
        terapeutaId: user.uid, // ID del terapeuta autenticado
        id_paciente: selectedPatient.id, // ID del paciente seleccionado
        nombre_paciente: selectedPatient.name || "Paciente Anónimo", // Nombre del paciente
        fecha: new Date().toISOString(), // Fecha actual
        comentario: professionalComment.trim(), // Comentario profesional
      });
      alert("Recomendación enviada con éxito.");
      console.log("Recomendación enviada:");
      setProfessionalComment(""); // Limpiar el campo de texto
    } catch (error) {
      console.error("Error al enviar la recomendación:", error);
      alert("Hubo un error al enviar la recomendación.");
    }
  };

  // Configuración del gráfico de líneas
  const chartData = {
    labels: emotionalRecords.map((record) =>
      new Date(record.timestamp?.toDate()).toLocaleDateString()
    ), // Fechas de los registros
    datasets: [
      {
        label: "Nivel Emocional",
        data: emotionalRecords.map((record) => record.nivel_emocional || 0), // Valores emocionales
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Evolución Emocional",
      },
    },
  };

  return (
    <>
      <Header />
      <div className={styles.dashboardContainer}>
        <h1>Dashboard del Terapeuta</h1>
        <div className={styles.content}>
          {/* Lista de pacientes */}
          <div className={styles.patientsList}>
            <h2>Pacientes</h2>
            <ul>
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={
                    selectedPatient?.id === patient.id ? styles.selectedPatient : ""
                  }
                >
                  {patient.name || "Paciente Anónimo"}
                </li>
              ))}
            </ul>
          </div>

          {/* Registros emocionales y gráfico */}
          <div className={styles.patientDetails}>
            {selectedPatient ? (
              <>
                <h2>Registros de {selectedPatient.name}</h2>
                <ul className={styles.recordsList}>
                  {emotionalRecords.map((record, index) => (
                    <li key={index}>
                      <strong>Fecha:</strong> {new Date(record.timestamp?.toDate()).toLocaleString()}
                      <br />
                      <strong>Emoción:</strong> {record.emotion}
                      <br />
                      <strong>Notas:</strong> {record.notes || "Sin notas"}
                      <br />
                      <strong>Factores Externos:</strong> {record.externalFactors || "No especificados"}
                    </li>
                  ))}
                </ul>
                <div className={styles.chartContainer}>
                  <Line data={chartData} options={chartOptions} />
                </div>
                <textarea
                  className={styles.commentBox}
                  placeholder="Escribe una recomendación personalizada..."
                  value={professionalComment}
                  onChange={(e) => setProfessionalComment(e.target.value)}
                />
                <button
                  className={styles.sendButton}
                  onClick={handleSendRecommendation}
                >
                  Enviar Recomendación
                </button>
              </>
            ) : (
              <p>Selecciona un paciente para ver sus registros emocionales.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TherapistDashboard;