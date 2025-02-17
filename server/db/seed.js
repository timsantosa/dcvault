const db = require('./db')
const Sequelize = require('sequelize')
const config = require('../config/config')
const helpers = require('../lib/helpers')
const bcrypt = require('bcrypt-nodejs')
const jumpsController = require('../controllers/jumpsController');

// Initialize database
var schema = new Sequelize(config.db.name, config.db.user, config.db.pass, {logging: false, host: 'localhost', dialect: 'mysql', dialectOptions: {insecureAuth: true}})

let quarters = ['fall', 'winter', 'spring', 'summer']
let facilities = ['dcv', 'balt', 'pa', 'prep', 'ncs', 'cua', 'pg']
let groups = ['beginner', 'intermediate', 'emerging-elite', 'elite', 'professional']
let maleNames = [{first: 'Fredrick', last: 'Hughes'}, {first: 'Ismael', last: 'Wheeler'}, {first: 'Carlton', last: 'Adams'}, {first: 'Gustavo', last: 'West'}, {first: 'Arthur', last: 'Shelton'}, {first: 'Julius', last: 'Tate'}, {first: 'Franklin', last: 'Flores'}, {first: 'Elbert', last: 'Bass'}, {first: 'Donnie', last: 'Garza'}, {first: 'Timothy', last: 'Brewer'}, {first: 'Kurt', last: 'Harris'}, {first: 'Austin', last: 'Fowler'}, {first: 'Kerry', last: 'Hoffman'}, {first: 'Robert', last: 'Knight'}, {first: 'Dominick', last: 'Rios'}, {first: 'Jeffery', last: 'Medina'}, {first: 'Cesar', last: 'Norris'}, {first: 'Greg', last: 'Ryan'}, {first: 'Patrick', last: 'Bowman'}, {first: 'Adrian', last: 'Harrison'}, {first: 'Dustin', last: 'Osborne'}, {first: 'Jaime', last: 'Alexander'}, {first: 'Colin', last: 'Davis'}, {first: 'Lyle', last: 'Becker'}, {first: 'Dave', last: 'Washington'}, {first: 'Jody', last: 'Wagner'}, {first: 'Lance', last: 'Moreno'}, {first: 'Ramiro', last: 'Hill'}, {first: 'Hugo', last: 'Hammond'}, {first: 'Jessie', last: 'Lloyd'}, {first: 'Benjamin', last: 'Carlson'}, {first: 'Everett', last: 'Foster'}, {first: 'Doyle', last: 'Houston'}, {first: 'Dale', last: 'Mcgee'}, {first: 'Lawrence', last: 'Phelps'}, {first: 'Hubert', last: 'Goodwin'}, {first: 'Harold', last: 'Clark'}, {first: 'Jeffrey', last: 'Martinez'}, {first: 'Javier', last: 'Armstrong'}, {first: 'Eric', last: 'Poole'}, {first: 'Calvin', last: 'Mckenzie'}, {first: 'Ricky', last: 'Newman'}, {first: 'Curtis', last: 'Paul'}, {first: 'Grady', last: 'Rowe'}, {first: 'Clyde', last: 'Guzman'}, {first: 'Aaron', last: 'Kelley'}, {first: 'Tracy', last: 'Haynes'}, {first: 'Alan', last: 'Manning'}, {first: 'Bobby', last: 'Kim'}, {first: 'Luis', last: 'Mack'}, {first: 'Nicolas', last: 'Hamilton'}, {first: 'Erik', last: 'Hubbard'}, {first: 'Damon', last: 'Ellis'}, {first: 'Terrell', last: 'Cross'}, {first: 'Seth', last: 'Elliott'}, {first: 'Jamie', last: 'Coleman'}, {first: 'Marty', last: 'Chapman'}, {first: 'Edmund', last: 'Mann'}, {first: 'Eugene', last: 'Reese'}, {first: 'Bernard', last: 'Carpenter'}, {first: 'Daniel', last: 'Guerrero'}, {first: 'Wilson', last: 'Dunn'}, {first: 'Alton', last: 'Turner'}, {first: 'Toby', last: 'Moss'}, {first: 'Edward', last: 'Larson'}, {first: 'Jon', last: 'Snyder'}, {first: 'Irving', last: 'Lane'}, {first: 'Simon', last: 'Sutton'}, {first: 'Gabriel', last: 'Vargas'}, {first: 'Enrique', last: 'Buchanan'}, {first: 'Allen', last: 'Gonzales'}, {first: 'Wesley', last: 'Schultz'}, {first: 'Cedric', last: 'Mullins'}, {first: 'Derek', last: 'Peterson'}, {first: 'Drew', last: 'Miller'}, {first: 'Ben', last: 'Romero'}, {first: 'Roman', last: 'Gray'}, {first: 'Armando', last: 'Flowers'}, {first: 'Ron', last: 'Fisher'}, {first: 'Nathan', last: 'Hansen'}, {first: 'Paul', last: 'Chandler'}, {first: 'Kirk', last: 'Morris'}, {first: 'Isaac', last: 'Bailey'}, {first: 'Jimmie', last: 'Gregory'}, {first: 'Darnell', last: 'Love'}, {first: 'Raymond', last: 'Butler'}, {first: 'Tomas', last: 'James'}, {first: 'Karl', last: 'Hanson'}, {first: 'Willard', last: 'Scott'}, {first: 'Walter', last: 'Jacobs'}, {first: 'Wilbert', last: 'Martin'}, {first: 'Jonathan', last: 'Higgins'}, {first: 'Virgil', last: 'Mcdaniel'}, {first: 'Sidney', last: 'Parks'}, {first: 'Santos', last: 'Yates'}, {first: 'Shannon', last: 'Gardner'}, {first: 'Jose', last: 'Craig'}, {first: 'Howard', last: 'Silva'}, {first: 'Lloyd', last: 'Parsons'}, {first: 'Marco', last: 'Phillips'}]

