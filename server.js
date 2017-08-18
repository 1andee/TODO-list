"use strict";

require('dotenv').config();

const PORT            = process.env.PORT || 8080;
const ENV             = process.env.NODE_ENV || "development";
const express         = require("express");
const bodyParser      = require("body-parser");
const sass            = require("node-sass-middleware");
const app             = express();
const cookieSession   = require("cookie-session");

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const flash = require('express-flash');

// Seperated Routes for each Resource
const listRoutes = require("./routes/list");
const userRoutes = require("./routes/users");

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
app.use("/list", listRoutes(knex));
app.use("/users", userRoutes(knex));


// Home page
app.get("/", (req, res) => {
  let user_id = req.session.user_id;

  if (user_id) {
    res.redirect("/list");
  } else {
    res.render('index');
  };
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

app.listen(PORT, () => {
  console.log("Kick List app listening on port " + PORT);
});
