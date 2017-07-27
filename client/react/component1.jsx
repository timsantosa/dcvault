import React from 'react';
import {render} from 'react-dom';

class TestComponent extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div>
        <p>Calendar Here</p>
      </div>
    );
  }
}

export default TestComponent;