let femaleNames = [{first: 'Emma', last: 'Robbins'}, {first: 'Joanne', last: 'Pope'}, {first: 'Vicki', last: 'Horton'}, {first: 'Robin', last: 'Schneider'}, {first: 'Lucy', last: 'Tran'}, {first: 'Vicky', last: 'Burke'}, {first: 'Janis', last: 'Becker'}, {first: 'Leah', last: 'Stone'}, {first: 'Angela', last: 'Davis'}, {first: 'Ora', last: 'Alvarado'}, {first: 'Marie', last: 'Saunders'}, {first: 'Stella', last: 'Mccormick'}, {first: 'Brenda', last: 'Ramsey'}, {first: 'Jean', last: 'Erickson'}, {first: 'Jennifer', last: 'Banks'}, {first: 'Pauline', last: 'Sanders'}, {first: 'Gwendolyn', last: 'Ray'}, {first: 'Grace', last: 'Armstrong'}, {first: 'Katrina', last: 'Patton'}, {first: 'Erin', last: 'Walker'}, {first: 'Bernice', last: 'Watts'}, {first: 'Blanche', last: 'Rodriguez'}, {first: 'Caroline', last: 'Gibbs'}, {first: 'Esther', last: 'Holland'}, {first: 'Bethany', last: 'Wong'}, {first: 'Sandy', last: 'Nichols'}, {first: 'Constance', last: 'Howard'}, {first: 'Sarah', last: 'Ryan'}, {first: 'Bonnie', last: 'Porter'}, {first: 'Beth', last: 'Cain'}, {first: 'Amber', last: 'Vaughn'}, {first: 'Tami', last: 'Garza'}, {first: 'Bobbie', last: 'Young'}, {first: 'Blanca', last: 'Rice'}, {first: 'Heather', last: 'Griffin'}, {first: 'Susie', last: 'Luna'}, {first: 'Monica', last: 'Moss'}, {first: 'Melba', last: 'Swanson'}, {first: 'Becky', last: 'Moore'}, {first: 'Beulah', last: 'Bennett'}, {first: 'Tamara', last: 'Conner'}, {first: 'Erika', last: 'Patrick'}, {first: 'Leslie', last: 'Harrington'}, {first: 'Sheryl', last: 'Moreno'}, {first: 'Elsa', last: 'Hernandez'}, {first: 'Margaret', last: 'Scott'}, {first: 'Tina', last: 'Riley'}, {first: 'Kelley', last: 'Brady'}, {first: 'Velma', last: 'Blair'}, {first: 'Jackie', last: 'Harvey'}, {first: 'Maryann', last: 'Kelly'}, {first: 'April', last: 'Carlson'}, {first: 'Janet', last: 'Hodges'}, {first: 'Charlotte', last: 'Aguilar'}, {first: 'Dawn', last: 'Ingram'}, {first: 'Violet', last: 'Williams'}, {first: 'Dianna', last: 'Willis'}, {first: 'Kendra', last: 'Robertson'}, {first: 'Nancy', last: 'Mills'}, {first: 'Clara', last: 'Love'}, {first: 'Rosie', last: 'Flores'}, {first: 'Hilda', last: 'Frazier'}, {first: 'Angel', last: 'Flowers'}, {first: 'Carla', last: 'Tyler'}, {first: 'Jacquelyn', last: 'Poole'}, {first: 'Cindy', last: 'Cooper'}, {first: 'Lorraine', last: 'Haynes'}, {first: 'Andrea', last: 'Wise'}, {first: 'Hattie', last: 'Richardson'}, {first: 'Kelly', last: 'Ross'}, {first: 'Priscilla', last: 'Bell'}, {first: 'Wanda', last: 'Byrd'}, {first: 'Linda', last: 'Rhodes'}, {first: 'Debbie', last: 'Jordan'}, {first: 'Pat', last: 'Maxwell'}, {first: 'Donna', last: 'Pittman'}, {first: 'Beverly', last: 'Morgan'}, {first: 'Eileen', last: 'Sims'}, {first: 'Arlene', last: 'Lopez'}, {first: 'Adrienne', last: 'Holt'}, {first: 'Carrie', last: 'Wagner'}, {first: 'Mandy', last: 'Ruiz'}, {first: 'Leticia', last: 'Welch'}, {first: 'Irene', last: 'Steele'}, {first: 'Olive', last: 'Rogers'}, {first: 'Kari', last: 'Hines'}, {first: 'Deanna', last: 'Bridges'}, {first: 'Kathy', last: 'Berry'}, {first: 'Heidi', last: 'Collier'}, {first: 'Audrey', last: 'Lee'}, {first: 'Cecilia', last: 'Woods'}, {first: 'Cassandra', last: 'Keller'}, {first: 'Lorena', last: 'Fleming'}, {first: 'Sheila', last: 'Baldwin'}, {first: 'Mae', last: 'Waters'}, {first: 'Gwen', last: 'Terry'}, {first: 'Alexandra', last: 'Malone'}, {first: 'Cristina', last: 'Murphy'}, {first: 'Gretchen', last: 'Reed'}, {first: 'Ethel', last: 'Leonard'}]

