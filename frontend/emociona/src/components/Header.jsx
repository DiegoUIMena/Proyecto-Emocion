import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Importar Firebase Auth
import styles from "../styles/Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const auth = getAuth(); // Inicializar la instancia de autenticación

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión con Firebase
      console.log("Sesión cerrada exitosamente.");
      navigate("/"); // Redirigir a la pantalla principal
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const goToProfile = () => {
    navigate("/profile"); // Redirigir a la pantalla de perfil del usuario
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1 onClick={() => navigate("/dashboard/patient")}>Emocion@</h1>
      </div>
      <nav className={styles.navButtons}>
        <button onClick={goToProfile} className={styles.iconButton}>
          <i className="fas fa-user-circle"></i> Perfil
        </button>
        <button onClick={handleLogout} className={styles.iconButton}>
          <i className="fas fa-sign-out-alt"></i> Salir
        </button>
      </nav>
    </header>
  );
};

export default Header;