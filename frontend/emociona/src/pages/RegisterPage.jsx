import React, { useState } from "react";
import { auth, db, messaging, getToken } from "../firebaseConfig"; // Importar Firebase Messaging
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Para guardar el rol en Firestore
import styles from "../styles/AuthPages.module.css";

const RegisterPage = () => {
  const [name, setName] = useState(""); // Estado para el nombre
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(""); // Estado para el rol seleccionado
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!role) {
      setError("Por favor selecciona un rol");
      return;
    }
    if (!name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    // Mostrar el modal si el rol es "Paciente"
    if (role === "Paciente") {
      setShowModal(true);
      return;
    }

    // Proceder con el registro si no es "Paciente"
    await completeRegistration();
  };

  const completeRegistration = async () => {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el token de notificación
      const token = await getToken(messaging, {
        vapidKey: "BP0YRfMZwM-5AoJVgsi2d-ia0KpMiTTm5HBOgi6m_EUvTpdU8A5Io_PntAyZUyOmr02I6ywNr-u4cNSvpeeAZNs", // Reemplaza con tu clave VAPID
      });

      if (!token) {
        console.error("No se pudo obtener el token de notificación.");
        setError("No se pudo registrar el token de notificación.");
        return;
      }

      // Guardar el nombre, correo, rol y token en Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        fcmToken: token, // Guardar el token de notificación
      });

      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccept = async () => {
    setShowModal(false);
    await completeRegistration(); // Proceder con el registro
  };

  const handleReject = () => {
    setShowModal(false);
    alert("Debes aceptar los términos para registrarte.");
    window.location.href = "/"; // Redirigir a la página principal
  };

  return (
    <div className={styles.registerContainer}>
      <h1>Registro</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div className={styles.roleSelection}>
          <label>
            <input
              type="radio"
              name="role"
              value="Paciente"
              checked={role === "Paciente"}
              onChange={(e) => setRole(e.target.value)}
            />
            Paciente
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="Terapeuta"
              checked={role === "Terapeuta"}
              onChange={(e) => setRole(e.target.value)}
            />
            Terapeuta
          </label>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
      </p>

      {/* Modal para consentimiento */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
          <h2>Consentimiento Informado para el Uso de Datos Emocionales</h2>
      <p>
        En <strong>Emocion@</strong>, nos comprometemos a proteger su privacidad y garantizar la seguridad de sus datos emocionales. Antes de continuar con el registro, le solicitamos que lea y acepte los siguientes términos:
      </p>
      <h3>Finalidad del Tratamiento de Datos</h3>
      <p>
        Sus datos emocionales serán recopilados y procesados exclusivamente con fines terapéuticos, para brindarle un seguimiento adecuado y recomendaciones personalizadas. Estos datos solo serán accesibles para terapeutas autorizados.
      </p>
      <h3>Legislación Aplicable</h3>
      <p>
        El tratamiento de sus datos se realizará de acuerdo con la legislación chilena, incluyendo:
      </p>
      <ul>
        <li><strong>Ley 19.496:</strong> Protección de los derechos de los consumidores.</li>
        <li><strong>Ley 20.584:</strong> Regula los derechos y deberes de los pacientes.</li>
        <li><strong>Ley 19.733:</strong> Protección a la privacidad, en cuanto a la recolección de datos personales en línea.</li>
      </ul>
      <h3>Derechos del Paciente</h3>
      <p>
        Usted tiene derecho a:
      </p>
      <ul>
        <li>Acceder, corregir o eliminar sus datos emocionales en cualquier momento.</li>
        <li>Oponerse al tratamiento de sus datos personales.</li>
      </ul>
      <h3>Seguridad de los Datos</h3>
      <p>
        Sus datos serán encriptados y almacenados con estrictas medidas de seguridad para garantizar su confidencialidad.
      </p>
      <h3>Política de Privacidad</h3>
      <p>
        Para más información, puede consultar nuestra <a href="/privacy-policy" target="_blank">Política de Privacidad</a> y nuestros <a href="/terms-and-conditions" target="_blank">Términos y Condiciones</a>.
      </p>
            <div className={styles.modalActions}>
              <button onClick={handleAccept}>Aceptor</button>
              <button onClick={handleReject}>Rechazor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;