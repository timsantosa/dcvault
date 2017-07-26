'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


module.exports = (app, db) => {
  // External Middleware
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Endpoints
  app.get('/callback', (req, res) => {
    console.log(req.query.id_token);
    res.end();
  });
}