let states = JSON.parse('[{"name":"Alabama","abbreviation":"AL"},{"name":"Alaska","abbreviation":"AK"},{"name":"American Samoa","abbreviation":"AS"},{"name":"Arizona","abbreviation":"AZ"},{"name":"Arkansas","abbreviation":"AR"},{"name":"California","abbreviation":"CA"},{"name":"Colorado","abbreviation":"CO"},{"name":"Connecticut","abbreviation":"CT"},{"name":"Delaware","abbreviation":"DE"},{"name":"District Of Columbia","abbreviation":"DC"},{"name":"Federated States Of Micronesia","abbreviation":"FM"},{"name":"Florida","abbreviation":"FL"},{"name":"Georgia","abbreviation":"GA"},{"name":"Guam","abbreviation":"GU"},{"name":"Hawaii","abbreviation":"HI"},{"name":"Idaho","abbreviation":"ID"},{"name":"Illinois","abbreviation":"IL"},{"name":"Indiana","abbreviation":"IN"},{"name":"Iowa","abbreviation":"IA"},{"name":"Kansas","abbreviation":"KS"},{"name":"Kentucky","abbreviation":"KY"},{"name":"Louisiana","abbreviation":"LA"},{"name":"Maine","abbreviation":"ME"},{"name":"Marshall Islands","abbreviation":"MH"},{"name":"Maryland","abbreviation":"MD"},{"name":"Massachusetts","abbreviation":"MA"},{"name":"Michigan","abbreviation":"MI"},{"name":"Minnesota","abbreviation":"MN"},{"name":"Mississippi","abbreviation":"MS"},{"name":"Missouri","abbreviation":"MO"},{"name":"Montana","abbreviation":"MT"},{"name":"Nebraska","abbreviation":"NE"},{"name":"Nevada","abbreviation":"NV"},{"name":"New Hampshire","abbreviation":"NH"},{"name":"New Jersey","abbreviation":"NJ"},{"name":"New Mexico","abbreviation":"NM"},{"name":"New York","abbreviation":"NY"},{"name":"North Carolina","abbreviation":"NC"},{"name":"North Dakota","abbreviation":"ND"},{"name":"Northern Mariana Islands","abbreviation":"MP"},{"name":"Ohio","abbreviation":"OH"},{"name":"Oklahoma","abbreviation":"OK"},{"name":"Oregon","abbreviation":"OR"},{"name":"Palau","abbreviation":"PW"},{"name":"Pennsylvania","abbreviation":"PA"},{"name":"Puerto Rico","abbreviation":"PR"},{"name":"Rhode Island","abbreviation":"RI"},{"name":"South Carolina","abbreviation":"SC"},{"name":"South Dakota","abbreviation":"SD"},{"name":"Tennessee","abbreviation":"TN"},{"name":"Texas","abbreviation":"TX"},{"name":"Utah","abbreviation":"UT"},{"name":"Vermont","abbreviation":"VT"},{"name":"Virgin Islands","abbreviation":"VI"},{"name":"Virginia","abbreviation":"VA"},{"name":"Washington","abbreviation":"WA"},{"name":"West Virginia","abbreviation":"WV"},{"name":"Wisconsin","abbreviation":"WI"},{"name":"Wyoming","abbreviation":"WY"}]')

