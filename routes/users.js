"use strict";

const express = require('express');
const router  = express.Router();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

module.exports = (knex) => {

  // make items table availabe at /list
  router.get("/list", (req, res) => {

    let user_id = req.session.user_id;

    if (user_id) {
      console.log(req.session);
      console.log(req.session.user_id);
      knex('items')
      .select("*")
      .from("items")
      .where('user_id', req.session.user_id)
      .then((results) => {
        res.json(results);
      });
    } else {
      res.redirect('/');
    }
  });

  return router;

}


// .where('user_id', req.session.user_id)
