'use strict'
const Sequelize = require('sequelize')

let tables = {}
let columns = {}

columns.users = {
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  verified: {type: Sequelize.BOOLEAN, defaultValue: false},
  isAdmin: {type: Sequelize.BOOLEAN, defaultValue: false},
  verificationCode: Sequelize.STRING,
  name: Sequelize.STRING
  // Address FK
}

columns.trainingOptions = {
  fall: Sequelize.BOOLEAN,
  winter: Sequelize.BOOLEAN,
  spring: Sequelize.BOOLEAN,
  summer: Sequelize.BOOLEAN,
  youthAdult: Sequelize.BOOLEAN,
  dcv: Sequelize.BOOLEAN,
  balt: Sequelize.BOOLEAN,
  prep: Sequelize.BOOLEAN,
  ncs: Sequelize.BOOLEAN,
  cua: Sequelize.BOOLEAN,
  pg: Sequelize.BOOLEAN,
  pa: Sequelize.BOOLEAN
}

columns.athletes = {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: {type: Sequelize.STRING, unique: false},
  notifications: Sequelize.STRING,
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

}

columns.eventAthletes = {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: {type: Sequelize.STRING, unique: false},
    dob: Sequelize.STRING,
    pr: Sequelize.FLOAT,
    team: Sequelize.STRING,
    usatf: Sequelize.STRING,
    emergencyContactName: Sequelize.STRING,
    emergencyContactMDN: Sequelize.STRING,
    emergencyContactRelation: Sequelize.STRING,
    gender: Sequelize.STRING,
    state: Sequelize.STRING,
    division: Sequelize.STRING,
    accomplishments: Sequelize.TEXT,
    dates: Sequelize.TEXT,
    age: Sequelize.INTEGER

}

columns.poles = {
  brand: Sequelize.STRING,
  feet: Sequelize.INTEGER,
  inches: {type: Sequelize.INTEGER, defaultValue: 0},
  weight: Sequelize.INTEGER,
  location: Sequelize.STRING,
  damaged: {type: Sequelize.BOOLEAN, defaultValue: false},
  missing: {type: Sequelize.BOOLEAN, defaultValue: false},
  needsTip: {type: Sequelize.BOOLEAN, defaultValue: false},
  broken: {type: Sequelize.BOOLEAN, defaultValue: false},
  note: Sequelize.TEXT,
  rented: {type: Sequelize.BOOLEAN, defaultValue: false}
}

columns.rentals = {
  expiration: Sequelize.DATE
}

columns.packages = {
  name: Sequelize.STRING,
  quarter: Sequelize.INTEGER,
  year: Sequelize.INTEGER,
  price: Sequelize.DOUBLE
}

columns.purchases = {
  // athleteFK, userFK
  quarter: Sequelize.STRING,
  group: Sequelize.STRING,
  facility: Sequelize.STRING,
  waiverSignatory: Sequelize.STRING,
  waiverDate: Sequelize.STRING,
  paymentId: Sequelize.STRING,
  payerId: Sequelize.STRING,
  size: Sequelize.STRING,
  month: Sequelize.STRING,
  strength: Sequelize.STRING,
  strengthFam: Sequelize.STRING,
  membership: Sequelize.STRING
}

columns.eventPurchases = {
    waiverSignatory: Sequelize.STRING,
    waiverDate: Sequelize.STRING,
    paymentId: Sequelize.STRING,
    payerId: Sequelize.STRING,
    athlete: Sequelize.STRING

}

columns.sites = {
  name: Sequelize.STRING,
  description: Sequelize.TEXT
  // Address FK
}

columns.discounts = {
  code: {type: Sequelize.STRING, unique: true},
  uses: Sequelize.INTEGER,
  type: Sequelize.STRING,
  amount: Sequelize.DOUBLE
}

columns.invites = {
  code: {type: Sequelize.STRING, unique: true},
  type: Sequelize.STRING,
  level: Sequelize.INTEGER
}

columns.addresses = {
  line1: Sequelize.STRING,
  line2: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING,
  country: Sequelize.STRING
}


