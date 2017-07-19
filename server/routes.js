'use strict';

const express = require('express');
const path = require('path');

module.exports = (app, db) => {
  // External Middleware
  app.use(express.static(path.join(__dirname, '../client')));

  // Endpoints

}