import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de que este archivo esté configurado correctamente
import Header from "../components/Header";
import styles from "../styles/PatientProfile.module.css";
import CameraCapture from "../components/CameraCapture";

const PatientProfile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    role: "Paciente",
    name: "",
    email: "",
    edad: "",
    foto: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false); // Estado para controlar la cámara

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setFormData(userSnapshot.data());
          setPreviewImage(userSnapshot.data().foto || "");
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, formData);
      console.log("Datos actualizados:", formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "emociona_preset"); // Reemplaza con tu upload_preset
      formData.append("cloud_name", "dxhhihdso"); // Reemplaza con tu cloud_name
  
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dxhhihdso/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
  
        const data = await response.json();
        const imageUrl = data.secure_url; // URL de la imagen subida
  
        // Actualiza solo el campo 'foto' sin sobrescribir los demás campos
        setPreviewImage(imageUrl);
        setFormData((prevFormData) => ({
          ...prevFormData,
          foto: imageUrl,
        }));
      } catch (error) {
        console.error("Error al subir la imagen a Cloudinary:", error);
      }
    }
  };

  const handleTakeSelfie = () => {
    setIsCameraOpen(true); // Abre la cámara
  };

  const handleCapture = async (imageData) => {
    try {
      const formData = new FormData();
      formData.append("file", imageData);
      formData.append("upload_preset", "emociona_preset"); // Reemplaza con tu upload_preset
      formData.append("cloud_name", "dxhhihdso"); // Reemplaza con tu cloud_name
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dxhhihdso/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      const data = await response.json();
      const imageUrl = data.secure_url; // URL de la imagen subida
  
      setPreviewImage(imageUrl); // Muestra la imagen como previsualización
      setFormData((prevFormData) => ({
        ...prevFormData,
        foto: imageUrl, // Guarda la URL en el estado
      }));
    } catch (error) {
      console.error("Error al subir la imagen a Cloudinary:", error);
    }
  
    setIsCameraOpen(false); // Cierra la cámara
  };

  return (
    <>
      <Header />
      <div className={styles.profileContainer}>
        <h1>Configuración de Perfil</h1>
        <form className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label htmlFor="role">Rol:</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role || ""}
              disabled
              readOnly
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edad">Edad:</label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="foto">Foto:</label>
            {previewImage && <img src={previewImage} alt="Foto de perfil" className={styles.profileImage} />}
            {isEditing && (
              <>
                <input type="file" id="foto" accept="image/*" onChange={handleImageUpload} />
                <button type="button" onClick={handleTakeSelfie} className={styles.selfieButton}>
                  Tomar Selfie
                </button>
              </>
            )}
          </div>
          <div className={styles.buttonGroup}>
            {isEditing ? (
              <button type="button" onClick={handleSave} className={styles.saveButton}>
                Guardar
              </button>
            ) : (
              <button type="button" onClick={handleEditToggle} className={styles.editButton}>
                Editar
              </button>
            )}
          </div>
        </form>
        {isCameraOpen && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
      </div>
    </>
  );
};

export default PatientProfile;