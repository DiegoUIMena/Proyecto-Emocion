import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Importar Firestore
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "../styles/AuthPages.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  // Función para esperar un tiempo determinado (retraso)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Función para obtener el rol del usuario con reintentos
  const getUserRoleWithRetries = async (uid, retries = 3, delayMs = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role) {
            return userData.role; // Retorna el rol si está definido
          }
        }
      } catch (error) {
        console.error(`Intento ${i + 1} fallido al obtener el rol:`, error);
      }
      await delay(delayMs); // Esperar antes de intentar nuevamente
    }
    throw new Error("No se pudo obtener el rol del usuario después de varios intentos.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar el estado de error antes de intentar iniciar sesión
    setLoading(true); // Mostrar indicador de carga

    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el rol del usuario con reintentos
      const role = await getUserRoleWithRetries(user.uid);

      // Redirigir al Dashboard correspondiente según el rol
      if (role === "Paciente") {
        window.location.href = "/dashboard/patient";
      } else if (role === "Terapeuta") {
        window.location.href = "/dashboard/therapist";
      } else if (role === "Administrador") {
        window.location.href = "/dashboard/admin";
      } else {
        throw new Error("Rol no válido. Contacta al administrador.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err.message);
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
      <p>
        ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
      </p>
    </div>
  );
};

export default LoginPage;