"use strict";

const express = require('express');
const router  = express.Router();
const bodyParser = require("body-parser");
// const cookieSession = require('cookie-session');

module.exports = (knex) => {

  // make items table availabe at /list
  router.get("/list", (req, res) => {
    knex('items')
      .where('user_id', req.session.user_id)
      .then((results) => {
        res.json(results);
    });
  });

  return router;

}


// .where('user_id', req.session.user_id)
