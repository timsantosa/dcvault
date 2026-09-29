#!/usr/bin/env node
'use strict';

// Manual catalog seed. Do not call this from server startup.
// Startup creates classPackages, creditGrants, and registrationSettings and does not fill them.
// After deploying the schema, from dcvault/: node server/db/seedClassPackages.js
// Inserts the nine public packages and the settings row (useClassPackageCatalog = false).
// Running it again skips packages that already exist (matched on audience and name)
// and leaves an edited price or an enabled catalog flag as they are.

const CLASS_PACKAGES = [
  { audience: 'fly-kids', name: '2 Classes', creditCount: 2, price: '60.00', sortOrder: 1, inviteLevel: null, active: true },
  { audience: 'fly-kids', name: '8 Classes', creditCount: 8, price: '200.00', sortOrder: 2, inviteLevel: null, active: true },
  { audience: 'fly-kids', name: '15 Classes', creditCount: 15, price: '300.00', sortOrder: 3, inviteLevel: null, active: true },
  { audience: 'adult', name: '2 Classes', creditCount: 2, price: '100.00', sortOrder: 1, inviteLevel: null, active: true },
  { audience: 'adult', name: '8 Classes', creditCount: 8, price: '350.00', sortOrder: 2, inviteLevel: null, active: true },
  { audience: 'allages', name: '4 Classes', creditCount: 4, price: '250.00', sortOrder: 1, inviteLevel: null, active: true },
  { audience: 'allages', name: '8 Classes', creditCount: 8, price: '425.00', sortOrder: 2, inviteLevel: null, active: true },
  { audience: 'allages', name: '15 Classes', creditCount: 15, price: '575.00', sortOrder: 3, inviteLevel: null, active: true },
  { audience: 'allages', name: 'Unlimited Classes', creditCount: null, price: '825.00', sortOrder: 4, inviteLevel: null, active: true },
];

const REGISTRATION_SETTINGS_ID = 1;
const USE_CLASS_PACKAGE_CATALOG_DEFAULT = false;

async function seedClassPackages(db) {
  const createdPackages = [];
  const existingPackages = [];

  for (const pkg of CLASS_PACKAGES) {
    const [row, created] = await db.tables.ClassPackages.findOrCreate({
      where: { audience: pkg.audience, name: pkg.name },
      defaults: {
        price: pkg.price,
        creditCount: pkg.creditCount,
        inviteLevel: pkg.inviteLevel,
        active: pkg.active,
        sortOrder: pkg.sortOrder,
      },
    });
    if (created) {
      createdPackages.push(row);
    } else {
      existingPackages.push(row);
    }
  }

  const [settings, settingsCreated] = await db.tables.RegistrationSettings.findOrCreate({
    where: { id: REGISTRATION_SETTINGS_ID },
    defaults: {
      id: REGISTRATION_SETTINGS_ID,
      useClassPackageCatalog: USE_CLASS_PACKAGE_CATALOG_DEFAULT,
    },
  });

  return {
    createdPackages,
    existingPackages,
    settings,
    settingsCreated,
  };
}

async function main() {
  const db = require('./db');
  const Sequelize = require('sequelize');
  const config = require('../config/config');

  const schema = new Sequelize(config.db.name, config.db.user, config.db.pass, {
    logging: false,
    host: 'localhost',
    dialect: 'mysql',
    dialectOptions: { insecureAuth: true },
  });

  try {
    await db.syncTables(schema, false);
    const result = await seedClassPackages(db);
    const createdCount = result.createdPackages.length;
    const existingCount = result.existingPackages.length;

    if (createdCount === 0) {
      console.log('Class packages already present (' + existingCount + ' skipped). Existing rows were left unchanged.');
    } else {
      console.log('Created ' + createdCount + ' class package' + (createdCount === 1 ? '' : 's') + '.');
      if (existingCount > 0) {
        console.log('Skipped ' + existingCount + ' class package' + (existingCount === 1 ? '' : 's') + ' that already existed.');
      }
    }

    if (result.settingsCreated) {
      console.log('Created registration settings (useClassPackageCatalog = false).');
    } else {
      console.log('Registration settings already present (useClassPackageCatalog = ' + result.settings.useClassPackageCatalog + '). Left unchanged.');
    }

    await schema.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding class packages:', error.message);
    try {
      await schema.close();
    } catch (closeError) {
      // The original seed error is the one to exit on.
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  CLASS_PACKAGES,
  REGISTRATION_SETTINGS_ID,
  USE_CLASS_PACKAGE_CATALOG_DEFAULT,
  seedClassPackages,
};
