import React from 'react';
import {render} from 'react-dom';

class Training extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className="row">
        <p className="section-header">Training <span className="red-text">Options</span></p>
        <div className="col-xs-6 col-md-2 training-option">
          FIRST TRAINING OPTION
        </div>
        <div className="col-xs-6 col-md-2 training-option">
          SECOND TRAINING OPTION
        </div>
        <div className="col-xs-6 col-md-2 training-option">
          THIRD TRAINING OPTION
        </div>
        <div className="col-xs-6 col-md-2 training-option">
          FOURTH TRAINING OPTION
        </div>
        <div className="col-xs-6 col-md-2 training-option">
          FIFTH TRAINING OPTION
        </div>
        <div className="col-xs-6 col-md-2 training-option">
          SIXTH TRAINING OPTION
        </div>
      </div>
    );
  }
}

export default Training;