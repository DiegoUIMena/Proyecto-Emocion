import React from "react";
import styles from "../styles/HomePage.module.css"; // Importar como módulo



const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <header>
        <h1 className={styles.headerTitle}>Emocion@</h1>
      </header>
      <p className={styles.introText}>
        Transformá tus emociones en bienestar. Una guía para vos y tu terapeuta.
      </p>
     
      <main>
        <button
          className={styles.btn}
          onClick={() => (window.location.href = "/login")}
        >
          Iniciar Sesión
        </button>
        <button
          className={styles.btn}
          onClick={() => (window.location.href = "/register")}
        >
          Registrarse
        </button>
      </main>
    </div>
  );
};

export default HomePage;