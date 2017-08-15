'use strict';
const Sequelize = require('sequelize');

let tables = {};
let columns = {};

columns.users = {
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  verified: {type: Sequelize.BOOLEAN, defaultValue: false},
  verificationCode: Sequelize.STRING,
  name: Sequelize.STRING
  // Address FK
};

columns.athletes = {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: {type: Sequelize.STRING, unique: true},
  emergencyContactName: Sequelize.STRING,
  emergencyContactMDN: Sequelize.STRING,
  emergencyContactRelation: Sequelize.STRING,
  usatf: Sequelize.STRING,
  dob: Sequelize.STRING,
  gender: Sequelize.STRING,
  state: Sequelize.STRING,
  school: Sequelize.STRING,
  medConditions: Sequelize.TEXT
  // User FK
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
  // athleteFK, userFK
  quarter: Sequelize.STRING,
  group: Sequelize.STRING,
  facility: Sequelize.STRING,
  waiverSignatory: Sequelize.STRING,
  waiverDate: Sequelize.STRING,
  paymentId: Sequelize.STRING,
  payerId: Sequelize.STRING
};

columns.sites = {
  name: Sequelize.STRING,
  description: Sequelize.TEXT
  // Address FK
};

columns.discounts = {
  code: Sequelize.STRING,
  // Optional user FK
  uses: Sequelize.INTEGER,
  type: Sequelize.STRING,
  amount: Sequelize.DOUBLE
  // package or rental FK
};

columns.addresses = {
  line1: Sequelize.STRING,
  line2: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING,
  country: Sequelize.STRING
};


const syncTables = (schema, force) => {
  var force = !!force;

  tables.Users = schema.define('user', columns.users);
  tables.Athletes = schema.define('athlete', columns.athletes);
  tables.Poles = schema.define('pole', columns.poles);
  tables.Packages = schema.define('package', columns.packages);
  tables.Rentals = schema.define('rental', columns.rentals);
  tables.Purchases = schema.define('purchase', columns.purchases);
  tables.Sites = schema.define('site', columns.sites);
  tables.Discounts = schema.define('discount', columns.discounts);
  tables.Addresses = schema.define('address', columns.addresses);


  tables.Users.belongsTo(tables.Addresses, {as: 'address'});

  tables.Sites.belongsTo(tables.Sites, {as: 'address'});

  tables.Athletes.belongsTo(tables.Users, {as: 'user'});

  tables.Rentals.belongsTo(tables.Users, {as: 'user'});
  tables.Rentals.belongsTo(tables.Poles, {as: 'pole'});

  tables.Purchases.belongsTo(tables.Users, {as: 'user'});
  tables.Purchases.belongsTo(tables.Athletes, {as: 'athlete'});

  tables.Discounts.belongsTo(tables.Users, {as: 'user'});
  tables.Discounts.belongsTo(tables.Packages, {as: 'package'});
  tables.Discounts.belongsTo(tables.Rentals, {as: 'rental'});

  return schema.sync({force: force});
}

module.exports = {
  tables: tables,
  syncTables: syncTables
};