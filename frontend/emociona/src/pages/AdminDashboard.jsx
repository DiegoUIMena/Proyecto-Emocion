import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import Header from "../components/Header";
import styles from "../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [activities, setActivities] = useState([]); // Registro de actividades
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [systemMessage, setSystemMessage] = useState(""); // Mensaje global del sistema

  // Cargar la lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  // Cargar el registro de actividades
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activitiesCollection = collection(db, "activities");
        const activitiesSnapshot = await getDocs(activitiesCollection);
        const activitiesList = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivities(activitiesList);
      } catch (error) {
        console.error("Error al cargar actividades:", error);
      }
    };

    fetchActivities();
  }, []);

  // Eliminar un usuario
  const handleDeleteUser = async (userId, userName) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter((user) => user.id !== userId));
        await addDoc(collection(db, "activities"), {
          action: `Usuario eliminado: ${userName}`,
          timestamp: new Date().toISOString(),
        });
        alert("Usuario eliminado con éxito.");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Hubo un error al eliminar el usuario.");
      }
    }
  };

  // Enviar mensaje global del sistema
  const handleSendSystemMessage = async () => {
    if (!systemMessage.trim()) {
      alert("Por favor, escribe un mensaje.");
      return;
    }

    try {
      await addDoc(collection(db, "systemMessages"), {
        message: systemMessage.trim(),
        timestamp: new Date().toISOString(),
      });
      alert("Mensaje enviado con éxito.");
      setSystemMessage(""); // Limpiar el campo de texto
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert("Hubo un error al enviar el mensaje.");
    }
  };

  // Filtrar usuarios por rol
  const therapists = users.filter((user) => user.role === "Terapeuta");
  const patients = users.filter((user) => user.role === "Paciente");

  return (
    <>
      <Header />
      <div className={styles.adminContainer}>
        <h1>Dashboard del Administrador</h1>
        <p>Gestiona usuarios, configuraciones y actividades del sistema.</p>

        {/* Estadísticas del sistema */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <h3>Total de Usuarios</h3>
            <p>{users.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pacientes</h3>
            <p>{patients.length}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Terapeutas</h3>
            <p>{therapists.length}</p>
          </div>
        </div>

        {/* Configuración del sistema */}
        <div className={styles.configContainer}>
          <h2>Configuración del Sistema</h2>
          <textarea
            value={systemMessage}
            onChange={(e) => setSystemMessage(e.target.value)}
            placeholder="Escribe un mensaje global para los usuarios..."
            className={styles.messageBox}
          />
          <button onClick={handleSendSystemMessage} className={styles.sendButton}>
            Enviar Mensaje
          </button>
        </div>

        {/* Registro de actividades */}
        <div className={styles.activitiesContainer}>
          <h2>Registro de Actividades</h2>
          <ul>
            {activities.map((activity) => (
              <li key={activity.id} className={styles.activityItem}>
                <strong>{activity.action}</strong> <br />
                <small>{new Date(activity.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>

        {/* Lista de usuarios */}
        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <div className={styles.usersList}>
            <h2>Usuarios Registrados</h2>

            {/* Lista de terapeutas */}
            <h3>Terapeutas</h3>
            <ul>
              {therapists.map((user) => (
                <li key={user.id} className={styles.userItem}>
                  <strong>{user.name || "Usuario Anónimo"}</strong> - {user.email}
                  <div className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteUser(user.id, user.name)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Lista de pacientes */}
            <h3>Pacientes</h3>
            <ul>
              {patients.map((user) => (
                <li key={user.id} className={styles.userItem}>
                  <strong>{user.name || "Usuario Anónimo"}</strong> - {user.email}
                  <div className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteUser(user.id, user.name)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;