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
function formatAthleteData(rawString) {
  if (!rawString) return "";

  const data = {};
  
  // Match all "key":"value" pairs dynamically
  const regex = /"([^"]+)"\s*:\s*"([^"]*)"/g;
  let match;

  while ((match = regex.exec(rawString)) !== null) {
    data[match[1]] = match[2];
  }

  // Convert camelCase to Normal Words
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase());
  };

  let html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3 style="margin-bottom:10px;">Athlete Information</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
  `;

  for (const key in data) {
    if (!data[key]) continue;

    let value = data[key];

    // Handle multi-line values (like dates)
    if (value.includes("\n")) {
      value = value
        .split("\n")
        .filter(v => v.trim() !== "")
        .map(v => `• ${v.trim()}`)
        .join("<br>");
    }

    html += `
      <tr>
        <td style="padding:6px 8px; font-weight:bold; vertical-align:top; border-bottom:1px solid #eee;">
          ${formatLabel(key)}
        </td>
        <td style="padding:6px 8px; border-bottom:1px solid #eee;">
          ${value}
        </td>
      </tr>
    `;
  }

  html += `
      </table>
    </div>
  `;

  return html;
}
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

// Absolute base URL of this app (account.dcvault.com in production), built from
// config.server.domain. A protocol in the config value is respected; otherwise
// localhost gets http and everything else https.
const siteBaseUrl = () => {
  const domain = String(config.server.domain || '').replace(/\/+$/, '')
  if (/^https?:\/\//i.test(domain)) return domain
  return (/^(localhost|127\.0\.0\.1)(:|$)/.test(domain) ? 'http://' : 'https://') + domain
}

module.exports.sendCode = (code, email) => {
  let link = siteBaseUrl() + '/users/verify?code=' + encodeURIComponent(code)
  let mailOptions = {
    from: '"DC Vault" <' + config.email.username + '>', // sender address
    subject: 'DC Vault New Account Verification', // Subject line
    to: email,
    text: 'Follow the Link to Verify your New Account: ' + link, // plain text body
    html: '<p>Thank you for registering a DC Vault profile!</p>\
      <p>Your username is: ' + email + '</p>\
      <p>To verify your account, click the link below or copy/paste the following into your browser\'s URL bar: ' + link + '</p>\
      <p><a href="' + link + '">Click Here to Verify your Account</a></p>' // html body
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
    subject: 'Welcome to DC Vault!', // Subject line
    to: email,
    html: `<p>Thank you for registering with DC Vault. Please review the content below and let us know if you have any questions.</p>
      <h2>Please install the DC VAULT APP at this time!</h2>
      <h2>You will use the DC Vault app to:</h2>
      <ul>
        <li>Reserve classes</li>
        <li>Track your remaining classes</li>
        <li>View the training schedule</li>
        <li>Log jump data during practice, including:
          <ul>
            <li>Pole</li>
            <li>Run</li>
            <li>Step</li>
            <li>Performance metrics</li>
          </ul>
        </li>
        <li>View your ranking within the organization and compare your results against:
          <ul>
            <li>Active or all-time athletes</li>
            <li>Male or female athletes</li>
          </ul>
        </li>
        <li>Receive notifications and announcements, including:
          <ul>
            <li>Weather updates</li>
            <li>Schedule changes</li>
            <li>Class cancellations</li>
            <li>Event notifications</li>
          </ul>
        </li>
      </ul>
      <h2>App installation and setup instructions:</h2>
      <ol>
        <li>Download the <strong>DC Vault app</strong> from the <a href="https://play.google.com/store/apps/details?id=com.dcvault.dcvault">Google Play Store</a> or <a href="https://apps.apple.com/us/app/dc-vault/id6738288506">Apple App Store</a>.</li>
        <li>Log in using your <strong>DC Vault website credentials</strong>.</li>
        <li>Create an Athlete Profile (if you do not already have one):
          <ul>
            <li>Tap the <strong>middle tab</strong> and select <strong>Create Profile</strong>.</li>
            <li>Ensure the profile is linked to the athlete you registered by selecting the appropriate <strong>Associated Athlete</strong>.</li>
          </ul>
        </li>
        <li>Reserve your class slots:
          <ul>
            <li>Open the <strong>Schedule</strong> tab to view available classes.</li>
            <li>Tap <strong>Reserve</strong> to save your spot.</li>
            <li>Reservations, cancellations, and changes can only be made <strong><u>more than</u> 24 hours before a class begins</strong>.</li>
          </ul>
        </li>
      </ol>
      <h2>Families with Multiple Athletes</h2>
      <p>If your DC Vault account includes more than one athlete (such as multiple children or a spouse), you can create a separate Athlete Profile for each person.</p>
      <ol>
        <li>Each athlete must be registered for training on <strong>DCVault.com</strong> <u>at least once under the same account</u>.</li>
        <li>Open the <strong>More Menu</strong> (three dots in the upper-right corner).</li>
        <li>Under <strong>Account</strong>, select <strong>Create New Profile</strong>.</li>
        <li>Associate the new profile with the corresponding athlete registered on the website.</li>
        <li>Switch between profiles at any time by selecting the <strong>More Menu</strong> and choosing <strong>Switch Profile</strong>.
          <ul>
            <li>You can also switch profiles directly from the <strong>Schedule</strong> screen when reserving classes.</li>
          </ul>
        </li>
      </ol>
      <h3>Shared Family Access</h3>
      <p>Multiple family members can be logged into the same profile simultaneously, allowing parents to monitor their athlete's account. All logged-in devices will receive the same information, including:</p>
      <ul>
        <li>Messages from coaching staff</li>
        <li>Weather updates and class cancellation notices</li>
        <li>Event announcements</li>
        <li>Registration reminders</li>
        <li>Performance announcements, including:
          <ul>
            <li>New personal records</li>
            <li>Championship medal performances</li>
            <li>School records, facility records, and similar achievements</li>
          </ul>
        </li>
      </ul>
      <h2>FIRST PRACTICE?</h2>
      <h4>WHAT TO EXPECT</h4>
      <p>If this is your first session, welcome aboard! When you arrive to your first session, we will introduce you to everyone and let you know who you will be working with to get you acquainted with the program. You will be shown the basics and instructed through every step of the process. If this is your first experience with vaulting, relax, we move very slowly, with easy to execute fundamental movements and work you up from there one step at a time. During a typical training session, we will go through a warmup and equipment setup, before we move into the lesson.</p>
      <h4>WHAT TO BRING</h4>
      <p>Dress in comfortable athletic clothing. Bring regular running shoes and some water to drink. If you are training at one of our outdoor locations (like DCV), bring sunblock as well as extra water.</p>
      <h4>LOCATION</h4>
      <p>Be sure to check the training location of each class on the schedule so you don't go to the wrong facility. Address information can be found on our website home page in the Facilities section.</p>
      <h4>WORKOUTS (attached)</h4>
      <p>If you want to progress as quickly as possible, conditioning is very important. We've attached our general team conditioning program. It's a 12 week program for our athletes to follow outside of scheduled practices. We strongly encourage every athlete to complete this workout in total. If you do, your progress will accelerate significantly.</p>
      <h4>MAKEUP SESSIONS</h4>
      <p>Makeup sessions are only permitted for athletes who were scheduled to attend a class that was cancelled by the DC Vault staff. If an athlete is scheduled to be at class and misses a regularly scheduled class that is held, it will count against their class package allotment. Exceptions are made for injuries with appropriate doctor's notice.</p>
      <p><strong>Please consult the IMPORTANT INFORMATION &amp; POLICIES</strong> section of the DC Vault website for additional information, including class cancellation and weather policies, makeup sessions and more.</p>
      <p>Let us know if you have questions!</p>
      <p>Again, thank you for joining us, and we look forward to seeing you soon!</p>`,
    attachments: [
      {
        filename: 'DC Vault Quarterly Pole Vault Conditioning L-I_L-II.pdf',
        path: path.join(__dirname, '/../files/quarterly-conditioning.pdf')
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

const getEventEmailContent = (dates) => {
  let eventContent = '';
  
  if (dates && dates.includes('pvchamps26')) {
    eventContent = '<p>Thank you for registering for the <strong>2026 Pole Vault Championships</strong>! Please review the information below and let us know if you have any questions by emailing us at <a href="mailto:events@dcvault.org">events@dcvault.org</a>.</p>' +
      '<h3>ENTRY - PARTICIPANTS / SPECTATORS</h3>' +
      '<p>Parking is located in Lot #3. Entry to the facility fronts on East Capitol Street. After parking, exit the lot back out onto the sidewalk along East Capitol Street and walk along the sidewalk to the double gates next to the black <strong>DC VAULT</strong>-logoed storage unit. Wait at the gate for entry and please arrive a few minutes early.</p>' +
      '<p>Spectators may sit on the bleachers during the competition; please remain in the designated seating areas for safety.</p>' +
      '<h3>FACILITY</h3>' +
      '<p><strong>DC Vault Pole Vault Center</strong></p>' +
      '<p>3 Mondo Runways — UCS 1800, 1900 and Elite 2100 series pits.</p>' +
      '<h3>ADDRESS</h3>' +
      '<p>2200 East Capitol Street NE, Washington, DC</p>' +
      '<p>Enter the address above into your navigation system or simply search for "<strong>DC Vault</strong>".</p>' +
      '<h3>ADDITIONAL NOTES</h3>' +
      '<p>Please arrive prepared (water, appropriate footwear). If you have accessibility or special needs questions, contact us at <a href="mailto:events@dcvault.org">events@dcvault.org</a> prior to the event.</p>' +
      '<p>We look forward to seeing you at the championships — good luck and jump safe!</p>';
  } else if (dates && dates.includes('family-pv-experience')) {
    eventContent = '<p>Thank you for registering for the <strong>Family Pole Vault Experience</strong>! Please review the information below and let us know if you have any questions by emailing us at <a href="mailto:events@dcvault.org">events@dcvault.org</a>.</p>' +
'<h3>ENTRY - PARTICIPANTS / SPECTATORS</h3>' +
'<p>Parking is located in Lot #3. Entry to the facility fronts on East Capitol Street. After parking, exit the lot back out onto the sidewalk along East Capitol Street and walk along the sidewalk to the double gates next to the black <strong>DC VAULT</strong>-logoed storage unit. Wait at the gate for entry and please arrive a few minutes early.</p>' +
'<p>Spectators may sit on the bleachers during the class; please remain in the designated seating area for safety.</p>' +
'<h3>FACILITY</h3>' +
'<p><strong>DC Vault Pole Vault Center</strong></p>' +
'<p>3 Mondo Runways — UCS 1800, 1900 and Elite 2100 series pits.</p>' +
'<h3>ADDRESS</h3>' +
'<p>2200 East Capitol Street NE, Washington, DC</p>' +
'<p>Enter the address above into your navigation system or simply search for "<strong>DC Vault</strong>".</p>' +
'<h3>ADDITIONAL NOTES</h3>' +
'<p>Please arrive prepared (water, comfortable athletic clothing). If you have any additional questions, contact us at <a href="mailto:events@dcvault.org">events@dcvault.org</a>.</p>' +
'<p>We look forward to seeing you at the Family Pole Vault Experience!</p>';
  } else if (dates && dates.includes('spring-fling-urself')) {
    eventContent = '<p>Thank you for registering for <strong>Spring Fling – Urself Over a Bar!</strong> Please review the information below and let us know if you have any questions by emailing us at <a href="mailto:events@dcvault.org">events@dcvault.org</a>.</p>' +
'<h3>ENTRY FEES - WALK-UP / SPECTATORS / COACHES</h3>' +
'<p>$50 cash for additional Walk-Up registering athletes on the day of the event.</p>' +
'<p>$10 cash for all non-competitors entering the facility (cash only).</p>' +
'<p>Entry is free for DC Residents.</p>' +
'<p>Spectators and coaches may watch from outside the fence free of charge if preferred.</p>' +
'<h3>FACILITY</h3>' +
'<p><strong>DC Vault Pole Vault Center</strong></p>' +
'<p>3 Mondo Runways — UCS 1800, 1900 and Elite 2100 series pits.</p>' +
'<p>Parking On-Site (Lot #3).</p>' +
'<p>Athletes enter the facility from the East Capitol Street sidewalk gate.</p>' +
'<h3>ADDRESS</h3>' +
'<p>2200 East Capitol Street NE, Washington, DC</p>' +
'<p>Enter the address above into your navigation system or simply search for "<strong>DC Vault</strong>".</p>' +
'<h3>SPIKES</h3>' +
'<p><strong>1/8" spikes ONLY</strong> at this facility (not standard 1/4" spikes).</p>' +
'<p>Athletes using spikes longer than 1/8" will be disqualified or scratched from the competition without refund.</p>' +
'<p>1/8" spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a>.</p>' +
'<p>Strongly recommended so you do not waste time at the event changing spikes.</p>' +
'<p>Available for $5 per set at the event (bring your own spike wrench).</p>' +
'<h3>POLE RENTALS</h3>' +
'<p>UCS Spirit Poles available for rent.</p>' +
'<p>$30 cash at check-in.</p>' +
'<p>You may be sharing your rental pole.</p>' +
'<p>ID will be held until the pole is returned.</p>' +
'<p><strong>You break it / You buy it.</strong></p>' +
'<p>We look forward to seeing you at Spring Fling!</p>';
  }
  
  return eventContent;
};

module.exports.sendEventConfirmationEmails = (email, emailData) => {
  return new Promise((resolve, reject) => {
    let mailOptions = {
      from: '"DC Vault" <' + config.email.username + '>', // sender address
      subject: 'DC Vault Event Registration Confirmation', // Subject line
      to: email,
      html: '<p>Thank you for registering for the event!</p>\
        <p>Please see the general info below and let us know if you have questions by emailing us at events@dcvault.org.</p>\
        <p>Athlete Information:</p>\
        <p>' + emailData + '</p>'
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Event confirmation email failed for', email, ':', error)
        reject(error)
      } else {
        console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
        resolve(info)
      }
    })
  })
}

module.exports.sendDMVEventConfirmationEmails = (email, emailData, dates) => {
  return new Promise((resolve, reject) => {
    let eventContent = getEventEmailContent(dates);
    const formattedAthleteInfo = formatAthleteData(emailData);

    
    let mailOptions = {
      from: `"DC Vault" <${config.email.username}>`,
      to: [email, "events@dcvault.org"],
      subject: "Event Registration Confirmation",
      html: `<p>${eventContent}</p><br>${formattedAthleteInfo}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('DMV event confirmation email failed for', email, ':', error)
        reject(error)
      } else {
        console.log('Message %s sent to %s response: %s', info.messageId, email, info.response)
        resolve(info)
      }
    })
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

