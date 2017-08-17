"use strict";

require('dotenv').config();

const PORT            = process.env.PORT || 8080;
const ENV             = process.env.NODE_ENV || "development";
const express         = require("express");
const bodyParser      = require("body-parser");
const sass            = require("node-sass-middleware");
const app             = express();
const cookieSession   = require("cookie-session");
const bcrypt          = require("bcrypt-nodejs");
const request         = require('request');

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const flash = require('express-flash');

const GOOGLEKEY   = process.env.GOOGLEKEY;
const GOOGLECSE   = process.env.GOOGLECSE;

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
app.use(flash());
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
  let { email, password } = req.body;

  // Checks if email and password fields are empty
  if (!email || !password) {
    let invalidFormSubmit = true;
    req.flash('danger', "Please enter a valid email/password.");
    return res.redirect('/');
  };

  // Checks if email already exists in database
  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {
      if (email === user.email) {
        let invalidFormSubmit = true;
        req.flash('danger', "Please enter a unique email.");
        return res.redirect('/');
      };
    };

    if (!invalidFormSubmit) {
      // Adds new user to database and sets cookie
      knex('users')
      .returning('id')
      .insert( { email: email, password: bcrypt.hashSync(password, bcrypt.genSaltSync()) } )
      .then((user) => {
        req.session.user_id = user[0];
        req.flash('success', "Your account has been created.")
        return res.redirect("/list");
      });
    };
  });
});

//login
app.post("/login", (req, res) => {
  let loginCredentials = false;
  let { email, password } = req.body;

  // Checks if email and password fields are empty
  if (!email || !password) {
    loginCredentials = false;
    req.flash('danger', "Please enter a valid email/password.");
    return res.redirect('/');
  };

  // Verify login details in database
  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {
      if (email === user.email) {
        if (bcrypt.compareSync(password, user.password)) {
          // Login successful, add cookie and redirect
          loginCredentials = true;
          let user_email = email;
          knex('users')
          .returning('id')
          .where('email', user_email)
          .then((user) => {
            req.session.user_id = user[0].id;
            res.redirect('/list');
          });
        };
      };
    };
    if (!loginCredentials) {
      req.flash('danger', "Please enter a valid email/password.");
      return res.redirect('/');
    };
  });
});

// User Profile - View current
app.get("/profile", (req, res) => {
  let user_id = req.session.user_id;

  if (!user_id) {
    req.flash('warning', "Only logged in users can access that.");
    res.redirect('/');
  } else {
    // pass current user_id and email to page
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
      res.render('profile', templateVars);
    });
  };
});

// #### User Profile - Update details #### \\\\

// Helper function for revising email
function emailUpdater(user_id, newEmail) {
  return knex('users')
  .returning('user')
  .where({ id: user_id })
  .first()
  .then((user) => {
      return knex('users')
      .where({ id: user_id })
      .update({ email: newEmail })
  });
};

// Helper function for revising password
function passwordUpdater(user_id, newPassword) {
  return knex('users')
  .returning('user')
  .where({ id: user_id })
  .first()
  .then((user) => {
      return knex('users')
      .where({ id: user_id })
      .update({ password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync()) })
  });
};

// Handles post requests for Profile Updates
app.post("/profile", (req, res) => {
  let user_id = req.session.user_id;
  let newEmail = req.body.email;
  let newPassword = req.body.password;

  let emailPromise = Promise.resolve();
  let passwordPromise = Promise.resolve();
  if (newEmail) {
    emailPromise = emailUpdater(user_id, newEmail);
  }

  if (newPassword) {
    passwordPromise = passwordUpdater(user_id, newPassword)
  }

  Promise.all([emailPromise, passwordPromise])
  .then(() => {
    req.flash('success', "Your details have been updated.")
    return res.redirect("/profile");
  });

});


//TO-DO list
app.get("/list", (req, res) => {

  let user_id = req.session.user_id;

  if (!user_id) {
    req.flash('warning', "Only logged in users can access that.");
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

app.post("/search", (req, res) => {
  let query = req.body.query;
  let url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLEKEY}&cx=${GOOGLECSE}&q=${query}&gl=ca`;

  let options = {
    'url': url,
    'method': 'GET',
  };

  request(options, ((error, response, body) => {
    if (error) {
      console.log(error);
    };
    let results = JSON.parse(body);
    res.send(results);
  }));

});

app.post("/list", (req, res) => {

  let { title, category, description, image, link, subcategory } = req.body;

  //insert clicked item into items database
  knex('items').insert({
    user_id: req.session.user_id,
    item_name: title,
    completed: 'false',
    rank: '2',
    category: category,
    description: description,
    thumbnail: image,
    url: link,
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
  return res.redirect('/');
});

app.listen(PORT, () => {
  console.log("Kick List app listening on port " + PORT);
});
