"use strict";

const express = require('express');
const router  = express.Router();
const bodyParser = require("body-parser");
// const cookieSession = require('cookie-session');

module.exports = (knex) => {

  // make items table availabe at /list
  router.get("/list", (req, res) => {
    knex
      .select("*")
      .from("items")
      .then((results) => {
        res.json(results);
    });
  });

  return router;
}
