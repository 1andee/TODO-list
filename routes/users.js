"use strict";

const express = require('express');
const router  = express.Router();
const bodyParser = require("body-parser");

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
  router.get("/register", (req, res) => {

  });

  //login
  router.get("/login", (req, res) => {

  });

  //logout
  router.post("/logout", (req, res) => {

  });

  //TO-DO list
  router.get("/list", (req, res) => {

  });

  return router;
}
