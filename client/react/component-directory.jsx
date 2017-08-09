import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx';
import AccountPanel from './account-panel.jsx';

let currentPage = window.location.pathname;

if (currentPage.includes('account')) {
  render(<AccountPanel/>, document.getElementById('account-panel'));
} else {
  render(<Calendar/>, document.getElementById('calendar'));
  render(<Login/>, document.getElementById('login'));
}