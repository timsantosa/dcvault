import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx';
import AccountPanel from './account-panel.jsx';
import Training from './training.jsx';
import Register from './register.jsx';
import AdminPanel from './admin-panel.jsx';

let currentPage = window.location.pathname;
let hashString = window.location.hash;

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