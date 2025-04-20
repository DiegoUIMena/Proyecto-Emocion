import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Importar Firestore
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
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el nombre, correo y rol en Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
      });

      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    }
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