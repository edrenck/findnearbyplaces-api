const express = require("express");
const api = require("./api");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    console.log("Inside local strategy callback");
    api
      .login(email, password)
      .then((x) => {
        console.log(x);
        if (x.isValid) {
          let user = { id: x.id, email: email };
          console.log(user);
          return done(null, user);
        } else {
          console.log("The email or password is not valid.");
          return done(null, false, "The email or password was invalid");
        }
      })
      .catch((e) => {
        console.log(e);
        return done(e);
      });
  })
);

passport.serializeUser((user, done) => {
  console.log(
    "Inside serializeUser callback. User id is save to the session file store here"
  );
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  console.log("Inside deserializeUser callback");
  console.log(`The user id passport saved in the session file store is: ${id}`);
  const user = { id: id };
  done(null, user);
});

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use(
  session({
    genid: (request) => {
      //console.log(request);
      console.log("Inside session middleware genid function");
      console.log(`Request object sessionID from client: ${request.sessionID}`);

      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: "some random string",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.post("/customer", (req, res) => {
  let email = req.body.email;
  let password = String(req.body.password);

  api
    .register(email, password)
    .then((x) => response.json({ message: "Customer added.", done: true }))
    .catch((e) => {
      console.log(e);
      res
        .status(403)
        .json({ message: "Customer already exists.", done: false });
    });
});

app.post("/login", (request, response, next) => {
  console.log("Inside POST /login callback");
  passport.authenticate("local", (err, user, info) => {
    console.log("Inside passport.authenticate() callback");
    console.log(
      `req.session.passport: ${JSON.stringify(request.session.passport)}`
    );
    console.log(`req.user: ${JSON.stringify(request.user)}`);
    request.login(user, (err) => {
      console.log("Inside req.login() callback");
      console.log(
        `req.session.passport: ${JSON.stringify(request.session.passport)}`
      );
      console.log(`req.user: ${JSON.stringify(request.user)}`);
      return response.json({ done: true, message: "The customer logged in." });
    });
  })(request, response, next);
});

app.listen(port, () => console.log(`Express started on port ${port}`));
