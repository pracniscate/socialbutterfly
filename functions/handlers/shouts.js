const { db } = require("../utility/admin");

exports.getAllShouts = (req, res) => {
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
};

exports.postOneShout = (req, res) => {
  // do not allow empty shouts
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "cannot post an empty message " });
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
};
