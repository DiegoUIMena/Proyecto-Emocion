import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Importar Firestore
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Para obtener el rol del usuario
import styles from "../styles/AuthPages.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el rol del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // Redirigir al Dashboard correspondiente según el rol
        if (role === "Paciente") {
          window.location.href = "/dashboard/patient";
        } else if (role === "Terapeuta") {
          window.location.href = "/dashboard/therapist";
        } else if (role === "Administrador") {
          window.location.href = "/dashboard/admin";
        } else {
          setError("Rol no válido. Contacta al administrador.");
        }
      } else {
        setError("No se encontró información del usuario.");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
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
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p>
        ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
      </p>
    </div>
  );
};

export default LoginPage;