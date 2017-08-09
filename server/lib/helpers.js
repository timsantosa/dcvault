'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
    host: config.email.server,
    port: config.email.port,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email.username,
        pass: config.email.password
    },
    tls: {
      rejectUnauthorized: false
    }
});

module.exports.sendCode = (code, email) => {
  let link = config.server.domain + '/users/verify?code=' + code;
  let mailOptions = {
      from: '"DC Vault" <no-reply@dcvault.org>', // sender address
      subject: 'Please Verify your Account', // Subject line
      to: email,
      text: 'Follow the Link to Verify your New Account: ' + link, // plain text body
      html: '<a href="http://' + link + '">Click Here to Verify your Account</a>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent to %s response: %s', info.messageId, email, info.response);
  });
}

module.exports.resetPass = (password, email) => {
  let mailOptions = {
      from: '"DC Vault" <no-reply@dcvault.org>', // sender address
      subject: 'Here is your temporary password', // Subject line
      to: email,
      text: 'Your temporary password is as follows: ' + password + '\n Please change it at your earliest convenience through your account page.' // plain text body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent to %s response: %s', info.messageId, email, info.response);
  });
}

module.exports.randString = (len) => {
  len = len || 16;
  let retVal = '';
  let validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV1234567890'
  for (var i = 0; i < len; i++) {
    retVal += validChars.charAt(Math.floor(Math.random() * validChars.length));
  }
  return retVal;
}
