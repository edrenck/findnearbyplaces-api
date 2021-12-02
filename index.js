const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "API deploy successfully." });
});