module.exports.calculateAge = (dobString) => {
  // Check if dobString is defined and not empty
  if (!dobString) {
    return undefined;
  }

  // Regular expression to match MM/DD/YYYY format
  const dateFormatUS = /^([0]?[1-9]|1[0-2])\/([0]?[1-9]|[12][0-9]|3[01])\/\d{4}$/;


  // Regular expression to match YYYY-MM-DD format
  const dateFormatDB = /^\d{4}-\d{2}-\d{2}$/;

  // Validate dobString format
  if (!dateFormatDB.test(dobString) && !dateFormatUS.test(dobString)) {
    return undefined;
  }

  // Parse the date of birth string (MM/DD/YYYY)
  const dob = new Date(dobString);

  // Get today's date
  const today = new Date();

  // Calculate the difference in years
  let age = today.getFullYear() - dob.getFullYear();

  // Adjust if the birthday hasn't occurred yet this year
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Returns equivalent dob strings in both DB formats (YYYY-MM-DD and MM/DD/YYYY)
 * so queries can match athletes regardless of which format is stored.
 * @param {string} dobString - Date string in either MM/DD/YYYY or YYYY-MM-DD
 * @returns {string[]} - Array of variants (includes original + normalized forms), deduplicated
 */
module.exports.getDobMatchVariants = (dobString) => {
  if (!dobString || typeof dobString !== 'string') {
    return [];
  }
  const trimmed = dobString.trim();
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) {
    return [trimmed];
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const iso = `${y}-${m}-${day}`;
  const us = `${m}/${day}/${y}`;
  return [...new Set([trimmed, iso, us])];
};

module.exports.isValidId = (id) => {
  return typeof id === 'number' && Number.isInteger(id) && isFinite(id);
}



module.exports = {
  decodeUser: module.exports.decodeUser,
  getCurrentQuarter: module.exports.getCurrentQuarter,
  sendCode: module.exports.sendCode,
  resetPass: module.exports.resetPass,
  sendConfirmationEmails: module.exports.sendConfirmationEmails,
  sendDMVEventConfirmationEmails: module.exports.sendDMVEventConfirmationEmails,
  sendEventConfirmationEmails: module.exports.sendEventConfirmationEmails,
  randString: module.exports.randString,
  sendWithReplyTo: module.exports.sendWithReplyTo,
  calculateAge: module.exports.calculateAge,
  getDobMatchVariants: module.exports.getDobMatchVariants,
  isValidId: module.exports.isValidId,
};

