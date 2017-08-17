'use strict';

const path = require('path');
const jwt = require('jwt-simple');
const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const helpers = require('./lib/helpers');
const config = require('./config/config');
const bodyParser = require('body-parser');
const morgan = require('morgan');


module.exports = (app, db) => {

  var discountsUsed = [];

  // External Middleware
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // Registration Endpoints

  // app.get('/create_test_code', (req, res) => {
  //   db.tables.Discounts.create({
  //     code: 'abcdef',
  //     type: 'Military',
  //     amount: .25
  //   });

  //   res.end();
  // });

  app.post('/registration/confirm', (req, res) => {
    let email = req.body.email;
    if(email) {
      helpers.sendConfirmationEmails(email);
      res.send({ok: true, message: 'email sent'});
    } else {
      res.status(400).send({ok: false, message: 'no or bad email'});
    }
  });

  app.post('/registration/discount', (req, res) => {

    let code = req.body.code;

    if (!code) {
      res.status(400).send({ok: false, message: 'no code given'});
    } else {
      db.tables.Discounts.find({where: {code: code}}).then((discount) => {
        if (!discount || discount.uses === 0) {
          res.status(400).send({ok: false, message: 'not a valid code'});
        } else {
          res.send({ok: true, message: 'code accepted', amount: discount.amount, code: discount.code});
        }
      })
    }
  });

  app.post('/discounts/create', (req, res) => {
    if (!req.body.amount || !req.body.description || !req.body.token) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}));
    } else {
      let user = {};
      try {
        user = jwt.decode(req.body.token, config.auth.secret);
      } catch (e) {}
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((user) => {
        if (!user || !user.isAdmin) {
          console.log(user);
          res.status(300).send({ok: false, message: 'unauthorized'});
        } else {
          let code = helpers.randString();
          req.body.amount = req.body.amount > 1 ? 1 : req.body.amount;
          req.body.amount = req.body.amount < 0 ? 0 : req.body.amount;

          db.tables.Discounts.create({type: req.body.description, code: code, amount: req.body.amount})
          .then((code) => {
            res.send({ok: true, message: 'code created'});
          })
          .catch(() => {
            res.status(500).send({ok: false, message: 'db error'});
          })
        }
      });
    }
  })

  app.post('/registration/finalize', (req, res) => {
    // console.log(req.body)
    if (!req.body.purchaseInfo || !req.body.token) {
      res.status(400).send({ok: false, message: 'missing purchase details'})
    } else {
      let user = jwt.decode(req.body.token, config.auth.secret);
      db.tables.Users.find({where: {id: user.id, email: user.email}}).then((user) => {
        if (!user) {
          res.status(300).send({ok: false, message: 'bad user token'})
        } else {
          let athlete = req.body.purchaseInfo.athleteInfo
          db.tables.Athletes.findOrCreate({where: {email: athlete.email}, defaults: {
            firstName: athlete.fname,
            lastName: athlete.lname,
            dob: athlete.dob,
            email: athlete.email,
            emergencyContactName: athlete['emergency-contact'],
            emergencyContactRelation: athlete['emergency-relation'],
            emergencyContactMDN: athlete['emergency-phone'],
            school: athlete.school,
            state: athlete.state,
            usatf: athlete.usatf,
            gender: athlete.gender,
            userId: user.id
          }}).then((newAthlete) => {
            let purchaseInfo = req.body.purchaseInfo;
            let athleteId = newAthlete[0].dataValues.id;
            let userId = newAthlete[0].dataValues.userId;
            db.tables.Purchases.create({
              athleteId: athleteId,
              userId: userId,
              quarter: purchaseInfo.selectPackage.quarter,
              group: purchaseInfo.selectPackage.group,
              facility: purchaseInfo.selectPackage.facility,
              waiverSignatory: purchaseInfo.agreement.name,
              waiverDate: purchaseInfo.agreement.date,
              paymentId: purchaseInfo.payment.paymentId,
              payerId: purchaseInfo.payment.payerId
            }).then(() => {
              db.tables.Discounts.destroy({where: {code: purchaseInfo.payment.discount}});
              res.send({ok: true, message: 'purchase record saved'});
            })
          })
        }
      })
      .catch((error) => {
        res.status(500).send({ok: false, message: 'a db error has occurred', error: error})
      });
    }
  });

  // DELETE REQ?

  //End Registration Endpoints

  // Users Section
  app.post('/users/create', (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}));
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (!!user) {
          res.status(400).send(JSON.stringify({ok: false, message: 'user already exists'}))
        } else {
          let verificationCode = helpers.randString();
          helpers.sendCode(verificationCode, req.body.email);
          db.tables.Users.create({email: req.body.email, password: bcrypt.hashSync(req.body.password), verificationCode: verificationCode});
          res.send(JSON.stringify({ok: true, message: 'user created'}));
        }
      });
    }
  });

  app.post('/users/resend', (req, res) => {
    if (!req.body.email) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}));
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if(!user) {
          res.status(300).send(JSON.stringify({ok: false, message: 'user does not exist'}));
        } else {
          helpers.sendCode(user.verificationCode, user.email);
          res.send({ok: true, message: 'resent'});
        }
      }).catch((error) => {
        res.status(500).send({ok: false, message: 'an unknown error has occurred'});
      })
    }
  })

  app.post('/users/authenticate', (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}));
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
          res.status(300).send(JSON.stringify({ok: false, message: 'username or password incorrect'}));
        } else if (!user.verified) {
          res.status(300).send(JSON.stringify({ok: false, message: 'unverified'}));
        } else {
          let token = jwt.encode(user, config.auth.secret);
          res.send(JSON.stringify({ok: true, message: 'user authenticated', token: token}));
        }
      });
    }
  });

  app.post('/users/token', (req, res) => {
    let token = req.body.token;
    if (!token) {
      res.status(300).send(JSON.stringify({ok: false, message: 'bad or no token'}));
    } else {
      let user = null;
      try {
        user = jwt.decode(token, config.auth.secret);
        // console.log(user);
      } catch (e) {

      }
      if (!!user) {
        db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
          if (!!foundUser) {
            res.send(JSON.stringify({ok: true, message: 'user authenticated', token: token}));
          } else {
            res.status(300).send(JSON.stringify({ok: false, message: 'invalid user token'}));
          }
        });
      } else {
        res.status(300).send(JSON.stringify({ok: false, message: 'bad or no token'}));
      }
    }
  });

  app.post('/users/update', (req, res) => {
    if (!req.body.token) {
      res.status(300).send(JSON.stringify({ok: false, message: 'bad or no token'}));
    } else {
      let user = null;
      try {
        user = jwt.decode(token, config.auth.secret);
      } catch (e) {}
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((existingUser) => {
        if (!user) {
          res.status(300).send(JSON.stringify({ok: false, message: 'user does not exist'}));
        } else {
          let newPassword = !!req.body.newInfo.password ? bcrypt.hashSync(req.body.newInfo.password) : user.password;
          let newName = !!req.body.newInfo.name ? req.body.newInfo.name : user.name;
          user.update({
            password: newPassword,
            name: newName
          }).then((user) => {
            let token = jwt.encode(user, config.auth.secret);
            res.send(JSON.stringify({ok: true, message: 'user profile updated', token: token}));
          });
        }
      })
    }
  });

  app.get('/users/verify', (req, res) => {
    let code = req.query.code;
    if (!!code) {
      db.tables.Users.find({where: {verificationCode: code}}).then((user) => {
        if (!user) {
          res.status(400).redirect('/');
        } else {
          if (!user.verified) {
            db.tables.Users.update({verified: true}, {where: {id: user.id}});
            res.redirect('/#justVerified=true');
          } else {
            res.redirect('/#alreadyVerified=true');
          }
        }
      });
    } else {
      res.status(400).redirect('/');
    }
  });

  app.post('/users/forgot', (req, res) => {
    if (!req.body.email) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}));
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (!user) {
          res.status(300).send(JSON.stringify({ok: false, message: 'user does not exist'}));
        } else {
          let newPass = helpers.randString()
          db.tables.Users.update({password: bcrypt.hashSync(newPass)}, {where: {id: user.id}}).then(() => {
            helpers.resetPass(newPass, user.email);
            res.send(JSON.stringify({ok: true, message: 'temporary password sent'}));
          });
        }
      });
    }
  });

  app.post('/users/info', (req, res) => {
    let token = req.body.token;
    if (!token) {
      res.status(300).send(JSON.stringify({ok: false, message: 'bad or no token'}));
    } else {
      let user = null;
      try {
        user = jwt.decode(token, config.auth.secret);
      } catch (e) {
      }
      if (!!user) {
        db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
          if (!!foundUser) {
            let returnUser = {
              id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
              address: null,
              isAdmin: foundUser.isAdmin
            };

            let promiseList = [];
            let discounts = [];
            if (returnUser.isAdmin) {
              promiseList.push(db.tables.Discounts.findAll().then((discountList) => {
                discounts = discountList;
              }));
            }

            let athletes = [];
            let purchases = [];
            let getAthleteList = db.tables.Athletes.findAll({where: {userId: foundUser.id}}).then((athleteList) => {
              if (Array.isArray(athleteList)) {
                athletes = athleteList;
              }
            });
            promiseList.push(getAthleteList);
            let getPurchaseList = db.tables.Purchases.findAll({where: {userId: foundUser.id}}).then((purchaseList) => {
              if (Array.isArray(purchaseList)) {
                purchases = purchaseList;
              }
            })
            promiseList.push(getPurchaseList);
            let getUserAddress = db.tables.Addresses.find({where: {id: foundUser.addressId}}).then((address) => {
              if (!!address) {
                returnUser.address = address;
              }
            });
            promiseList.push(getUserAddress);

            Promise.all(promiseList).then(() => {
              res.json({ok: true, message: 'found user info', user: returnUser, athletes: athletes, purchases: purchases, discounts: discounts});
            });
          } else {
            res.status(300).send(JSON.stringify({ok: false, message: 'invalid user token'}));
          }
        });
      } else {
        res.status(300).send(JSON.stringify({ok: false, message: 'bad or no token'}));
      }
    }
  });
  // End Users Section



  // Catchall redirect to home page
  app.get('*', (req, res) => {
    res.redirect('/');
  })

}