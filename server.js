"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

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

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

//register
app.post("/register", (req, res) => {

  // Conditional checks for email and password
  if (!req.body.email || !req.body.password) {
  res.status(403).send('Please fill out all fields');
  return;
  }

  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {
      if (req.body.email === user.email ) {
        res.status(403).send('Email already exists');
        return;
      }
    }
  })

  // Send registration info to Users database
  knex('users').insert( { email: req.body.email, password: req.body.password } )
  .then(() => {
    res.redirect("/list");
  });

});

//login
app.post("/login", (req, res) => {

  if (!req.body.email || !req.body.password) {
  res.status(403).send('Please fill out all fields');
  return;
  }

  knex.select().table('users')
  .then((result)=> {
    for (let user of result) {

      if (req.body.email === user.email ) {
        if (req.body.password === user.password) {
          res.redirect('/list');
        } else {
          res.status(401).send("Password doesn't match");
          return;
        }
      }
    }
  })
});

//logout
app.post("/logout", (req, res) => {

  res.redirect("/");
});

//TO-DO list
app.get("/list", (req, res) => {
  res.render('list');
});

app.post("/list", (req, res) => {
  let category = req.body.category;
  let title = req.body.title;
  let link = req.body.link;
  console.log(category + title + link);

  knex('items').insert({ //insert clicked item into items database
    user_id: '1', //change this for cookieSession
    item_name: title,
    completed: 'false',
    rank: '2',
    category: category
  }).then(() => {
    res.redirect('/list');
  });

});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
