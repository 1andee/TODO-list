"use strict";

require('dotenv').config();

const PORT            = process.env.PORT || 8080;
const ENV             = process.env.ENV || "development";
const express         = require("express");
const bodyParser      = require("body-parser");
const sass            = require("node-sass-middleware");
const app             = express();
const cookieSession   = require("cookie-session");

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

app.use(cookieSession({
  name: 'session',
  keys: ["key 1"],
  maxAge: 24 * 60 * 60 * 1000
}));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

// Home page
app.get("/", (req, res) => {
  let user_id = req.session.user_id;

  if (user_id) {
    res.redirect("/list");
  } else {
    res.render('index');
  };
});

// registration form
app.post("/register", (req, res) => {
  let invalidFormSubmit = false;

  // Checks if email and password fields are empty
  if (!req.body.email || !req.body.password) {
    let invalidFormSubmit = true;
    res.status(401).send('Please enter a valid email/password');
    return;
  };

  // Checks if email already exists in database
  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {
      if (req.body.email === user.email) {
        let invalidFormSubmit = true;
        res.status(403).send('Please enter a unique email');
        return;
      };
    };

    if (!invalidFormSubmit) {
      // Adds new user to database and sets cookie
      knex('users')
      .returning('id')
      .insert( { email: req.body.email, password: req.body.password } )
      .then((user) => {
        req.session.user_id = user[0];
        res.redirect("/list");
      });
    };
  });
});

//login
app.post("/login", (req, res) => {
  let loginCredentials = false;

  // Checks if email and password fields are empty
  if (!req.body.email || !req.body.password) {
    loginCredentials = false;
    res.status(401).send('Please enter a valid email/password');
    return;
  };

  // Verify login details in database
  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {
      if (req.body.email === user.email) {
        if (req.body.password === user.password) {
          // Login successful, add cookie and redirect
          loginCredentials = true;
          let user_email = req.body.email;
          knex('users')
          .returning('id')
          .where('email', user_email)
          .then((user) => {
            req.session.user_id = user[0].id;
            console.log("USER ID IS", user[0].id);
            res.redirect('/list');
          });
        };
      };
    };
    if (!loginCredentials) {
      res.status(403).send('Please enter a valid email/password');
      return;
    };
  });
});

// UPDATE USER PROFILE
app.get("/profile", (req, res) => {
  let user_id = req.session.user_id;

  if (!user_id) {
    console.log("NO USER ID FOUND")
    res.redirect("/");
  } else {
    knex('users')
    .returning('user')
    .where({ id: user_id })
    .first()
    .then((user) => {
      const user_email = user.email;
      console.log(`USER EMAIL IS ${user_email}`);
      let templateVars = {
        user_id,
        user_email
      };
      res.render('profile', templateVars);
    });
  };
});

// UPDATE USER PROFILE
app.post("/profile", (req, res) => {

  // Conditional checks for email and password
  if (!req.body.email || !req.body.password) {
    res.status(403).send('Please enter a valid email/password');
    return;
  }

  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {
      if (req.body.email === user.email ) {
        res.status(403).send('Please enter a unique email');
        return;
      }
    }
  })

  /*
  Send updated info to Users database
  Update existing user (not insert as new)
  knex('users').update( { email: req.body.email, password: req.body.password } )
  .then(() => {
  res.redirect("/list");
});

*/

});


//TO-DO list
app.get("/list", (req, res) => {
  let user_id = req.session.user_id;

  if (!user_id) {
    res.redirect("/");
  } else {
    knex('users')
    .returning('user')
    .where({ id: user_id })
    .first()
    .then((user) => {
      const user_email = user.email;
      let templateVars = {
        user_id,
        user_email
      };
      res.render('list', templateVars);
    });
  };
});


app.post("/list", (req, res) => {
  let title = req.body.title;
  let category = req.body.category;
  let description = req.body.description;
  let thumbnail = req.body.image;
  let url = req.body.link;
  let subcategory = req.body.subcategory;

  knex('items').insert({ //insert clicked item into items database
    user_id: '1', //change this for cookieSession
    item_name: title,
    completed: 'false',
    rank: '2',
    category: category,
    description: description,
    thumbnail: thumbnail,
    url: url,
    subcategory: subcategory

  }).then(() => {
    res.redirect('/list');
  });

});


// route for deleting items
app.post("/list/delete", (req, res) => {
  let item_id = req.body.item_id;

  // knex command to remove selected item
  knex('items')
  .where('id', item_id)
  .del()
  .then(() => {
    res.redirect('/list');
  });
});


app.post("/list/status", (req, res) => {
  let item_id = req.body.item_id;

  knex.select('completed')
  .from('items')
  .where('id', item_id)
  .then((query) => {
    let bool = query[0].completed;
    knex('items')
    .where('id', item_id)
    .update('completed', !bool)
    .then(() => {
      res.redirect('/list');
    });
  });
});


app.post("/list/rank", (req, res) => {
  let item_id = req.body.item_id;

  knex.select('rank')
  .from('items')
  .where('id', item_id)
  .then((query) => {
    let rank = query[0].rank;
    if (rank === 1) {
      rank = 3;
    } else if (rank === 2) {
      rank = 1;
    } else if (rank === 3) {
      rank = 2;
    }

    knex('items')
    .where('id', item_id)
    .update('rank', rank)
    .then(() => {
      res.redirect('/list');
    });
  });
});


app.post("/list/category", (req, res) => {
  let item_id = req.body.item_id;

  knex.select('category')
  .from('items')
  .where('id', item_id)
  .then((query) => {

    let category = query[0].category;
    if (category === 'Place/Restaurant') {
      category = 'Product/Book';
    } else if (category === 'Product/Book') {
      category = 'Movie/TVSeries';
    } else if (category === 'Movie/TVSeries') {
      category = 'Place/Restaurant';
    }

    knex('items')
    .where('id', item_id)
    .update('category', category)
    .then(() => {
      res.redirect('/list');
    });
  });
});


// Logout
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

// app.post("/list/completed_boolean", (req, res) => {
//   let completed_boolean = req.body.
// });

app.listen(PORT, () => {
  console.log("Kick List app listening on port " + PORT);
});
