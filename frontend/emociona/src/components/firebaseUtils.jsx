import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";


// Función para actualizar el historial emocional en Firestore
// Esta función se llama cada vez que se registra una nueva emoción

const updateEmotionalHistory = async (userId, emotion) => {
  try {
    const historyRef = doc(db, "emotionalHistory", userId); // Documento del historial emocional del usuario
    const historyDoc = await getDoc(historyRef);

    if (historyDoc.exists()) {
      // Si el historial ya existe, actualiza el conteo de la emoción
      await updateDoc(historyRef, {
        [`summary.${emotion}`]: increment(1), // Incrementar el conteo de la emoción
        lastUpdated: serverTimestamp(), // Actualizar la fecha de la última modificación
      });
    } else {
      // Si no existe, crea un nuevo historial
      await setDoc(historyRef, {
        userId: userId,
        summary: {
          Feliz: 0,
          Triste: 0,
          Ansioso: 0,
          Enojado: 0,
          Relajado: 0,
          [emotion]: 1, // Inicializar el conteo de la emoción registrada
        },
        lastUpdated: serverTimestamp(), // Fecha de creación
      });
    }

    console.log("Historial emocional actualizado correctamente.");
  } catch (error) {
    console.error("Error al actualizar el historial emocional:", error);
  }
};

export { updateEmotionalHistory };



  // función para guardar notificaciones 
  export const saveNotification = async (userId, message) => {
    try {
      await addDoc(collection(db, "Notifications"), {
        userId,
        message,
        timestamp: Timestamp.now(),
        read: false,
      });
      console.log("Notificación guardada en Firestore.");
    } catch (error) {
      console.error("Error al guardar la notificación:", error);
    }
  };
