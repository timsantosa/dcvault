'use strict';

const path = require('path');
const jwt = require('jwt-simple');
const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const helpers = require('./lib/helpers');
const config = require('./config/config');
const bodyParser = require('body-parser');


module.exports = (app, db) => {
  // External Middleware
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));


  // Endpoints

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

  app.post('/users/authenticate', (req, res) => {
    console.log(req.body);
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
      let user = jwt.decode(token, config.auth.secret);
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
        if (!!foundUser) {
          res.send(JSON.stringify({ok: true, message: 'user authenticated', token: token}));
        } else {
          res.status(300).send(JSON.stringify({ok: false, message: 'invalid user token'}));
        }
      });
    }
  });

  app.post('/users/update', (req, res) => {
    // for adding new information to user accounts.
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
            console.log('user verified?', user.verified);
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
  })
  // End Users Section


}