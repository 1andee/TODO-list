"use strict";

const express       = require('express');
const listRoutes    = express.Router();
const bodyParser    = require("body-parser");
const request         = require('request');

const GOOGLEKEY   = process.env.GOOGLEKEY;
const GOOGLECSE   = process.env.GOOGLECSE;

module.exports = (knex) => {

  listRoutes.post("/search", (req, res) => {
    let query = req.body.query;
    let url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLEKEY}&cx=${GOOGLECSE}&q=${query}&gl=ca`;

    let options = {
      'url': url,
      'method': 'GET',
    };

    request(options, ((error, response, body) => {
      if (error) {
        console.log(error);
      };
      let results = JSON.parse(body);
      res.send(results);
    }));

  });

  listRoutes.post("/new", (req, res) => {

    let { title, category, description, image, link, subcategory } = req.body;

    //insert clicked item into items database
    knex('items').insert({
      user_id: req.session.user_id,
      item_name: title,
      completed: 'false',
      rank: '2',
      category: category,
      description: description,
      thumbnail: image,
      url: link,
      subcategory: subcategory

    }).then(() => {
      res.redirect('/list');
    });

  });


  // route for deleting items
  listRoutes.post("/delete", (req, res) => {
    let item_id = req.body.item_id;

    // knex command to remove selected item
    knex('items')
    .where('id', item_id)
    .del()
    .then(() => {
      res.redirect('/list');
    });
  });


  listRoutes.post("/status", (req, res) => {
    let item_id = req.body.item_id;

    knex.select('completed')
    .from('items')
    .where('id', item_id)
    .then((query) => {
      let bool = query[0].completed;
      knex('items')
      .where('id', item_id)
      .update('completed', !bool)
      .then(() => {
        res.redirect('/list');
      });
    });
  });


  listRoutes.post("/rank", (req, res) => {
    let item_id = req.body.item_id;

    knex.select('rank')
    .from('items')
    .where('id', item_id)
    .then((query) => {
      let rank = query[0].rank;
      if (rank === 1) {
        rank = 3;
      } else if (rank === 2) {
        rank = 1;
      } else if (rank === 3) {
        rank = 2;
      }

      knex('items')
      .where('id', item_id)
      .update('rank', rank)
      .then(() => {
        res.redirect('/list');
      });
    });
  });


  listRoutes.post("/category", (req, res) => {
    let item_id = req.body.item_id;

    knex.select('category')
    .from('items')
    .where('id', item_id)
    .then((query) => {

      let category = query[0].category;
      if (category === 'Place/Restaurant') {
        category = 'Product/Book';
      } else if (category === 'Product/Book') {
        category = 'Movie/TVSeries';
      } else if (category === 'Movie/TVSeries') {
        category = 'Place/Restaurant';
      }

      knex('items')
      .where('id', item_id)
      .update('category', category)
      .then(() => {
        res.redirect('/list');
      });
    });
  });

  return listRoutes;

}
