const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/shouts', (req, res) => {
    admin
        .firestore()
        .collection('shouts')
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
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
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