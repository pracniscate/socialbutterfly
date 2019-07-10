const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getShouts = functions.https.onRequest((req, res) => {
    // need access to the database
    admin
        .firestore().collection('shouts')
        .get()
        .then(data => {
            let shouts = [];
            data.forEach(doc => {
                shouts.push(doc.data());
            });
            return res.json(shouts);
        })
        .catch(err => console.error(err));
})

// function to create documents
exports.createShout = functions.https.onRequest((req, res) => {
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