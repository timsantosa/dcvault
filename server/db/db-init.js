'use strict';
const Sequelize = require('sequelize');

let tables = {};
let columns = {}; // Column definitions (minus PKeys and FKeys)

columns.users = {

};

columns.athleteData = {
  emergencyContactName: Sequelize.STRING,
  emergencyContactMDN: Sequelize.STRING,
  personalRecord: Sequelize.STRING,
};

columns.poles = {

};

columns.packages = {

};

columns.rentals = {

};

columns.purchases = {

};

columns.sites = {

};

columns.discounts = {

}