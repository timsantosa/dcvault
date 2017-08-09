import React from 'react';
import {render} from 'react-dom';

class Training extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className="container">
        <p className="section-header">Training <span className="red-text">Options</span></p>
        <div className="row">
          <div className="col-xs-6 col-md-2">
            <div className="training-option">
              FIRST OPTION
            </div>
          </div>
          <div className="col-xs-6 col-md-2">
            <div className="training-option">
              SECOND OPTION
            </div>
          </div>
          <div className="col-xs-6 col-md-2">
            <div className="training-option">
              THIRD OPTION
            </div>
          </div>
          <div className="col-xs-6 col-md-2">
            <div className="training-option">
              FOURTH OPTION
            </div>
          </div>
          <div className="col-xs-6 col-md-2">
            <div className="training-option">
              FIFTH OPTION
            </div>
          </div>
          <div className="col-xs-6 col-md-2">
            <div className="training-option">
              SIXTH OPTION
            </div>
          </div>
        </div>

        <div className="row" style={{marginTop: '25px'}}>
          <p className="subsection-header"><span className="red-text">Other</span> Options</p>
          <div className="col-xs-6 col-md-4">
            <div className="training-option">
              PRIVATE LESSONS
            </div>
          </div>
          <div className="col-xs-6 col-md-4">
            <div className="training-option">
              POLE RENTAL
            </div>
          </div>
          <div className="col-xs-6 col-md-4">
            <div className="training-option">
              SPECIAL EVENTS
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Training;