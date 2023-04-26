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
//      <h3>!! ATTENTION FLY-KIDS SUMMER CAMP!!</h3>\
//<p>Please ignore all sections other than this</p>\
//<p>Thank you for registering for the Fly-Kids Summer Camp!</p>\
//<p>Please note - our lead camp counselor is Marley Oar. We will provide her contact phone # the first day of camp for emergencies.</p>\
//<p>Please be sure to review the camp event information at DCVault.com/events and do not hesitate to contact us at Events@dcvault.org if you have any questions about the upcoming camp!</p>\

module.exports.sendConfirmationEmails = (email,athleteInfo) => {
  let mailOptions = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'Welcome to DC Vault', // Subject line
    to: email,
    html: '<p>Thank you for registering with DC Vault. Please review the content below closely and let us know if you have any questions.</p>\
      <h3>CLASS RESERVATION APP:</h3>\
      <p>To help you keep track of the training package you signed up for, we have implemented a new reservation app called Zenplanner. This will help you pre-select the practice times you want to attend each week, keep track of your vault package allocation, track performance metrics, and more! Shortly after you register (usually within 24 hours) you will receive instructions on how to login to your free Zen Planner account. Once you have logged in, you will be able to use your Zen Planner App to reserve the specific class times that you wish to attend. </p>\
      <p>Classes must be reserved 24 hours or more in advance as the classes are locked 24 hours prior to the scheduled start times. If you arrive without having reserved the class time slot, you will not be able to participate in that class. Classes are limited in size, so reserve all of the classes you intended to take right away. If you need to cancel or change a class time later on, you can do so as long as it is 24 hours or more prior to the start of your preferred class. If a class you wish to attend is Full, you can add yourself to the "waitlist" and if an athlete cancels their slot, you will be added IF you are next in the waiting queue.</p>\
      <p>Note - If you do not attend a class you have reserved, it counts against your class allotment, so be sure to cancel a class if you aren’t going to attend. All classes must be reserved within the terms of your class package (1 per week, 2 per week, etc) and the Zen Planner app will limit you to these parameters.</p>\
      <h3>SCHEDULE</h3>\
      <p>Please refer to our online calendar for your training schedule. Your group dates, times and location for the upcoming training period are posted on this schedule. Any changes due to scheduling conflicts, weather or other unforeseen circumstances will be posted here as well. Please be sure to check the schedule prior to your training sessions at all times.</p> \
      <h3>WHAT TO EXPECT</h3>\
      <p>If this is your first session, welcome aboard! When you arrive to your first session, we will introduce you to everyone and let you know who you will be working with to get you acquainted with the program. You will be shown the basics and instructed through every step of the process. If this is your first experience with vaulting, relax, we move very slow, with easy to execute fundamental movements and work you up from there one step at a time. During a typical training session, we will go through a warmup and equipment setup, before we move into the lesson.</p>\
      <h3>WHAT TO BRING</h3>\
      <p>Dress in comfortable athletic clothing. Bring regular running shoes and some water to drink. If you are training at one of our outdoor locations (like DCV), bring sunblock as well as extra water.</p>\
      <h3>LOCATION</h3>\
      You selected a specific training location when you registered. This is your assigned group location. Address information can be found on our website in the Facilities section</p>\
      <h3>WORKOUTS (attached)</h3>\
      <p>If you want to progress as quickly as possible, conditioning is very important. We\'ve attached our general team conditioning program. It\'s a 12 week program for our athletes to follow outside of scheduled practices. We strongly encourage every athlete to complete this workout in total. If you do, your progress will accelerate significantly.</p>\
      <h3>CANCELLATIONS / WEATHER POLICY</h3>\
      <p>If any change is made to a scheduled class time, it is posted on the DCVault.com website calendar immediately. Any change or cancellation will be posted a minimum of 1-hour prior to the class time, but normally 2-or more-hours before the scheduled class time.</p\
      <p>We NEVER “intend” to cancel or change a class time, and therefore cannot send a notification that we are “planning” on cancelling a class. We watch weather radar, etc. up to the moment that it becomes explicitly clear that we cannot hold class. At that time we update the website calendar and - when possible - send out an email notification as well. Any inquiries regarding scheduling changes will be referred to the website calendar.</p>\
      <p>Note - The Zen Planner app is NOT where you check for class cancellations. Refer to the website calendar.</p>\
      <h3>MAKEUP SESSIONS</h3>\
      <p>Makeup sessions are only permitted for athletes who were scheduled to attend a class that was cancelled by the DC Vault staff. If an athlete is scheduled to be at class and misses a regularly scheduled class that is held, it will count against their class package allotment. Exceptions are made for injuries with appropriate doctors notice.</p>\
      <h3>SCHEDULE</h3>\
      <p>For specific schedule details on a current or upcoming training course, please consult the DC Vault training calendar. Look for the training group of interest and click on the time slot to view details (date, time, location, course duration, etc…). The schedule for an upcoming training quarter is typically posted one month in advance.</p>\
      <h3>TRAINING LOCATION</h3>\
      <p>See Website Schedule.</p>\
      <h3>EQUIPMENT</h3>\
      <p>DC Vault provides all needed equipment, poles, etc. during scheduled training sessions.</p>\
      <h3>SPIKES</h3>\
      <p>Spikes are not used during practice sessions unless it is raining and the coaching staff allows it for traction. Absolutely no spikes longer than 1/8” are permitted at the DC Vault Home Training Facility located at 2100 East Capitol street NE, DC!</p>\
      <h3>CONTACT</h3>\
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

  /*
        <p>Courses are primarily offered at the DC Vault Training Facility located at 2100 East Capitol street NE Washington, DC but may also be offered seasonally at one of one of our partner facilities (usually during Winter quarter).</p>\
      <p>The location for an upcoming class can always be viewed in the training calendar at DCVault.com by clicking on any scheduled session in order to see the class details.</p>\
  */


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
  })
