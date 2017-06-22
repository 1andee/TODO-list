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

  //show all rows in items
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
