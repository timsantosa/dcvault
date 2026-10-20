#!/usr/bin/env node
'use strict';

// Manual group seed. Do not call this from server startup.
// Startup creates trainingGroups and does not fill it.
// After deploying the schema, from dcvault/: node server/db/seedTrainingGroups.js
// Inserts the four groups. Running it again skips keys that already exist
// and does not change a label that was edited.

const TRAINING_GROUPS = [
  { key: 'fly-kids', label: 'Fly Kids' },
  { key: 'adult', label: 'Adult' },
  { key: 'allages', label: 'Open / All Ages' },
  { key: 'elite', label: 'Elite Development' },
];

async function seedTrainingGroups(db) {
  const created = [];
  const existing = [];

  for (const group of TRAINING_GROUPS) {
    const [row, wasCreated] = await db.tables.TrainingGroups.findOrCreate({
      where: { key: group.key },
      defaults: { label: group.label },
    });
    if (wasCreated) {
      created.push(row);
    } else {
      existing.push(row);
    }
  }

  return { created, existing };
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
    const result = await seedTrainingGroups(db);
    const createdCount = result.created.length;
    const existingCount = result.existing.length;

    if (createdCount === 0) {
      console.log('Training groups already present (' + existingCount + ' skipped). Existing labels were left unchanged.');
    } else {
      console.log('Created ' + createdCount + ' training group' + (createdCount === 1 ? '' : 's') + '.');
      if (existingCount > 0) {
        console.log('Skipped ' + existingCount + ' training group' + (existingCount === 1 ? '' : 's') + ' that already existed.');
      }
    }

    await schema.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding training groups:', error.message);
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
  TRAINING_GROUPS,
  seedTrainingGroups,
};