/*
  let mailOptions2 = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'New Training Registrant', // Subject line
    to: "lrose@dcvault.org",
    html:  '<p>Details</p>' +athleteInfo,
    attachments: [
    ]
}
transporter.sendMail(mailOptions2, (error, info) => {
    if (error) {
        return console.log(error)
    }
    console.log('Message %s sent to %s response: %s', info.messageId, "events@dcvault.org", info.response)
}
*/
}
/*
module.exports.sendEventConfirmationEmails = (email, athleteInfo) => {
    let mailOptions = {
        from: '"DC Vault" <' + config.email.username + '>', // sender address
        subject: '2022 Pole Vault Championships', // Subject line
        to: email,
        html: '<p>Thank you for registering for the 2022 DMV Championships! Please see the general info below and let us know if you have questions by emailing us at events@dcvault.org. For additional information including schedule, results, etc, please see our online event info <a href="https://dcvault.com/events">HERE</a>.</p>\
        <h3>Entry Fee - Spectators/Coaches</h3>\
        <ul>\
          <li>$5 for all non-competitors entering the facility (cash only)</li>\
          <li>Spectators and coaches can watch from outside the fence free of charge if they prefer</li>\
        </ul>\
        <h3>Facility</h3>\
        <ul>\
          <li>DC Vault Pole Vault Center</li>\
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>\
          <li>Parking On-Site (Lot #3)</li>\
          <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>\
          <li>Address:\
              <ul>\
                <li>2200 <b>East</b> Capitol street <b>NE</b> Washington DC</li>\
                <li>Enter the address above or just enter "DC Vault" into your navigation system</li>\
              </ul>\
          </li>\
        </ul>\
        <h3>SPIKES</h3>\
        <ul>\
          <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>\
          <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>\
          <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>\
          <ul>\
            <li>Recommended so you don’t waste time at the event trying to change spikes!</li>\
          </ul>\
          <li>Available for $5 per set at the event (bring your own spike wrench)</li>\
        </ul>\
        <h3>Pole Drop-off/Pick-up</h3>\
        <ul>\
          <li>If you need to store poles overnight, arrangements can be made for drop-off and pick-up</li>\
          <li>Arrangements must be made MORE THAN 24 HOURS IN ADVANCE OF THE EVENT</li>\
        </ul>\
        <h3>Pole Rentals</h3>\
        <ul>\
          <li>$25 cash at check-in</li>\
          <li>You may be sharing your rental pole</li>\
          <li>ID will be held until pole is returned</li>\
        </ul>'
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
*/
module.exports.sendEventConfirmationEmails = (email, athleteInfo) => {
  let mailOptions = {
      from: '"DC Vault" <' + config.email.username + '>', // sender address
      subject: '2023 Fly-Kids Summer Camp', // Subject line
      to: email,
      html: '<p>Thank you for registering for the Fly-Kids Summer Camp!</p>\
        <p>Please note - our lead camp counselors are Marley Oar and Edith Bosshart. We will provide the designated counselor contact phone # the first day of camp for emergencies.</p>\
        <p>Please be sure to review the camp event information at DCVault.com/events and do not hesitate to contact us at Events@dcvault.org if you have any questions about the upcoming camp!</p>'
  }

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error)
      }
      console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
  })
  let mailOptions2 = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'New Summer Camp Registrant', // Subject line
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