const getRandElement = (arr) => {
  let len = arr.length
  let num = Math.floor(Math.random() * len)
  return arr[num]
}

const getRandNum = (min, max) => {
  let num = Math.floor(Math.random() * max - min) + min
  return num
}

const getRandNumLen = (len) => {
  let num = ''
  for (let i = 0; i < len; i++) {
    num += getRandNum(0, 10)
  }
  return num
}

const getDate = () => {
  let today = new Date()
  let year = today.getFullYear()
  let day = today.getDate()
  let month = today.getMonth() + 1
  if (day < 10) {
    day = '0' + day
  }
  if (month < 10) {
    month = '0' + month
  }

  return month + '/' + day + '/' + year
}

const getRandDob = () => {
  let start = new Date('1990', '0', '1')
  let end = new Date('2012', '0', '1')
  let randDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  let year = randDate.getFullYear()
  let day = randDate.getDate()
  let month = randDate.getMonth() + 1
  if (day < 10) {
    day = '0' + day
  }
  if (month < 10) {
    month = '0' + month
  }

  return month + '/' + day + '/' + year
}

const getGroup = (dob) => {
  let date = dob.split('/')
  if (parseInt(date[2]) <= 1996) {
    return 'adult'
  } else if (parseInt(date[2]) >= 2003) {
    return 'youth'
  } else {
    return getRandElement(groups)
  }
}

