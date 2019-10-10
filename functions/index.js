const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

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

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/shouts', (req, res) => {
    db
        .collection('shouts')
        // show the latest shout first
        .orderBy('createdAt', 'desc')
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
})

// function to create documents
app.post('/shout', (req, res) => {
    // initialize shout
    const newShout = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    // persist into database
    db
        .collection('shouts')
        .add(newShout)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully`}).stringify
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

// signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // validate data
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ handle: 'this handle is already taken' })
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res
                .status(201)
                .json({ token });
        })
        .catch(err => {
            console.error(err);
            return res
                .status(500)
                .json({ error: err.code })
        })
});

exports.api = functions.https.onRequest(app);