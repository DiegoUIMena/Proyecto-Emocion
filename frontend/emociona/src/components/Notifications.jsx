import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import styles from "../styles/Notifications.module.css";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("Valor de userId:", userId); // Depuración del valor de userId

    // Consulta para obtener todas las notificaciones no leídas del usuario
    const q = query(
      collection(db, "Notifications"),
      where("id_paciente", "==", userId), // Filtrar por el ID del paciente
      where("read", "==", false) // Solo notificaciones no leídas
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No se encontraron sesiones de terapia para este paciente.");
        setNotifications([]); // Asegúrate de limpiar el estado si no hay resultados
        return;
      }

      const notificationsData = await Promise.all(
        snapshot.docs.map(async (sessionDoc) => { // Cambiar el nombre del parámetro para evitar conflicto
          const data = sessionDoc.data();
          console.log("Documento obtenido:", data); // Depuración

          // Verificar el estado de lectura en la colección Notifications
          if (data.notificationId) {
            const notificationRef = doc(db, "Notifications", data.notificationId);
            const notificationSnap = await getDoc(notificationRef);

            if (notificationSnap.exists() && !notificationSnap.data().read) {
              return {
                id: sessionDoc.id, // ID del documento en therapySessions
                comentario: data.comentario || "Sin comentario", // Obtener el comentario
                fecha: data.fecha, // Obtener el campo `fecha` (cadena)
                notificationId: data.notificationId, // ID relacionado en Notifications
              };
            }
          }
          return null;
        })
      );

      // Filtrar valores nulos (notificaciones leídas o sin notificationId)
      const filteredNotifications = notificationsData.filter(Boolean);

      console.log("Notificaciones no leídas obtenidas:", filteredNotifications); // Depuración
      setNotifications(filteredNotifications); // Actualizar el estado con las notificaciones no leídas
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    console.log("Notificaciones actualizadas:", notifications); // Depuración
  }, [notifications]);

  const unreadCount = notifications.length; // Contar las notificaciones
  console.log("Cantidad de notificaciones no leídas:", unreadCount); // Depuración

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "Notifications", notificationId); // Apuntar a la colección Notifications
      await updateDoc(notificationRef, { read: true }); // Actualizar el campo `read` en Firestore

      // Actualizar el estado local para eliminar la notificación
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.notificationId !== notificationId)
      );

      console.log(`Notificación ${notificationId} marcada como leída.`);
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
                  onClick={() => markAsRead(notification.notificationId)} // Usar notificationId para actualizar en Notifications
                >
                  <p><strong>Mensaje:</strong> {notification.comentario}</p>
                  <p><small>Enviado: {new Date(notification.fecha).toLocaleString()}</small></p>
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