const fillDb = (numEntries) => {
  let alex = {email: 'moores.alexd@gmail.com', name: 'Alex Moores', password: bcrypt.hashSync(config.testAccounts.testPass[0]), isAdmin: 1, verified: 1, verificationCode: '3SxowfTEgCaNn3t7'}
  let eddie = {email: 'dcvault@gmail.com', name: 'Eddie Luthy', password: bcrypt.hashSync(config.testAccounts.testPass[1]), isAdmin: 1, verified: 1, verificationCode: '3SxowfTEgCaNB3t7'}
  let tester = {email: 'tester@gmail.com', name: 'Test Mcghee', password: bcrypt.hashSync(config.testAccounts.testPass[2]), isAdmin: 0, verified: 1, verificationCode: '3SxowfTEgCaNB3t7'}

  db.tables.Users.create(alex)
  db.tables.Users.create(eddie)
  db.tables.Users.create(tester).then((newUser) => {
    let athlete = {}
    athlete.userId = newUser.id
    athlete.gender = 'male'
    athlete.firstName = "Christian"
    athlete.lastName = "Dinicodkvoejrks"
    athlete.email = 'tester@gmail.com'
    athlete.emergencyContactName = newUser.name
    athlete.emergencyContactMDN = getRandNumLen(3) + '-' + getRandNumLen(3) + '-' + getRandNumLen(4)
    athlete.emergencyContactRelation = getRandElement(['guardian', 'father', 'mother', 'parent'])
    athlete.usatf = getRandNumLen(10)
    athlete.dob = getRandDob()
    athlete.state = getRandElement(states).abbreviation
    athlete.medConditions = 'none'
    db.tables.Athletes.create(athlete)
    .then((newAthlete) => {
      let purchase = {}
      purchase.userId = newAthlete.userId
      purchase.athleteId = newAthlete.id
      purchase.group = getGroup(athlete.dob)
      purchase.quarter = (purchase.group === 'youth' || purchase.group === 'adult') ? 'fall' : getRandElement(quarters)
      purchase.facility = getRandElement(facilities)
      purchase.waiverSignatory = newUser.name
      purchase.waiverDate = getDate()
      purchase.paymentId = helpers.randString()
      purchase.payerId = helpers.randString()
      db.tables.Purchases.create(purchase).then((newPurchase) => {
        if (newPurchase.id === numEntries) {
          console.log('done')
          schema.close()
          // process.exit();
        }
      })

      let athleteProfile = {};
      athleteProfile.firstName = "Christian";
      athleteProfile.lastName = "Long Last Name";
      athleteProfile.nationality = 'IT';
      athleteProfile.userId = newUser.id;
      athleteProfile.height = 73;
      athleteProfile.weight = 168;
      athleteProfile.dob = newAthlete.dob;
      db.tables.AthleteProfiles.create(athleteProfile);
    })
  });

  let users = []
  for (let i = 0; i < numEntries; i++) {
    let user = {}
    let nameObj = getRandNum(0, 1) === 1 ? getRandElement(maleNames) : getRandElement(femaleNames)
    user.email = (nameObj.first + nameObj.last + '@example.com').toLowerCase()
    user.verified = 1
    user.isAdmin = 0
    user.name = nameObj.first + ' ' + nameObj.last
    user.verificationCode = helpers.randString()
    let pass = 'password1'//helpers.randString()
    user.password = bcrypt.hashSync(pass)
    users.push({email: user.email, pass: pass})
    db.tables.Users.create(user)
    .then((newUser) => {
      let athlete = {}
      athlete.userId = newUser.id
      athlete.gender = getRandNum(0, 1) === 1 ? 'male' : 'female'
      nameObj = athlete.gender === 'male' ? getRandElement(maleNames) : getRandElement(femaleNames)
      athlete.firstName = nameObj.first
      athlete.lastName = nameObj.last
      athlete.email = (nameObj.first + nameObj.last + '@example.com').toLowerCase()
      athlete.emergencyContactName = newUser.name
      athlete.emergencyContactMDN = getRandNumLen(3) + '-' + getRandNumLen(3) + '-' + getRandNumLen(4)
      athlete.emergencyContactRelation = getRandElement(['guardian', 'father', 'mother', 'parent'])
      athlete.usatf = getRandNumLen(10)
      athlete.dob = getRandDob()
      athlete.state = getRandElement(states).abbreviation
      athlete.medConditions = 'none'
      db.tables.Athletes.create(athlete)
      .then((newAthlete) => {
        let purchase = {}
        purchase.userId = newAthlete.userId
        purchase.athleteId = newAthlete.id
        purchase.group = getGroup(athlete.dob)
        purchase.quarter = (purchase.group === 'youth' || purchase.group === 'adult') ? 'fall' : getRandElement(quarters)
        purchase.facility = getRandElement(facilities)
        purchase.waiverSignatory = user.name
        purchase.waiverDate = getDate()
        purchase.paymentId = helpers.randString()
        purchase.payerId = helpers.randString()
        db.tables.Purchases.create(purchase).then((newPurchase) => {
          if (newPurchase.id === numEntries) {
            console.log('done')
            schema.close()
            // process.exit();
          }
        })

        let athleteProfile = {};
        athleteProfile.nationality = getRandElement([null, 'US', 'IT', 'GB', 'FR']);
        athleteProfile.userId = newUser.id;
        athleteProfile.firstName = athlete.firstName;
        athleteProfile.lastName = athlete.lastName;
        athleteProfile.weight = getRandNum(80, 200);
        athleteProfile.height = getRandNum(48, 76);
        athleteProfile.dob = athlete.dob;
        athleteProfile.gender = athlete.gender;
        db.tables.AthleteProfiles.create(athleteProfile)
        .then((newProfile) => {
          let jump = {}
          jump.athleteProfileId = newProfile.id;
          jump.date = new Date();
          jump.setting = "Meet";
          jump.heightInches = getRandNum(84, 240);
          jump.stepNum = getRandNum(1, 8);
          jump.verified = true;

          db.tables.Jumps.create(jump)
          .then(newJump => {
            // let pr = {}
            // pr.athleteProfileId = newProfile.id;
            // pr.stepNum = newJump.stepNum;
            // pr.jumpId = newJump.id;
            // db.tables.PersonalRecords.create(pr); // TODO: fails.
          })
        });
      })
    })
  }
}

