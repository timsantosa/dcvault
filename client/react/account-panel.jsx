import React from 'react';
import {render} from 'react-dom';
import apiHelpers from '../js/api-helpers';

class AccountPanel extends React.Component {

  constructor(props) {
    super(props);
    apiHelpers.verifyToken().then((answer) => {
      if (!answer) {
        window.location.href = '/';
      }
    });

    this.state = {
      name: '',
      email: '',
      address: '',
      athletes: []
    }
  }

  componentDidMount() {
    this.isLoggedIn();
    this.populateUserInfo();
  }

  isLoggedIn() {
    const loginDiv = document.getElementById('login');
    const loginButton = document.getElementById('login-button');
    apiHelpers.verifyToken().then((answer) => {
      if (answer) {
        loginButton.innerHTML = 'My Account';
        loginButton.onclick = () => {
          window.location.href = '/account';
        }
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1;
          loginDiv.style.visibility = 'visible';
        };
      }
    });
  }

  populateUserInfo() {
    apiHelpers.getUserData()
    .then((response) => {
      console.log(response.data);
      if (!!response.data) {
        if (response.data.ok) {
          this.setState({
            name: response.data.user.name || 'None Entered',
            email: response.data.user.email,
            address: response.data.user.address || {line1: 'None Entered'},
            athletes: response.data.athletes || []
          });
        } else {
          window.location.href = '/';
        }
      }
    })
  }

  updateName() {
    // UPDATE NAME FIELD HERE FOR USER
  }

  updateAddress() {
    // UPDATE ADDRESS FIELD HERE FOR USER
  }

  logout() {
    window.localStorage.removeItem('token');
    window.location.href = '/';
  }

  render() {
      return (
      <section id="my-account">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <p className="subsection-header"><span className="red-text">Athlete</span> Profile</p>

          </div>
          <div className="col-xs-12 col-md-6">
            <p className="subsection-header">Account <span className="red-text">Management</span></p>
            <p className="user-info-element">Name: <span className="red-text">{this.state.name}</span> <span className="change-button" onClick={this.updateName.bind(this)}>Change...</span></p>
            <p className="user-info-element">Email: <span className="red-text">{this.state.email}</span></p>
            <p className="user-info-element">Address: <span className="red-text">{this.state.address.line1}</span> <span className="change-button" onClick={this.updateAddress.bind(this)}>Change...</span></p>
            <p className="user-info-element"><span className="red-text">{this.state.address.line2}</span></p>
            <p className="user-info-element"><span className="red-text">{this.state.address.city}</span></p>
            <p className="user-info-element"><span className="red-text">{this.state.address.state}</span></p>
            <p className="user-info-element"><span className="red-text">{this.state.address.zip}</span></p>
            <p className="user-info-element"><span className="red-text">{this.state.address.country}</span></p>
            <div className='row'>
              <div className='red-button' onClick={this.logout.bind(this)}>
                <span className='button-text'>Log Out</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default AccountPanel;