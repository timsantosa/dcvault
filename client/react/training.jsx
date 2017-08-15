import React from 'react';
import {render} from 'react-dom';

class Training extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }


  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className="container">
        <p className="section-header">Training <span className="red-text">Options</span></p>
        <div className="row">
          {optionsList.map((option) => {
            return (<TrainingCard title={option.title} price={option.price} description={option.description})
          })}
        </div>

        <div className="row">

        </div>
      </div>
    );
  }
}

class TrainingCard extends React.Component {

}

export default Training;