if (config.misc.isTest) {
  db.syncTables(schema, true).then(() => {
    fillDb(50)
  })
} else {
  console.log('THIS NOT A TEST VERSION, REFUSE TO OVERWRITE DB')
}

// columns.users = {
//   email: Sequelize.STRING,
//   password: Sequelize.STRING,
//   verified: {type: Sequelize.BOOLEAN, defaultValue: false},
//   isAdmin: {type: Sequelize.BOOLEAN, defaultValue: false},
//   verificationCode: Sequelize.STRING,
//   name: Sequelize.STRING
//   // Address FK
// };

// columns.athletes = {
//   firstName: Sequelize.STRING,
//   lastName: Sequelize.STRING,
//   email: {type: Sequelize.STRING, unique: false},
//   emergencyContactName: Sequelize.STRING,
//   emergencyContactMDN: Sequelize.STRING,
//   emergencyContactRelation: Sequelize.STRING,
//   usatf: Sequelize.STRING,
//   dob: Sequelize.STRING,
//   gender: Sequelize.STRING,
//   state: Sequelize.STRING,
//   school: Sequelize.STRING,
//   medConditions: Sequelize.TEXT
//   // User FK
// };

// columns.purchases = {
//   // athleteFK, userFK
//   quarter: Sequelize.STRING,
//   group: Sequelize.STRING,
//   facility: Sequelize.STRING,
//   waiverSignatory: Sequelize.STRING,
//   waiverDate: Sequelize.STRING,
//   paymentId: Sequelize.STRING,
//   payerId: Sequelize.STRING
// };