// Mobile app related tables
columns.athleteProfiles = {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  nationality: {type: Sequelize.STRING, defaultValue: 'US'},
  profileImage: Sequelize.STRING,
  backgroundImage: Sequelize.STRING,
  height: Sequelize.INTEGER, // Inches
  weight: Sequelize.INTEGER, // Pounds
  dob: Sequelize.STRING,
  gender: Sequelize.STRING,
  isActiveMember: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false, }, //ALTER TABLE athleteProfiles ADD COLUMN isActiveMember BOOLEAN NOT NULL DEFAULT TRUE;
  // User FK
}

columns.jumps = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  athleteProfileId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: tables.athleteProfiles, // Assumes `AthleteProfiles` table is already defined
      key: 'id',
    },
  },
  date: { type: Sequelize.DATE, allowNull: false, },
  // Flattened Hard Metrics
  setting: { type: Sequelize.ENUM('Practice', 'Meet'), allowNull: false, defaultValue: 'Practice' },
  focus: Sequelize.STRING,
  stepNum: { type: Sequelize.INTEGER, allowNull: false, },
  distanceInches: Sequelize.FLOAT,
  midMarkInches: Sequelize.FLOAT,
  targetTakeOffInches: Sequelize.FLOAT,
  actualTakeOffInches: Sequelize.FLOAT,
  poleId: Sequelize.INTEGER, // TODO: add to db, add relationship
  poleLengthInches: Sequelize.FLOAT,
  poleWeight: Sequelize.FLOAT,
  poleBrand: Sequelize.ENUM('UCS', 'Altius', 'Dynasty', 'ESSX', 'Nordic', 'Pacer', 'Sky Pole', 'Other'),
  poleFlex: Sequelize.FLOAT,
  poleGripInches: Sequelize.FLOAT,
  heightIsBar: Sequelize.BOOLEAN,
  heightInches: Sequelize.FLOAT,
  standardsInches: Sequelize.FLOAT,
  heightResult: Sequelize.STRING,
  athleteHeightInches: Sequelize.FLOAT,
  athleteWeightPounds: Sequelize.FLOAT,

  // Meet Info
  meetType: Sequelize.STRING,
  division: Sequelize.STRING,
  placement: Sequelize.INTEGER,
  recordType: Sequelize.STRING,
  meetEventDetails: Sequelize.JSON, // Stores the rest of MeetInfo object as JSON since we probably don't need to query on these values

  // Other fields
  softMetrics: Sequelize.JSON, // Stores the SoftMetrics object as JSON since we probably don't need to query on these values
  notes: Sequelize.TEXT,
  videoLink: Sequelize.STRING,
  verified: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false, },
};

columns.personalRecords = {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, },
  athleteProfileId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: tables.athleteProfiles,
      key: 'id',
    },
  },
  stepNum: { type: Sequelize.INTEGER, allowNull: false, },
  jumpId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: tables.jumps,
      key: 'id',
    },
  },
};

// Mobile Permissions
columns.roles = {
  roleName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
};

columns.permissions = {
  permissionName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  permissionKey: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  description: Sequelize.TEXT, // Explains what this permission is for
};

columns.role_permissions = {};

columns.user_roles = {};

columns.user_permissions = {};


