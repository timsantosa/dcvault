const express = require('express');
const Sequelize = require('sequelize');
const path = require('path');
const config = require('./config/config');
const db = require('./db/db');
const Promse = require('bluebird');

var schema = new Sequelize()

const app = express();

app.use(express.static(path.join(__dirname, '../client')));

const port = 8080;
app.listen(port, () => {
  console.log('Server running on port ', port)
});