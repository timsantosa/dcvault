'use strict'

const path = require('path')
const jwt = require('jwt-simple')
const express = require('express')
const bcrypt = require('bcrypt-nodejs')
const helpers = require('./lib/helpers')
const config = require('./config/config')
const bodyParser = require('body-parser')
const morgan = require('morgan')

module.exports = (app, db) => {
  // External Middleware
  app.use(express.static(path.join(__dirname, '../client')))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(morgan('combined'))

  // Misc endpoints

  app.post('/contact', (req, res) => {
    let to = req.body.to
    let from = req.body.from
    let text = req.body.text
    let subject = req.body.subject
    let name = req.body.name

    if (!to || !from || !text || !subject || !name) {
      res.status(400).send({ok: false, message: 'incomplete request'})
    } else {
      helpers.sendWithReplyTo(name, from, to, subject, text).then(() => {
        res.send({ok: true, message: 'email sent successfully'})
      }, (err) => {
        res.status(500).send({ok: false, message: 'server error'})
      })
    }
  })

  // Pole Endpoints

  app.post('/poles/list', (req, res) => {
    if (!req.body.token) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else {
          db.tables.Poles.findAll().then(poles => {
            res.send({ok: true, message: 'pole list request accepted', poles})
          })
        }
      })
    }
  })

  app.post('/poles/add', (req, res) => {
    if (!req.body.token || !req.body.newPole) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let newPole = null
      try {
        newPole = JSON.parse(req.body.newPole)
      } catch (e) {}
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else if (!newPole) {
          res.status(400).send({ok: false, message: 'bad JSON in newPole'})
        } else {
          db.tables.Poles.create(newPole).then(newPole => {
            res.send({ok: true, message: 'pole record added successfully', newPole})
          })
        }
      })
    }
  })

  app.post('/poles/delete', (req, res) => {
    if (!req.body.token || !req.body.poleId) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else {
          db.tables.Poles.destroy({where: {id: req.body.poleId}}).then(oldPole => {
            res.send({ok: true, message: 'pole record deleted successfully', oldPole})
          })
        }
      })
    }
  })

  app.post('/poles/update', (req, res) => {
    if (!req.body.token || !req.body.updatedPole) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let updatedPole = null
      try {
        updatedPole = JSON.parse(req.body.updatedPole)
      } catch (e) {}
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else if (!updatedPole) {
          res.status(400).send({ok: false, message: 'bad request'})
        } else {
          db.tables.Poles.find({where: {id: updatedPole.id}}).then(foundPole => {
            if (!foundPole) {
              res.status(400).send({ok: false, message: 'pole not found'})
            } else {
              foundPole.update(updatedPole).then(updatedPole => {
                res.send({ok: true, message: 'pole record updated successfully', updatedPole})
              })
            }
          })
        }
      })
    }
  })

  // Rental Endpoints

  app.post('/rentals/list', (req, res) => {
    if (!req.body.token) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else {
          db.tables.Rentals.findAll().then(rentals => {
            res.send({ok: true, message: 'rental list request accepted', rentals})
          })
        }
      })
    }
  })

  app.post('/rentals/request', (req, res) => {
    if (!req.body.token || !req.body.athleteId || !req.body.period || !req.body.quarter) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user) {
          res.status(400).send({ok: false, message: 'bad user token'})
        } else {
          db.tables.Athletes.find({where: {id: req.body.athleteId}}).then(athlete => {
            if (!athlete || (!user.isAdmin && athlete.userId !== user.id)) {
              res.status(400).send({ok: false, message: 'athlete not found'})
            } else {
              let request = {
                type: req.body.period,
                year: (new Date()).getFullYear()
              }
              let expiration
              if (request.type === 'quarterly') {
                if (req.body.quarter === 'winter') {
                  expiration = new Date(request.year + 1, 2, 1)
                } else if (req.body.quarter === 'spring') {
                  expiration = new Date(request.year, 5, 1)
                } else if (req.body.quarter === 'summer') {
                  expiration = new Date(request.year, 8, 1)
                } else {
                  expiration = new Date(request.year, 11, 1)
                }
              } else {
                expiration = new Date(Date.now() + 1209600000)
              }
              db.tables.Rentals.create({expiration, athleteId: athlete.id}).then(rental => {
                res.send({ok: true, message: 'rental request created', rental})
              })
            }
          })
        }
      })
    }
  })

  app.post('/rentals/fulfill', (req, res) => {
    if (!req.body.token || !req.body.rentalId || !req.body.poleId) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else {
          let rental, pole
          let p1 = db.tables.Poles.find({where: {id: req.body.poleId}}).then(foundPole => {
            pole = foundPole
          })
          let p2 = db.tables.Rentals.find({where: {id: req.body.rentalId}}).then(foundRental => { rental = foundRental })
          Promise.all([p1, p2]).then(() => {
            if (!rental || !pole) {
              res.status(400).send({ok: false, message: 'record not found'})
            } else {
              rental.update({poleId: pole.id}).then(updatedRental => {
                pole.update({rented: true}).then((updatedPole) => {
                  res.send({ok: true, message: 'rental updated', updatedRental, updatedPole})
                })
              })
            }
          })
        }
      })
    }
  })

  app.post('/rentals/end', (req, res) => {
    if (!req.body.token || !req.body.rentalId) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else {
          db.tables.Rentals.find({where: {id: req.body.rentalId}}).then(rental => {
            rental.getPole().then(pole => {
              if (!rental) {
                res.status(400).send({ok: false, message: 'record not found'})
              } else if (!pole) {
                rental.destroy().then(numDestroyed => {
                  res.send({ok: true, message: 'rental ended', updatedPole: null})
                })
              } else {
                rental.destroy().then(numDestroyed => {
                  pole.update({rented: false}).then((updatedPole) => {
                    res.send({ok: true, message: 'rental ended', updatedPole})
                  })
                })
              }
            })
          })
        }
      })
    }
  })

  app.post('/rentals/update', (req, res) => {
    if (!req.body.token || !req.body.updatedRental) {
      res.status(400).send({ok: false, message: 'bad request'})
    } else {
      let tokenDecoded = helpers.decodeUser(req.body.token)
      db.tables.Users.find({where: {id: tokenDecoded.id}}).then(user => {
        let updatedRental = null
        try {
          updatedRental = JSON.parse(req.body.updatedRental)
        } catch (e) {}
        if (!user || !user.isAdmin) {
          res.status(300).send({ok: false, message: 'unauthorized'})
        } else if (!updatedRental) {
          res.status(400).send({ok: false, message: 'bad rental object'})
        } else {
          db.tables.Rentals.find({where: {id: updatedRental.id}}).then(rental => {
            if (!rental) {
              res.status(400).send({ok: false, message: 'record not found'})
            } else {
              rental.update(updatedRental).then(newRental => {
                res.send({ok: true, message: 'record updated', newRental})
              })
            }
          })
        }
      })
    }
  })

  // Registration Endpoints

  app.post('/registration/invite', (req, res) => {
    let code = req.body.code
    if (!code) {
      res.status(400).send({ok: false, message: 'no code given'})
    } else {
      db.tables.Invites.find({where: {code: code}}).then((invite) => {
        if (!invite) {
          res.status(400).send({ok: false, message: 'not a valid code'})
        } else {
          res.send({ok: true, message: 'code accepted', invite: invite})
        }
      })
    }
  })

  app.post('/registration/confirm', (req, res) => {
    let email = req.body.email
    if (email) {
      helpers.sendConfirmationEmails(email)
      res.send({ok: true, message: 'email sent'})
    } else {
      res.status(400).send({ok: false, message: 'no or bad email'})
    }
  })

  app.post('/registration/discount', (req, res) => {
    let code = req.body.code

    if (!code) {
      res.status(400).send({ok: false, message: 'no code given'})
    } else {
      db.tables.Discounts.find({where: {code: code}}).then((discount) => {
        if (!discount || discount.uses === 0) {
          res.status(400).send({ok: false, message: 'not a valid code'})
        } else {
          res.send({ok: true, message: 'code accepted', amount: discount.amount, code: discount.code})
        }
      })
    }
  })

  app.post('/invites/create', (req, res) => {
    if (!req.body.level || !req.body.description || !req.body.token) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}))
    } else {
      let user = {}
      try {
        user = jwt.decode(req.body.token, config.auth.secret)
      } catch (e) {}
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((user) => {
        if (!user || !user.isAdmin) {
          res.status(403).send({ok: false, message: 'unauthorized'})
        } else {
          let code = helpers.randString()

          db.tables.Invites.create({type: req.body.description, code: code, level: req.body.level})
          .then((code) => {
            res.send({ok: true, message: 'code created'})
          })
          .catch(() => {
            res.status(500).send({ok: false, message: 'db error'})
          })
        }
      })
    }
  })

  app.post('/discounts/create', (req, res) => {
    if (!req.body.amount || !req.body.description || !req.body.token) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}))
    } else {
      let user = {}
      try {
        user = jwt.decode(req.body.token, config.auth.secret)
      } catch (e) {}
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((user) => {
        if (!user || !user.isAdmin) {
          res.status(403).send({ok: false, message: 'unauthorized'})
        } else {
          let code = helpers.randString()
          req.body.amount = req.body.amount > 1 ? 1 : req.body.amount
          req.body.amount = req.body.amount < 0 ? 0 : req.body.amount

          db.tables.Discounts.create({type: req.body.description, code: code, amount: req.body.amount})
          .then((code) => {
            res.send({ok: true, message: 'code created'})
          })
          .catch(() => {
            res.status(500).send({ok: false, message: 'db error'})
          })
        }
      })
    }
  })

  app.post('/registration/finalize', (req, res) => {
    if (!req.body.purchaseInfo || !req.body.token) {
      res.status(400).send({ok: false, message: 'missing purchase details'})
    } else {
      let user = jwt.decode(req.body.token, config.auth.secret)
      db.tables.Users.find({where: {id: user.id, email: user.email}}).then((user) => {
        if (!user) {
          res.status(403).send({ok: false, message: 'bad user token'})
        } else {
          let athlete = req.body.purchaseInfo.athleteInfo
          db.tables.Athletes.findOne({where: {firstName: athlete.fname, lastName: athlete.lname, dob: athlete.dob}}).then((foundAthlete) => {
            let athleteData = {
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
              userId: user.id,
              medConditions: athlete.conditions
            }
            if (!foundAthlete) {
              return db.tables.Athletes.create(athleteData)
            } else {
              return foundAthlete.update(athleteData)
            }
          }).then((newAthlete) => {
            let purchaseInfo = req.body.purchaseInfo
            let athleteId = newAthlete.dataValues.id
            let userId = newAthlete.dataValues.userId
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
              db.tables.Invites.destroy({where: {code: purchaseInfo.selectPackage.invite}})
              db.tables.Discounts.destroy({where: {code: purchaseInfo.payment.discount}})
              res.send({ok: true, message: 'purchase record saved'})
            })
          })
        }
      })
      .catch((error) => {
        res.status(500).send({ok: false, message: 'a db error has occurred', error: error})
      })
    }
  })

  app.get('/registration/options', (req, res) => {
    db.tables.TrainingOptions.find({where: {id: 1}}).then(options => {
      if (!options) {
        res.status(400).send({ok: false, message: 'record not found'})
      } else {
        res.send({ok: true, message: 'retrieved training options', options})
      }
    }).catch(e => {
      res.status(500).send({ok: false, message: 'an internal error has ocurred'})
    })
  })

  app.post('/registration/options', (req, res) => {
    db.tables.TrainingOptions.find({where: {id: 1}}).then(options => {
      if (!options) {
        let options = {
          fall: false,
          winter: false,
          spring: false,
          summer: true,
          youthAdult: true,
          dcv: false,
          balt: false,
          prep: false,
          ncs: false,
          cua: false,
          pg: false,
          pa: false
        }
        db.tables.TrainingOptions.create(options)
      } else {
        res.send({ok: true, message: 'retrieved training options', options})
      }
    }).catch(e => {
      res.status(500).send({ok: false, message: 'an internal error has ocurred'})
    })
  })

  // DELETE REQ?

  // End Registration Endpoints

  // Users Section
  app.post('/users/create', (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}))
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (user) {
          res.status(400).send(JSON.stringify({ok: false, message: 'user already exists'}))
        } else {
          let verificationCode = helpers.randString()
          helpers.sendCode(verificationCode, req.body.email)
          db.tables.Users.create({email: req.body.email, password: bcrypt.hashSync(req.body.password), verificationCode: verificationCode})
          res.send(JSON.stringify({ok: true, message: 'user created'}))
        }
      })
    }
  })

  app.post('/users/resend', (req, res) => {
    if (!req.body.email) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}))
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (!user) {
          res.status(403).send(JSON.stringify({ok: false, message: 'user does not exist'}))
        } else {
          helpers.sendCode(user.verificationCode, user.email)
          res.send({ok: true, message: 'resent'})
        }
      }).catch((error) => {
        res.status(500).send({ok: false, message: 'an unknown error has occurred'})
      })
    }
  })

  app.post('/users/authenticate', (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}))
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
          res.status(403).send(JSON.stringify({ok: false, message: 'username or password incorrect'}))
        } else if (!user.verified) {
          res.status(403).send(JSON.stringify({ok: false, message: 'unverified'}))
        } else {
          let token = jwt.encode(user, config.auth.secret)
          res.send(JSON.stringify({ok: true, message: 'user authenticated', token: token}))
        }
      })
    }
  })

  app.post('/users/token', (req, res) => {
    let token = req.body.token
    if (!token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
    } else {
      let user = null
      try {
        user = jwt.decode(token, config.auth.secret)
      } catch (e) {

      }
      if (user) {
        db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
          if (foundUser) {
            res.send(JSON.stringify({ok: true, message: 'user authenticated', token: token}))
          } else {
            res.status(403).send(JSON.stringify({ok: false, message: 'invalid user token'}))
          }
        })
      } else {
        res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
      }
    }
  })

  app.post('/users/update', (req, res) => {
    if (!req.body.token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
    } else {
      let token = req.body.token
      let user = null
      try {
        user = jwt.decode(token, config.auth.secret)
      } catch (e) {
      }
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((existingUser) => {
        if (!user) {
          res.status(403).send(JSON.stringify({ok: false, message: 'user does not exist'}))
        } else {
          let newPassword = req.body.newInfo.password ? bcrypt.hashSync(req.body.newInfo.password) : user.password
          let newName = req.body.newInfo.name ? req.body.newInfo.name : user.name
          existingUser.update({
            password: newPassword,
            name: newName
          }).then((user) => {
            let token = jwt.encode(user, config.auth.secret)
            res.send(JSON.stringify({ok: true, message: 'user profile updated', token: token}))
          })
        }
      })
    }
  })

  app.get('/users/verify', (req, res) => {
    let code = req.query.code
    if (code) {
      db.tables.Users.find({where: {verificationCode: code}}).then((user) => {
        if (!user) {
          res.status(400).redirect('/')
        } else {
          if (!user.verified) {
            db.tables.Users.update({verified: true}, {where: {id: user.id}})
            res.redirect('/#justVerified=true')
          } else {
            res.redirect('/#alreadyVerified=true')
          }
        }
      })
    } else {
      res.status(400).redirect('/')
    }
  })

  app.post('/users/forgot', (req, res) => {
    if (!req.body.email) {
      res.status(400).send(JSON.stringify({ok: false, message: 'bad request'}))
    } else {
      db.tables.Users.find({where: {email: req.body.email}}).then((user) => {
        if (!user) {
          res.status(403).send(JSON.stringify({ok: false, message: 'user does not exist'}))
        } else {
          let newPass = helpers.randString()
          db.tables.Users.update({password: bcrypt.hashSync(newPass)}, {where: {id: user.id}}).then(() => {
            helpers.resetPass(newPass, user.email)
            res.send(JSON.stringify({ok: true, message: 'temporary password sent'}))
          })
        }
      })
    }
  })

  app.post('/users/info', (req, res) => {
    let token = req.body.token
    if (!token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
    } else {
      let user = null
      try {
        user = jwt.decode(token, config.auth.secret)
      } catch (e) {
      }
      if (user) {
        db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
          if (foundUser) {
            if (foundUser.isAdmin) {
              db.tables.Purchases.findAll().then((purchases) => {
                db.tables.Athletes.findAll().then((athletes) => {
                  let quarter = helpers.getCurrentQuarter()
                  let year = new Date().getFullYear()
                  athletes = athletes.map(athlete => {
                    let currentlyRegistered = false
                    for (let i = 0; i < purchases.length; i++) {
                      let purchaseYear = new Date(purchases[i].createdAt).getFullYear()
                      if (purchases[i].athleteId === athlete.id && purchases[i].quarter.indexOf(quarter) !== -1 && purchaseYear === year) {
                        currentlyRegistered = true
                        break
                      }
                    }
                    athlete.dataValues.currentlyRegistered = currentlyRegistered
                    return athlete
                  })
                  db.tables.Invites.findAll().then((invites) => {
                    db.tables.Discounts.findAll().then((discounts) => {
                      let user = {
                        id: foundUser.id,
                        email: foundUser.email,
                        name: foundUser.name,
                        isAdmin: foundUser.isAdmin
                      }
                      res.status(200).send({ok: true, message: 'found user info', user: user, athletes: athletes, invites: invites, discounts: discounts, purchases: purchases})
                    })
                  })
                })
              })
            } else {
              db.tables.Purchases.findAll({where: {userId: foundUser.id}}).then((purchases) => {
                db.tables.Athletes.findAll({where: {userId: foundUser.id}}).then((athletes) => {
                  let quarter = helpers.getCurrentQuarter()
                  let year = new Date().getFullYear()
                  athletes = athletes.map(athlete => {
                    let currentlyRegistered = false
                    for (let i = 0; i < purchases.length; i++) {
                      let purchaseYear = new Date(purchases[i].createdAt).getFullYear()
                      if (purchases[i].athleteId === athlete.id && purchases[i].quarter.indexOf(quarter) !== -1 && purchaseYear === year) {
                        currentlyRegistered = true
                        break
                      }
                    }
                    athlete.dataValues.currentlyRegistered = currentlyRegistered
                    return athlete
                  })
                  let user = {
                    id: foundUser.id,
                    email: foundUser.email,
                    name: foundUser.name,
                    isAdmin: foundUser.isAdmin
                  }
                  res.status(200).send({ok: true, message: 'found user info', athletes: athletes, purchases: purchases, user})
                })
              })
            }
          } else {
            res.status(403).send(JSON.stringify({ok: false, message: 'invalid user token'}))
          }
        })
      } else {
        res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
      }
    }
  })

  app.post('/users/isadmin', (req, res) => {
    let token = req.body.token
    if (!token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
    } else {
      let user = null
      try {
        user = jwt.decode(token, config.auth.secret)
      } catch (e) {
      }
      if (!user) {
        res.status(403).send(JSON.stringify({ok: false, message: 'invalid user token'}))
      } else {
        db.tables.Users.find({where: {id: user.id}}).then(foundUser => {
          if (foundUser) {
            res.send({ok: true, isAdmin: user.isAdmin, message: 'user Found'})
          } else {
            res.status(403).send({ok: false, message: 'user not found'})
          }
        })
      }
    }
  })
  // End Users Section

  // Admin Endpoints

  app.post('/discounts/delete', (req, res) => {
    let token = req.body.token
    let discountId = req.body.discountId
    if (!token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
    } else {
      let user = null
      try {
        user = jwt.decode(token, config.auth.secret)
      } catch (e) {}
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
        if (foundUser.isAdmin) {
          db.tables.Discounts.destroy({where: {id: discountId}}).then((numDeleted) => {
            if (numDeleted !== 0) {
              res.status(200).send({ok: true, message: 'discount code deleted'})
            } else {
              res.status(400).send({ok: false, message: 'discount code not found'})
            }
          })
        }
      })
    }
  })

  app.post('/invites/delete', (req, res) => {
    let token = req.body.token
    let inviteId = req.body.inviteId
    if (!token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}))
    } else {
      let user = null
      try {
        user = jwt.decode(token, config.auth.secret)
      } catch (e) {}
      db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
        if (foundUser.isAdmin) {
          db.tables.Invites.destroy({where: {id: inviteId}}).then((numDeleted) => {
            if (numDeleted !== 0) {
              res.status(200).send({ok: true, message: 'discount code deleted'})
            } else {
              res.status(400).send({ok: false, message: 'discount code not found'})
            }
          })
        }
      })
    }
  })

  // Catchall redirect to home page
  app.get('*', (req, res) => {
    res.redirect('/')
  })
}
