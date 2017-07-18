import React from 'react';
import {render} from 'react-dom';
// Every React component must extend React.Component, and have a name starting with a capital letter
class App extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div style={{border: '2px solid black'}}>
        <h2>This is a very basic React component</h2>
        <SubComponent/>
      </div>
    );
  }
}

class SubComponent extends React.Component {
  render() {
    return (
      <p style={{border: '2px dotted black'}}>You can put components inside other components</p>
    );
  }
}

render(<App/>, document.getElementById('app'));