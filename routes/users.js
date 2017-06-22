"use strict";

const express = require('express');
const router  = express.Router();
const bodyParser = require("body-parser");
// const cookieSession = require('cookie-session');

module.exports = (knex) => {

  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("users")
      .then((results) => {
        res.json(results);
    });
  });

  //home
  router.get("/", (req, res) => {

  });

  //register
  router.post("/register", (req, res) => {
    // Conditional checks for email
    if (email.length <= 5) {
        res.status(400).send("Error 400: Please provide a valid email.");
    };
    // Conditional checks for password
    if (!password) {
      res.status(400).send("Error 400: Please provide a password.");
    };
    // Send registration info to Users database
    req.session.user_id = req.params.email;
    knex('users').insert( { email: email, password: password } )
    .then(() => {
      res.redirect("/");
    });

  });

  //login
  router.post("/login", (req, res) => {
    req.session.user_id = req.params.email;
    res.redirect(‘/’);
  });

  //logout
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  //TO-DO list
  router.get("/list", (req, res) => {

  });


  return router;
}
