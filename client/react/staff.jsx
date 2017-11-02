import React from 'react';
import {render} from 'react-dom';

class Staff extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      staffMembers: [
        {
          name: 'Staff Member',
          position: 'Job Title',
          photoPath: 'blank-user.png',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus erat at fermentum posuere. Mauris porttitor consequat ipsum. Nam ornare ex sit amet neque iaculis, in maximus massa tristique. Duis et augue posuere, malesuada enim nec, imperdiet diam. Praesent vel tincidunt nulla, in pretium mauris. Sed condimentum tempus lacus vitae condimentum. Nulla quis sapien sit amet enim elementum finibus. Fusce elit mi, consectetur ac neque nec, faucibus facilisis risus. Sed nec mauris ut libero vestibulum feugiat. Mauris lacinia ac augue quis pellentesque. Morbi vel diam at felis aliquet facilisis a non erat.'
        },
        {
          name: 'Staff Member',
          position: 'Job Title',
          photoPath: 'blank-user.png',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus erat at fermentum posuere. Mauris porttitor consequat ipsum. Nam ornare ex sit amet neque iaculis, in maximus massa tristique. Duis et augue posuere, malesuada enim nec, imperdiet diam. Praesent vel tincidunt nulla, in pretium mauris. Sed condimentum tempus lacus vitae condimentum. Nulla quis sapien sit amet enim elementum finibus. Fusce elit mi, consectetur ac neque nec, faucibus facilisis risus. Sed nec mauris ut libero vestibulum feugiat. Mauris lacinia ac augue quis pellentesque. Morbi vel diam at felis aliquet facilisis a non erat.'
        }
      ]
    }
  }

  render() {

    return (
      <div className="container">
        <div className="row">
          {this.state.staffMembers.map((staffMember, index) => {
            return (<StaffCard key={index} staffMember={staffMember}/>);
          })}
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
      <div className="col-xs-12 col-md-4 staff-card">
        <div className="staff-card-face staff-card-front">
          <div className="staff-img">
            <img src={"../img/staff/" + this.props.staffMember.photoPath}/>
          </div>
          <div className="staff-front-info">
              <p className="staff-name">{this.props.staffMember.name}</p>
              <p className="staff-position">{this.props.staffMember.position}</p>
          </div>
        </div>
        <div className="staff-card-face staff-card-back" ref="back">
          <p className="staff-description">{this.props.staffMember.description}</p>
        </div>
      </div>
    );
  }
}


export default Staff;