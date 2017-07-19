const path = require('path');
const db = require('./db/db');
const express = require('express');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const config = require('./config/config');

var schema = new Sequelize(config.db.name, config.db.user, config.db.pass, {host: 'localhost', dialect: 'mysql'});
db.syncTables(schema, false).then(() => {
  console.log('DB Initialized');
});

const port = 8080;
const app = express();
app.use(express.static(path.join(__dirname, '../client')));
require('./routes')(app, db);
app.listen(port, () => {
  console.log('Server running on port ', port)
});