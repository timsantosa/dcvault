import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx'

render(<Calendar/>, document.getElementById('calendar'));
render(<Login/>, document.getElementById('login'));

var loginShown = false;

document.getElementById('login-button').onclick = () => {
  let loginDiv = document.getElementById('login');
  loginShown = !loginShown;
  if (loginShown) {
    loginDiv.style.opacity = 0;
    loginDiv.style.visibility = 'hidden';
    console.log('hiding');
  } else {
    loginDiv.style.opacity = 1;
    loginDiv.style.visibility = 'visible';
    console.log('showing');
  }
}
