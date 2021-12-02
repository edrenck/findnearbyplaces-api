const db = require("./data/db");

const login = async (email, password) => {
  const response = await db.login(email, password);
  return {
    isValid: response.isValid,
    email: email,
    id: response.id.value,
  };
};

const register = async (email, password) => {
  email = email.toLowerCase();
  return db.register(email, password);
};

exports.login = login;
exports.register = register;
