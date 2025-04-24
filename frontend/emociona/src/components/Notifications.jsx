import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import styles from "../styles/Notifications.module.css";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Consulta para obtener solo las notificaciones no leídas
    const q = query(
      collection(db, "Notifications"),
      where("userId", "==", userId),
      where("read", "==", false) // Filtrar solo las no leídas
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Notificaciones no leídas obtenidas:", data); // Depuración
      setNotifications(data); // Actualizar el estado solo con las no leídas
    });

    return () => unsubscribe();
  }, [userId]);

  const unreadCount = notifications.length; // Contar solo las no leídas

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "Notifications", notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log(`Notificación ${notificationId} marcada como leída.`);

      // Actualizar el estado local para eliminar la notificación marcada como leída
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error al marcar la notificación como leída:", error);
    }
  };

  return (
    <div>
      <button
        className={styles.notificationsButton}
        onClick={() => setIsModalOpen(true)}
      >
        Notificaciones{" "}
        {unreadCount > 0 && (
          <span className={styles.unreadCount}>{unreadCount}</span>
        )}
      </button>

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
                  onClick={() => markAsRead(notification.id)}
                >
                  <p><strong>Mensaje:</strong> {notification.message}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;