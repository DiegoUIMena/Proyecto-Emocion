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

  // Funciones de validación personalizadas
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPassword = (password) => password.length >= 6 && password.length <= 20;
  const isEmpty = (value) => value.trim() === "";

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validar email
    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un email válido.");
      return;
    }

    // Validar contraseña
    if (!isValidPassword(password)) {
      setError("La contraseña debe tener entre 6 y 20 caracteres.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Validar rol
    const validRoles = ["Paciente", "Terapeuta"];
    if (!role || !validRoles.includes(role)) {
      setError("Por favor, selecciona un rol válido.");
      return;
    }

    // Validar nombre
    if (isEmpty(name)) {
      setError("El nombre no puede estar vacío.");
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
    </div>
  );
};

export default RegisterPage;