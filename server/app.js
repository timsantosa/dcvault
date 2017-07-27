const path = require('path');
const db = require('./db/db');
const express = require('express');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const config = require('./config/config');


// Initialize database
var schema = new Sequelize(config.db.name, config.db.user, config.db.pass, {host: 'localhost', dialect: 'mysql', insecureauth: true});
db.syncTables(schema, false).then(() => {
  console.log('DB Initialized');
});

// Initialize Server
const port = 8080;
const app = express();
require('./routes')(app, db); // Import all middleware and routes

// Launch Server
app.listen(port, () => {
  console.log('Server running on port ', port)
});