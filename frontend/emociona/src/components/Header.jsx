import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Importar Firebase Auth
import { doc, getDoc } from "firebase/firestore"; // Importar Firestore
import { db } from "../firebaseConfig"; // Importar configuración de Firebase
import styles from "../styles/Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const auth = getAuth(); // Inicializar la instancia de autenticación
  const [role, setRole] = useState(null); // Estado para almacenar el rol del usuario

  // Obtener el rol del usuario autenticado
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Guardar el rol del usuario
        }
      }
    };
    fetchUserRole();
  }, []);

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

  const goToDashboard = () => {
    // Redirigir al panel correspondiente según el rol del usuario
    if (role === "Terapeuta") {
      navigate("/dashboard/therapist");
    } else if (role === "Paciente") {
      navigate("/dashboard/patient");
    } else if (role === "Administrador") {
      navigate("/dashboard/admin");
    } else {
      console.error("Rol desconocido. No se puede redirigir.");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1 onClick={goToDashboard}>Emocion@</h1>
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