const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./utility/fbAuth");

const { getAllShouts, postOneShout } = require("./handlers/shouts");
const { signup, login } = require("./handlers/users");

// routes for shouts
app.get("/shouts", getAllShouts);
app.post("/shout", FBAuth, postOneShout);

// routes for users
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.https.onRequest(app);
