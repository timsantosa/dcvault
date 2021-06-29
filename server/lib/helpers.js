'use strict'

/* eslint-disable no-multi-str */

const nodemailer = require('nodemailer')
const config = require('../config/config')
const path = require('path')
const jwt = require('jwt-simple')

const transporter = nodemailer.createTransport({
  host: config.email.server,
  port: config.email.port,
  secure: false, // secure:true for port 465, secure:false for port 587
  auth: {
    user: config.email.username,
    pass: config.email.password
  },
  tls: {
    ciphers: 'SSLv3'
  }
})

module.exports.decodeUser = (token) => {
  let user = {}
  try {
    user = jwt.decode(token, config.auth.secret)
  } catch (e) {}
  return user
}

module.exports.getCurrentQuarter = () => {
  let month = (new Date()).getMonth() + 1
  if (month === 12 || month === 1 || month === 2) {
    return 'winter'
  } else if (month <= 5 && month >= 3) {
    return 'spring'
  } else if (month <= 8 && month >= 6) {
    return 'summer'
  } else {
    return 'fall'
  }
}

module.exports.sendCode = (code, email) => {
  let link = config.server.domain + '/users/verify?code=' + code
  let mailOptions = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'DC Vault New Account Verification', // Subject line
    to: email,
    text: 'Follow the Link to Verify your New Account: ' + link, // plain text body
    html: '<p>Thank you for registering a DC Vault profile!</p>\
      <p>Your username is: ' + email + '</p>\
      <p>To verify your account, click the link below or copy/paste the following into your browser\'s URL bar: ' + link + '</p>\
      <p><a href="http://' + link + '">Click Here to Verify your Account</a></p>' // html body
  }

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
  })
}

module.exports.resetPass = (password, email) => {
  let mailOptions = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'DC Vault Password Reset', // Subject line
    to: email,
    text: 'Your temporary password is as follows: ' + password + '\n Please change it at your earliest convenience through your account page.' // plain text body
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
  })
}

