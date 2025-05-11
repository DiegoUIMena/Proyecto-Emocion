const validator = require("validator");

const validateUserData = (req, res, next) => {
  const { email, password, role, name } = req.body;

  // Validar email
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  // Validar contraseña
  if (!password || !validator.isLength(password, { min: 6, max: 20 })) {
    return res.status(400).json({ error: "La contraseña debe tener entre 6 y 20 caracteres" });
  }

  // Validar role
  const validRoles = ["Paciente", "Terapeuta", "Administrador"];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: "El rol no es válido" });
  }

  // Validar nombre
  if (!name || validator.isEmpty(name.trim())) {
    return res.status(400).json({ error: "El nombre no puede estar vacío" });
  }

  // Si todo es válido, continuar con la siguiente función
  next();
};

module.exports = { validateUserData };