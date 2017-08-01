import React from 'react';
import {render} from 'react-dom';
import Calendar from './calendar.jsx';
import Login from './login.jsx'

render(<Calendar/>, document.getElementById('calendar'));
render(<Login/>, document.getElementById('login'));