module.exports.sendConfirmationEmails = (email) => {
  let mailOptions = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'Welcome to DC Vault', // Subject line
    to: email,
    html: '<p>Thank you for registering with DC Vault. Please review the content below closely and let us know if you have any questions.</p>\
      <h3>ANNOUNCEMENT</h3>\
      <p>As DC Vault reopens for the summer, we do so with new rules in place meant to comply with the DC reopening guidance. Please review the following information for clients carefully.</p>\
      <h3>CLASS - DAYS and SIZE LIMITATIONS</h3>\
      <p>\
        <ul>\
          <li>Beginner/Intermediate classes for All Ages and Adult Groups will be held on Monday, Thursday and Sunday</li>\
          <li>Strength Class will be held Thursday and Sunday</li>\
          <li>Youth Class will be held Sunday</li>\
          <li>Private Lessons are offered Wednesdays (inquire to reserve or for other possible days)</li>\
          <li>Class sizes are limited to 20 participants training in separate groups! </li>\
          <ul>\
            <li>To ensure the correct number of participants show for each class, you will receive instructions on how to activate your new <b>Zen Planner account</b></li>\
            <li>Use your Zen Planner account to reserve your seat for the class times you wish to attend</b></li>\
            <li><b>NOTE:</b> If using the mobile app for Zen Planner, you will not see the classes on the monthly calendar view due to the mobile app display. Swipe through the individual daily views to see which classes are open to you based on the package you registered for. The desktop calendar view has more functionality.</b></li>\
          </ul>\
        </ul\
      </p>\
      <h3>CLASS - NEW GUIDELINES </h3>\
      <p>\
        <ul>\
          <li>Arrival</li>\
            <ul>\
              <li>Face masks must be worn at all times while at the DC Vault facility </li>\
              <ul>\
                <li>Ensure the mask type allows you to breathe freely!</li>\
              </ul>\
              <li>Spectators will NOT be permitted inside the DC Vault fence but can observe from the grassy area surrounding the facility by the skate park</li>\
              <li>Upon arrival, wait outside the E. Capitol street gate by one of the social distancing marker flags until instructed to enter</li>\
              <li>Gates will open at the start of your training session</li>\
            </ul>\
          <li>Warmups</li>\
            <ul>\
              <li>Weekdays: warmup on your own before your class time and before you enter the facility</li>\
              <li>Weekends: warmups will be conducted inside the facility and directed by coaches</li>\
            </ul>\
          <li>Entry</li>\
            <ul>\
              <li>Upon entry you will be screened and asked to sterilize your hands</li>\
              <li>Place any personal items next to one of the social distancing flags and wait there for instruction</li>\
            </ul>\
          <li>Equipment / Storage Shed</li>\
            <ul>\
              <li>Do NOT enter the storage shed at any time</li>\
              <li>Coaches will sterilize and issue all equipment/poles</li>\
              <li>Do NOT share any equipment - use only the pole the coaches issue to you</li>\
              <li>At the end of practice, coaches will return your equipment to storage</li>\
            </ul>\
          <li>Distancing</li>\
            <ul>\
              <li>You will be instructed on social distancing guidelines before starting practice</li>\
              <li>Markers will be in place for athletes to ensure correct distancing</li>\
              <li>Athletes failing to follow these guidelines will be asked to leave the practice session</li>\
            </ul>\
          <li>Other</li>\
            <ul>\
              <li>It is now summer, be sure to bring plenty of water and sunblock</li>\
              <li>Dogs are always welcome, just bring a leash</li>\
            </ul>\
        </ul>\
      </p>\
      <h3>!! NEW CLASS RESERVATION APP !!</h3>\
      <p>To help you keep track of the training package you signed up for, we have implemented a new reservation app called Zenplanner. This will help you pre-select the practice times you want to attend each week, keep track of your vault package allocation, track performance metrics, and more! </p>\
      <p>Please look out for an instructional email on how to create your athlete account before the start of our trianing quarter, as well as an email from us on how to use your new app!</p>\
      <h3>SCHEDULE</h3>\
      <p>Please refer to our online calendar for your training schedule. Your group dates, times and location for the upcoming training period are posted on this schedule. Any changes due to scheduling conflicts, weather or other unforeseen circumstances will be posted here as well. Please be sure to check the schedule prior to your training sessions at all times.</p> \
      <h3>WHAT TO EXPECT</h3>\
      <p>If this is your first session, welcome aboard! When you arrive to your first session, we will introduce you to everyone and let you know who you will be working with to get you acquainted with the program. You will be shown the basics and instructed through every step of the process. If this is your first experience with vaulting, relax, we move very slow, with easy to execute fundamental movements and work you up from there one step at a time. During a typical training session, we will go through a warmup and equipment setup, before we move into the lesson.</p>\
      <h3>WHAT TO BRING</h3>\
      <p>Dress in comfortable athletic clothing. Bring regular running shoes and some water to drink. If you are training at one of our outdoor locations (like DCV), bring sunblock as well as extra water.</p>\
      <h3>LOCATION</h3>\
      You selected a specific training location when you registered. This is your assigned group location. Address information can be found on our website in the Facilities section</p>\
      <h3>WORKOUTS</h3>\
      <p>If you want to progress as quickly as possible, conditioning is very important. We\'ve attached our general team conditioning program. It\'s a 12 week program for our athletes to follow outside of scheduled practices. We strongly encourage every athlete to complete this workout in total. If you do, your progress will accelerate significantly.</p>\
      <p>If you have any questions that have not been answered, please email our administrative assistant, Lauren, at <a href="mailto:lrose@dcvault.org">LRose@DCVault.org</a>\
      <p>Again, thank you for joining us, and we look forward to seeing you soon.</p>',
    attachments: [
      {
        filename: 'DC Vault Quarterly Pole Vault Conditioning L-I_L-II.pdf',
        path: path.join(__dirname, '/../files/quarterly-conditioning.pdf')
      },
      {
        filename: 'DC Vault Parking Pass.pdf',
        path: path.join(__dirname, '/../files/parking-pass.pdf')
      }
    ]
  }


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
  })
}
module.exports.sendEventConfirmationEmails = (email, athleteInfo) => {
    let mailOptions = {
        from: '"DC Vault" <' + config.email.username + '>', // sender address
        subject: '2021 DMV Pole Vault Championships', // Subject line
        to: email,
        html: '<p>National<span>Street Vault</span> 2021</p>\
        <p>\
          <span>July 16th-17th 2021</span>\
          <br></br>\
          <span>Eastern Market, 777 C Street SE - Washington DC</span>\
        </p>\
        <p>\
        </p>\
        <span>Registration</span>\
        <ul>\
          <li>Advanced Registration Only</li>\
          <li>Register <a href = "https://dcvault.com/compete">Here</a></li>\
          <li>Registration Closes July 10th (or when divisions are full)</li>\
        </ul>\
        <span>Entry Fee</span>\
        <ul>\
          <li>$60 Registration</li>\
        </ul>\
        <span>Venue / Address</span>\
        <ul>\
          <li>Eastern Market, 777 C street SE, Washington DC</li>\
          <li>Event Setup on C street SE (between 7th street SE and 8th street SE)</li>\
        </ul>\
        <span>Arrival / Parking</span>\
        <ul>\
          <li><u>NOTE:</u> Unload Poles BEFORE turning onto C street if parking in the garage</li>\
          <li><u>Additional Parking Garage located 1 block away at 600 Pennsylvania Ave NE (Colonial Parking)</u></li>\
          <li>Metered On-Street Parking is available on 8th street and Pennsylvania avenue</li>\
          <li>Free On-Street Parking is available in the surrounding neighborhood (easier to find near East Capitol street)</li>\
        </ul>\
        <span>Schedule</span>\
        <ul>\
          <li>Friday July 16th</li>\
          <ul>\
            <li>5:00pm - 7:00pm - Open Runway</li>\
          </ul>\
          <li>Saturday July 17th (Note: rolling schedule - arrive early in case your time slot moves up!)</li>\
          <li>Flight 1 </li>\
          <ul>\
            <li>8:00am - warmups</li>\
            <li>9:00 am - competition</li>\
          </ul>\
          <li>Fly Kids</li>\
          <ul>\
            <li>11:00am - warmups</li>\
            <li>11:30am - competition</li>\
          </ul>\
          <li>Flight 2</li>\
          <ul>\
            <li>12:30pm - warmups</li>\
            <li>1:30pm - competition</li>\
          </ul>\
          <li>Flight 3</li>\
          <ul>\
            <li>3:30pm - warmups</li>\
            <li>4:30pm - competition</li>\
          </ul>\
        </ul>\
        <span>Pole Drop-off/Pick-up</span>\
        <ul>\
          <li>If you need to store poles overnight, arrangements can be made for drop-off and pick-up</li>\
        </ul>\
        <span>Pole Rentals</span>\
        <ul>\
          <li>$30 cash at check-in</li>\
          <li>NOTE: You may be sharing your rental pole</li>\
          <li>ID will be held until pole is returned</li>\
        </ul>\
        <span>Awards/Results/Sanctioning</span>\
        <ul>\
          <li>Medals will be awarded in all flights for male and female competitors, 1st through 3rd places</li>\
          <li>Athletes who take gold at all 3 DC Vault summer events will earn the limited-edition DC Vault white medal</li>\
          <li>Scored Flights</li>\
          <ul>\
            <li>Fly-Kids (ages 5-10)</li>\
            <li>Flight 1 (ages 11 and up - PR 0 – 9’11”)</li>\
            <li>Flight 2 (ages 11 and up - PR 10’-13’11”)</li>\
            <li>Flight 3 (ages 11 and up - PR 14’+)</li>\
          </ul>\
          <li>USATF Sanctioned</li>\
          <li>Results/Performance marks will be published at <a href="https://milesplit.com">Milesplit.com</a> and at <a href="https://dcvault.com/events">DCVault.com/events</a></li>\
        </ul>\
        <span>Spectator Info</span>\
        <ul>\
          <li>Individual seats can be set up around the event</li>\
          <li>Tents are NOT allowed</li>\
          <li>Some on site seating will be available </li>\
          <li>Bathroom Facilities and water fountains are located inside the Eastern Market building, located on 7th street</li>\
        </ul>\
        <p>If you have other questions let us know - <a href="mailto:events@dcvault.org">Events@DCVault.org</a></p>',
        attachments: [
            {
                filename: 'Eastern Market Map.pdf',
                path: path.join(__dirname, '/../files/emarket-map.pdf')
            }
        ]
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error)
        }
        console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
    })
    let mailOptions2 = {
      from: '"DC Vault" <' + config.email.username + '>', // sender address
      subject: 'New Event Registrant', // Subject line
      to: "events@dcvault.org",
      html:  '<p>Details</p>' +athleteInfo,
      attachments: [
      ]
  }
  transporter.sendMail(mailOptions2, (error, info) => {
      if (error) {
          return console.log(error)
      }
      console.log('Message %s sent to %s response: %s', info.messageId, "events@dcvault.org", info.response)
  })
}

module.exports.randString = (len) => {
  len = len || 16
  let retVal = ''
  let validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV1234567890'
  for (var i = 0; i < len; i++) {
    retVal += validChars.charAt(Math.floor(Math.random() * validChars.length))
  }
  return retVal
}

module.exports.sendWithReplyTo = (name, from, to, subject, text) => {
  let mailOptions = {
    from: '"' + name + '" <' + config.email.username + '>', // sender address
    replyTo: from,
    subject: subject, // Subject line
    to: to,
    text: text // plain text body
  }

  return transporter.sendMail(mailOptions)
}
