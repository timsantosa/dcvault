import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx';
import AccountPanel from './account-panel.jsx';
import Training from './training.jsx';
import Register from './register.jsx';
import AdminPanel from './admin-panel.jsx';
import ContactModal from './contact-modal.jsx';

let currentPage = window.location.pathname;
let hashString = window.location.hash;

let contactDiv = document.getElementById('contact-modal');
let contactButton = document.getElementById('contact-button');

render(<ContactModal preSelect={''}/>, contactDiv);

let contactClose = document.getElementById('contact-menu-close');

contactButton.onclick = () => {
  contactDiv.style.opacity = 1;
  contactDiv.style.visibility = 'visible';
};

contactClose.onclick = () => {
  contactDiv.style.opacity = 0;
  contactDiv.style.visibility = 'hidden';
};

let socialButton = document.getElementById('social-button');
let socialIcons = document.getElementsByClassName('social-link');
let socialLinkDiv = document.getElementsByClassName('social-links');

socialButton.onclick = () => {
  socialLinkDiv[0].style.background = 'rgba(255,255,255,.25)'
  setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,0)'
  }, 500);
  setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,.25)'
  }, 1000);
    setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,0)'
  }, 1500);
  setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,.25)'
  }, 2000);
    setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,0)'
  }, 2500);
  setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,.25)'
  }, 3000);
    setTimeout(() => {
    socialLinkDiv[0].style.background = 'rgba(255,255,255,0)'
  }, 3500);
}

if (currentPage.indexOf('account') !== -1) {
  render(<AccountPanel/>, document.getElementById('account-panel'));
} else if (currentPage.indexOf('register') !== -1) {
  render(<Login/>, document.getElementById('login'));
  render(<Register/>, document.getElementById('registration-page'));
} else if (currentPage.indexOf('admin') !== -1) {
  render(<AdminPanel/>, document.getElementById('admin-panel'));
} else {
  render(<Calendar/>, document.getElementById('calendar-container'));
  render(<Login/>, document.getElementById('login'));
  render(<Training/>, document.getElementById('training'));

  if (hashString.indexOf('justVerified=true') !== -1) {
    let loginDiv = document.getElementById('login');
    loginDiv.style.opacity = 1;
    loginDiv.style.visibility = 'visible';
  }
}

