import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx';
import AccountPanel from './account-panel.jsx';
import Training from './training.jsx';
import Register from './register.jsx';

let currentPage = window.location.pathname;
let queryString = window.location.search;

if (currentPage.includes('account')) {
  render(<AccountPanel/>, document.getElementById('account-panel'));
} else if (currentPage.includes('register')) {
  render(<Login/>, document.getElementById('login'));
  render(<Register/>, document.getElementById('registration-page'));
} else {
  render(<Calendar/>, document.getElementById('calendar'));
  render(<Login/>, document.getElementById('login'));
  render(<Training/>, document.getElementById('training'));

  if (queryString.includes('justVerified=true')) {
    let loginDiv = document.getElementById('login');
    loginDiv.style.opacity = 1;
    loginDiv.style.visibility = 'visible';
  }
}