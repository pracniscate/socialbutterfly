const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

// initialize firebase app so that users can authenticate through it
const firebaseConfig = {
  apiKey: "AIzaSyBAsa3Jf3oj2hq1e3XYlMaeT-4v60yQPXQ",
  authDomain: "socialbutterfly-e5ca3.firebaseapp.com",
  databaseURL: "https://socialbutterfly-e5ca3.firebaseio.com",
  projectId: "socialbutterfly-e5ca3",
  storageBucket: "socialbutterfly-e5ca3.appspot.com",
  messagingSenderId: "480914195099",
  appId: "1:480914195099:web:365653109b41a2b8b97c3e"
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/shouts", (req, res) => {
  db.collection("shouts")
    // show the latest shout first
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let shouts = [];
      data.forEach(doc => {
        shouts.push({
          shoutId: doc.id,
          // node6 doesn't support the spread operator
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(shouts);
    })
    .catch(err => console.error(err));
});

const FBAuth = (req, res, next) => {
  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found.')
    return res.status(403).json({ error: 'Unauthorized'});
  }

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db.collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error('Error verifying token ', err);
      return res.status(403).json(err);
    })
}

// function to create documents
app.post("/shout", FBAuth, (req, res) => {
  // do not allow empty shouts
  if (req.body.body.trim() === ""){
    return res.status(400).json({ body: 'cannot post an empty message '});
  }
  // initialize shout
  const newShout = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };

  // persist into database
  db.collection("shouts")
    .add(newShout)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` })
        .stringify;
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

// determine if the string is empty
const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

// check if email is valid
const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

// signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};

  // if email is blank
  if (isEmpty(newUser.email)) {
    errors.email = "must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "must be a valid address";
  }

  // if password is blank
  if (isEmpty(newUser.password)) errors.password = "must not be empty";
  // do passwords match?
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "passwords must match";
  // if handle is blank
  if (isEmpty(newUser.handle)) errors.handle = "must not be empty";

  // make sure the error object is empty!
  // if there are any errors:
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  // validate data
  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      // persist credentials into the users collection
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

// LOGIN ROUTE

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  // validations
  let errors = {};

  if (isEmpty(user.email)) errors.email = "must not be empty";
  if (isEmpty(user.password)) errors.password = "must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === `auth/wrong-password`){
        return res.status(403).json({ general: "wrong credentials, please try again"});
      } else return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
