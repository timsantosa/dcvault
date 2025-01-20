For Eddie specifically: Any developer comfortable with React, NodeJS, basic HTML/CSS/JavaScript, and very simple Linux Server Deployment should be able to handle the website just fine. I intentionally kept it as simple and easy to follow as I could so handoff would be seamless.

For Eddie/New Dev: Some of the following is technical, just forward to the new developer and they should understand (but still read it yourself). The website is hosted via Digital Ocean. The new dev can log in via the credentials below and generate themselves some SSH keys in order to connect to the droplet. The github repository is public, I'd recommend the new dev create a copy of the repo within their own github account rather than continuing to use it through mine. Everything else should be pretty self-explanatory.

Just for the new dev: The server itself is running in a screen called dcvault on the DO Droplet, and is served via an nginx reverse proxy. Most of the time you can just leave those running, pull from master (app is housed in /site/dcvault), and run `npm run prod`. Other than that, there are a few maintenance things you'll need to stay on top of. Primarily that involves updating the SSL certificates every 90 days using `systemctl stop nginx && certbot renew && systemctl start nginx` This will bring the site down for 3-5 seconds, but otherwise should have no impact. Additionally, occasionally on software updates to the mysql server you'll find that the DB fails to initialize within the webapp. To resolve this, you'll need to reset the authentication settings in mysql (unless you find a nicer way to handle this). That just requires logging into the mysql server as root (from within the droplet's shell, no pw) and following this guide: https://stackoverflow.com/questions/2101694/how-to-set-root-password-to-null/36234358#36234358 After that, restart the mysql service. 

More troubleshooting/instructions (updated 6/29/23)
Add a new SSH rsa key (there might be a better way to do this that I don't know about):
- Add the rsa.pub to Digital Ocean Site
- Login to root@dcvault on an existing computer with access
- cd ~/.ssh
- sudo nano authorized_keys
- Add new key to this document

How to fix DB Initializing:
1. sign into mysql console
2. use mysql;
3. update user set authentication_string=password(''), plugin='mysql_native_password' where user='root';
4. quit;
5. /etc/init.d/mysql restart
6. After it is restarted you need to restart the node app
7. screen -r -d dcvault
8. CTRL + C
9. npm start
10. Hold CTRL, press A then D

See Requests
screen -rd dcvault
ctrl+AD

SSHing into the server
passphrase is Eddyvault1
ssh root@45.55.55.125

Export from Events Table:
(SELECT 'firstName','lastName','email','dates', 'dob', 'pr', 'team', 'usatf', 'emergencyContactName', 'emergencyContactMDN', 'emergencyContactRelation','gender','state','accomplishments','age','division')
UNION 
(SELECT firstName,lastName, email, dates, dob, pr, team, usatf, emergencyContactName, emergencyContactMDN, emergencyContactRelation, gender, state, accomplishments, age, division
FROM eventAthletes
INTO OUTFILE '/var/lib/mysql-files/kids-camp23.csv'
FIELDS ENCLOSED BY '"' TERMINATED BY ';' ESCAPED BY '"'
LINES TERMINATED BY '\r\n');

To run the site locally you'll need to create a config.js file in /client/config/ with contents that look something like:
```
window.configVariables = {
  GOOGLE_MAPS_API_KEY: 'AIzaSyC4GPw4a7HgoB27c3Ubi0MjBSaIenRr4tM',
  PAYPAL_CLIENT_ID: 'ASpmOWTukmw_MUARX6258UPF65l1p2Anuyf0cYnjWMuZYYkZuDxVsjSQBKa3XVchsGV9oJG2J1IpGmhr',
  PAYPAL_SANDBOX_ID: 'AbQy34Vcuy5T99419pTcu0yPv1BzC_SntSHPDfqObunyxMy2MCpFtHdxovpNI9Ujlp4z0h-Dcc1QG78b',
  PAYPAL_MODE: 'sandbox',
  FACEBOOK_APP_ID: '137957240163293',
  FACEBOOK_APP_SECRET: 'bb20fd1968ecf5e83d955fdf3973109f'
}
```

and a config.js file in /server/config/ that looks something like:
```
module.exports = {
  server: {
    port: 8080,
    domain: 'localhost:8080'
  },
  db: {
    name: 'dcvault',
    user: 'root',
    pass: ''
  },
  auth: {
    secret: '7oET9M20YUto61x8C98sLqJWqpggIB2LISSuWBCF'
  },
  recaptcha: {
    key: '6LfsVCsUAAAAAB4XachJ-q-WKxb3OUg5lcD0fTBf'
  },
  email: {
    username: 'no-reply@dcvault.com',
    server: 'smtp.office365.com',
    port: 587,
    password: 'enbU%95bkfqo1lrQ'
  },
  testAccounts: {
    testPass: ['watchtower', 'bubka20ft']
  },
  misc: {
    isTest: true
  }
}
```


If you have questions hit me at timmysantosa@gmail.com. My availability is limited but I'll do my best to respond in a timely manner.

Required Credentials:

Github: repo at https://github.com/admoores/dcvault or https://github.com/timsantosa/dcvault (more recent)
goDaddy: uname: dcvault@gmail.com pw: Eddyvault1
digital ocean: uname: it@dcvault.org pw: 1q$C@3!T#BtOI9cx
no-reply email: no-reply@dcvault.org pw: enbU%95bkfqo1lrQ
it email: it@dcvault.org pw: @%L3dLt3Rcx0iGMm
paypal sandbox buyer (for test purchases): it-buyer@dcvault.org pw: testtest