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

app.get('/shouts', (req, res) => {
    admin
        .firestore()
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
    admin
        .firestore()
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

// https://baseurl.com/api/

exports.api = functions.https.onRequest(app);