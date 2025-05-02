import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import styles from "../styles/Notifications.module.css";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]); // Estado para las notificaciones no leídas
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal

  // Obtener notificaciones no leídas del usuario
  useEffect(() => {
    if (!userId) return;

    console.log("Valor de userId:", userId); // Depuración del valor de userId

    // Consulta para obtener todas las notificaciones no leídas del usuario
    const q = query(
      collection(db, "Notifications"),
      where("id_paciente", "==", userId), // Filtrar por el ID del paciente
      where("read", "==", false) // Solo notificaciones no leídas
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log("No se encontraron notificaciones no leídas para este paciente.");
        setNotifications([]); // Limpiar el estado si no hay resultados
        return;
      }

      // Mapear las notificaciones no leídas
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento en Firestore
        ...doc.data(), // Datos de la notificación
      }));

      console.log("Notificaciones no leídas obtenidas:", notificationsData); // Depuración
      setNotifications(notificationsData); // Actualizar el estado con las notificaciones no leídas
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, [userId]);

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "Notifications", notificationId); // Apuntar al documento en Firestore
      await updateDoc(notificationRef, { read: true }); // Actualizar el campo `read` en Firestore

      // Actualizar el estado local para eliminar la notificación marcada como leída
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );

      console.log(`Notificación ${notificationId} marcada como leída.`);
    } catch (error) {
      console.error("Error al marcar la notificación como leída:", error);
    }
  };

  const unreadCount = notifications.length; // Contar las notificaciones no leídas

  return (
    <div>
      {/* Botón para abrir el modal de notificaciones */}
      <button
        className={styles.notificationsButton}
        onClick={() => setIsModalOpen(true)}
      >
        Notificaciones{" "}
        {unreadCount > 0 && (
          <span className={styles.unreadCount}>{unreadCount}</span>
        )}
      </button>

      {/* Modal de notificaciones */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Notificaciones</h2>
            <button
              className={styles.closeButton}
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </button>
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={styles.unread}
                  onClick={() => markAsRead(notification.id)} // Marcar como leída al hacer clic
                >
                  <p><strong>Mensaje:</strong> {notification.comentario}</p>
                  <p><small>Enviado: {new Date(notification.fecha).toLocaleString()}</small></p>
                </li>
              ))}
            </ul>
            {notifications.length === 0 && <p>No tienes notificaciones no leídas.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;