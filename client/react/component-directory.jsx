import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx'

render(<Calendar/>, document.getElementById('calendar'));
render(<Login/>, document.getElementById('login'));

const loginDiv = document.getElementById('login');
document.getElementById('login-button').onclick = () => {
  loginDiv.style.opacity = 1;
  loginDiv.style.visibility = 'visible';
};

document.getElementById('login-menu-close').onclick = () => {
  loginDiv.style.opacity = 0;
  loginDiv.style.visibility = 'hidden';
}