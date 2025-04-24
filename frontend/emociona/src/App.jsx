import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import TherapistDashboard from "./pages/TherapistDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterEmotion from "./pages/RegisterEmotion";
import HistoryPage from "./pages/HistoryPage";
import EmotionChart from "./pages/EmotionChart";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientProfile from "./pages/PatientProfile";
import { messaging, getToken } from "./firebaseConfig";
import { onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Asegúrate de que `db` esté correctamente configurado

// Importar react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // Solicitar permisos de notificaciones
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Permiso de notificaciones concedido.");
        } else {
          console.log("Permiso de notificaciones denegado.");
        }
      }
    };

    requestNotificationPermission();
  }, []);

  // Manejar notificaciones en primer plano
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Notificación recibida en primer plano:", payload);

      // Mostrar una notificación animada con react-toastify
      const { title, body } = payload.notification;
      toast.info(
        <div>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>,
        {
          position: "bottom-right", // Posición de la notificación
          autoClose: 5000, // Cerrar automáticamente después de 5 segundos
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    });

    return () => unsubscribe();
  }, []);

  // Registrar el Service Worker y obtener el token de notificación
useEffect(() => {
  const requestPermissionAndSaveToken = async () => {
    try {
      // Solicitar permisos de notificaciones
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Permiso de notificaciones denegado.");
        return;
      }

      // Registrar el Service Worker
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service Worker registrado:", registration);

      // Obtener el token de notificación
      const token = await getToken(messaging, {
        vapidKey: "BP0YRfMZwM-5AoJVgsi2d-ia0KpMiTTm5HBOgi6m_EUvTpdU8A5Io_PntAyZUyOmr02I6ywNr-u4cNSvpeeAZNs", // clave VAPID
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("Token de notificación:", token);

        // Esperar a que el usuario esté autenticado
        const auth = getAuth();
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            // Guardar el token en Firestore
            await setDoc(
              doc(db, "users", user.uid), // Guardar en la colección "users"
              { fcmToken: token }, // Actualizar el campo fcmToken
              { merge: true } // No sobrescribir otros datos del usuario
            );
            console.log("Token guardado en Firestore.");
          } else {
            console.log("No hay usuario autenticado.");
          }
        });
      } else {
        console.log("No se pudo obtener el token de notificación.");
      }
    } catch (error) {
      console.error("Error al registrar el Service Worker o guardar el token:", error);
    }
  };

  requestPermissionAndSaveToken();
}, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/therapist"
          element={
            <ProtectedRoute>
              <TherapistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register-emotion"
          element={
            <ProtectedRoute>
              <RegisterEmotion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emotion-chart"
          element={
            <ProtectedRoute>
              <EmotionChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* Contenedor de notificaciones */}
      <ToastContainer />
    </Router>
  );
}

export default App;