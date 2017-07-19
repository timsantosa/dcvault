import React from 'react';
import {render} from 'react-dom';
import Auth from './auth.js';
import AuthComp from './authComp.jsx'

const auth = new Auth();
// Every React component must extend React.Component, and have a name starting with a capital letter
class App extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div style={{border: '2px solid black'}}>
        <h2>This is a very basic React component</h2>
        <AuthComp/>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));