'use strict';
const Sequelize = require('sequelize');
const config = require('../config/config.js');

let tables = {};
let columns = {}; // Column definitions (minus PKeys and FKeys)
let schema = new Sequelize(config.db.name, config.db.user, config.db.pass);

columns.users = {
  email: Sequelize.STRING,
  sub: Sequelize.STRING,
  name: Sequelize.STRING
  // Address FK
};

columns.athleteData = {
  emergencyContactName: Sequelize.STRING,
  emergencyContactMDN: Sequelize.STRING,
  personalRecord: Sequelize.STRING
};

columns.poles = {
  brand: Sequelize.STRING,
  length: Sequelize.STRING,
  weight: Sequelize.STRING,
  flex: Sequelize.STRING,
  damage: Sequelize.TEXT,
  note: Sequelize.TEXT,
  price: Sequelize.DOUBLE
};

columns.packages = {
  name: Sequelize.STRING,
  quarter: Sequelize.INTEGER,
  year: Sequelize.INTEGER,
  price: Sequelize.DOUBLE
};

columns.rentals = {
  // POLE FK, USER FK
  quarter: Sequelize.INTEGER
};

columns.purchases = {
  // PACKAGE FK, USER FK
};

columns.sites = {
  name: Sequelize.STRING,
  description: Sequelize.TEXT
  // Address FK
};

columns.discounts = {
  code: Sequelize.STRING, // Hashed
  // Optional user FK
  uses: Sequelize.INTEGER
  // package or rental FK
};

columns.addresses = {
  line1: Sequelize.STRING,
  line2: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING
};