const syncTables = (schema, force) => {
  force = !!force

  tables.Users = schema.define('user', columns.users)
  tables.Athletes = schema.define('athlete', columns.athletes)
  tables.Poles = schema.define('pole', columns.poles)
  tables.Packages = schema.define('package', columns.packages)
  tables.Rentals = schema.define('rental', columns.rentals)
  tables.Purchases = schema.define('purchase', columns.purchases)
  tables.Sites = schema.define('site', columns.sites)
  tables.Discounts = schema.define('discount', columns.discounts)
  tables.Invites = schema.define('invite', columns.invites)
  tables.Addresses = schema.define('address', columns.addresses)
  tables.TrainingOptions = schema.define('trainingOptions', columns.trainingOptions)
  tables.EventAthletes = schema.define('eventAthlete', columns.eventAthletes)
  tables.EventPurchases = schema.define('eventPurchase', columns.eventPurchases)

  // Mobile app specific
  tables.AthleteProfiles = schema.define('athleteProfile', columns.athleteProfiles);
  tables.Jumps = schema.define('jump', columns.jumps);
  tables.PersonalRecords = schema.define('personalRecord', columns.personalRecords);

  // Mobile app permissions
  tables.Roles = schema.define('role', columns.roles);
  tables.Permissions = schema.define('permission', columns.permissions);
  tables.Role_Permissions = schema.define('role_permission', columns.role_permissions);
  tables.User_Roles = schema.define('user_role', columns.user_roles);
  tables.User_Permissions = schema.define('user_permission', columns.user_permissions);


  // Associations
  tables.Users.belongsTo(tables.Addresses, {as: 'address'})

  tables.Sites.belongsTo(tables.Sites, {as: 'address'})

  tables.Athletes.belongsTo(tables.Users, {as: 'user'})

  tables.Rentals.belongsTo(tables.Athletes, {as: 'athlete'})
  tables.Rentals.belongsTo(tables.Poles, {as: 'pole'})

  tables.Purchases.belongsTo(tables.Users, {as: 'user'})
  tables.Purchases.belongsTo(tables.Athletes, {as: 'athlete'})

  tables.Discounts.belongsTo(tables.Users, {as: 'user'})
  tables.Discounts.belongsTo(tables.Packages, {as: 'package'})
  tables.Discounts.belongsTo(tables.Rentals, {as: 'rental'})

  // Mobile app related
  tables.AthleteProfiles.belongsTo(tables.Users, { as: 'user' }) // Puts a userId column in AthleteProfiles, each profile "belongs" to a User
  tables.Users.hasMany(tables.AthleteProfiles, { as: 'athleteProfiles', foreignKey: 'userId' }) // Each User "has many" AthleteProfiles somewhere in the DB (only one for now though)

  tables.Jumps.belongsTo(tables.AthleteProfiles, { as: 'athleteProfile', foreignKey: 'athleteProfileId' })
  tables.AthleteProfiles.hasMany(tables.Jumps, { as: 'jumps', foreignKey: 'athleteProfileId' })

  // A jump can only have one personal record, or none. A PR has to have at exactly 1 jump
  tables.PersonalRecords.belongsTo(tables.Jumps, { as: 'jump', foreignKey: 'jumpId' })
  tables.Jumps.hasOne(tables.PersonalRecords, { as: 'personalRecord', foreignKey: 'jumpId' }) // There may or may not a PR for a jump.

  tables.PersonalRecords.belongsTo(tables.AthleteProfiles, { as: 'athleteProfile', foreignKey: 'athleteProfileId' })
  tables.AthleteProfiles.hasMany(tables.PersonalRecords, { as: 'personalRecords', foreignKey: 'athleteProfileId' })

  // Mobile App permissions
  tables.Users.belongsToMany(tables.Roles, { through: tables.User_Roles, foreignKey: 'userId' });
  tables.Roles.belongsToMany(tables.Users, { through: tables.User_Roles, foreignKey: 'roleId' });

  tables.Roles.belongsToMany(tables.Permissions, { through: tables.Role_Permissions, foreignKey: 'roleId' });
  tables.Permissions.belongsToMany(tables.Roles, { through: tables.Role_Permissions, foreignKey: 'permissionId' });

  tables.Users.belongsToMany(tables.Permissions, { through: tables.User_Permissions, foreignKey: 'userId' });
  tables.Permissions.belongsToMany(tables.Users, { through: tables.User_Permissions, foreignKey: 'permissionId' });

  tables.User_Roles.belongsTo(tables.Users, { foreignKey: 'userId' });
  tables.User_Roles.belongsTo(tables.Roles, { foreignKey: 'roleId' });

  tables.Role_Permissions.belongsTo(tables.Roles, { foreignKey: 'roleId' });
  tables.Role_Permissions.belongsTo(tables.Permissions, { foreignKey: 'permissionId' });

  tables.User_Permissions.belongsTo(tables.Users, { foreignKey: 'userId' });
  tables.User_Permissions.belongsTo(tables.Permissions, { foreignKey: 'permissionId' });


  tables.schema = schema
  return schema.sync({force: force})
}

module.exports = {
  tables: tables,
  syncTables: syncTables,
}
