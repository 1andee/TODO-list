"use strict";

const express = require('express');
const listRoutes = express.Router();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

module.exports = (knex) => {

  // make items table availabe at /list
  listRoutes.get("/list", (req, res) => {

    let user_id = req.session.user_id;

    if (user_id) {
      knex('items')
      .select("*")
      .from("items")
      .where('user_id', req.session.user_id)
      .then((results) => {
        res.json(results);
      });
    } else {
      req.flash('warning', "Only logged in users can access that.");
      res.redirect('/');
    }
  });

  return listRoutes;

}
