import React from 'react';
import {render} from 'react-dom';

class TestComponent extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div style={{border: '2px solid black'}}>
        <h2>This is a very basic React component</h2>
      </div>
    );
  }
}

export default TestComponent;