import React from 'react';
import {render} from 'react-dom';

class Staff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      staffMembers: [
        {
          name: 'Edward Luthy',
          position: 'Head Coach',
          photoURL: ''
        }
      ]
    }
  }

  render() {

    return (
      <div className="container">
        <div className="row">

        </div>
      </div>
    );
  }
}

class StaffCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  render() {

    return (
      <div className="col-xs-12 col-md-6">
        <div className="staff-card-front">
          <div className="staff-img">

          </div>
          <div className="staff-front-info">

          </div>
        </div>
        <div className="staff-card-back">

        </div>
      </div>
    );
  }
}


export default Staff;