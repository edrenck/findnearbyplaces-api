require("dotenv").config({ path: "./data/.env" });
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const connectionString = `postgres://${process.env.DATABASEUSERNAME}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.DATABASEPORT}/${process.env.DATABASE}`;

const connection = {
  connectionString: process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : connectionString,
  ssl: { rejectUnauthorized: false },
};
const pool = new Pool(connection);

const login = async (email, password) => {
  const result = await pool.query(
    `select id,password from yelp.customer where email = '${email.toLowerCase()}'`
  );
  if (result.rows.length > 0) {
    const hashedPassword = result.rows[0].password;
    return {
      isValid: await bcrypt.compare(password, hashedPassword),
      id: result.rows[0].id,
      name: result.rows[0].name,
    };
  }
  return { isValid: false };
};

const register = (email, password) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return pool.query(
    "insert into yelp.customer(email, password) values ($1, $2)",
    [email.toLowerCase(), hashedPassword]
  );
};

exports.login = login;
exports.register = register;
