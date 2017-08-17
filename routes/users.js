"use strict";

const express       = require('express');
const userRoutes    = express.Router();
const bodyParser    = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt        = require("bcrypt-nodejs");

module.exports = (knex) => {

  userRoutes.post("/register", (req, res) => {
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
  userRoutes.post("/login", (req, res) => {
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

  // Logout
  userRoutes.post("/logout", (req, res) => {
    req.session = null;
    return res.redirect('/');
  });

  return userRoutes;

}
