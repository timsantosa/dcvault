import React from 'react';
import {render} from 'react-dom';
import apiHelpers from './api-helpers';

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
      athletes: [],
      purchases: [],
      discounts: [],
      invites: []
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
            user: response.data.user || {},
            name: response.data.user.name || 'None Entered',
            email: response.data.user.email,
            address: response.data.user.address || {line1: 'None Entered'},
            isAdmin: response.data.user.isAdmin,
            athletes: response.data.athletes || [],
            purchases: response.data.purchases || [],
            discounts: response.data.discounts || [],
            invites: response.data.invites || []
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
    let purchases = this.state.purchases;
    let athletes = this.state.athletes;
    let user = this.state.user;
      return (
      <section id="my-account">
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <p className="subsection-header"><span className="red-text">Athlete</span> Profile</p>
            <div className="account-panel-box">
              <div className="title-box">
                <span className="title">My Purchases</span>
              </div>
              <div className="body-box">
                <Purchases purchases={purchases} athletes={athletes} user={user}/>
              </div>
            </div>

            {this.state.isAdmin ? (
              <div className="account-panel-box">
                <div className="title-box">
                  <span className="title">Admin Panel</span>
                </div>
                <div className="body-box">
                  <p>
                    It appears you are an administrator. To view your Administrator Panel, click below.
                  </p>
                  <div className='red-button' onClick={() => {window.location.href='/admin'}}>
                    <span className='button-text'>Go</span>
                  </div>
                </div>
              </div>
            ) : ''}

          </div>


          <div className="col-xs-12 col-md-6">
            <p className="subsection-header">Account <span className="red-text">Management</span></p>

            <div className="account-panel-box">
              <div className="title-box">
                <span className="title">My Account Details</span>
                <span className="glyphicon glyphicon-pencil edit-button"></span>
              </div>
              <div className="body-box">
                <p><span className="item-name">Name:</span>{this.state.name}</p>
                <p><span className="item-name">Email:</span>{this.state.email}</p>
                <p><span className="item-name">Password:</span>********</p>
                <p></p>
                <p>Account Management is under maintenance and will not allow you to make changes. Sorry for the inconvenience</p>

                <div className='red-button' onClick={this.logout.bind(this)}>
                  <span className='button-text'>Log Out</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xs-12 col-md-6">
            <div className="account-panel-box">
              <div classname='title-box'>
                <span className='title'>Training Information</span>
              </div>
              <div className='body-box'>
                <a href='../files/quarterly-conditioning.pdf'>Quarterly Training Guide</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

class Purchases extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props)
  }

  getAthlete(id) {
    for (let i = 0; i < this.props.athletes.length; i++) {
      if (this.props.athletes[i].id === id) {
        return (this.props.athletes[i].firstName + ' ' + this.props.athletes[i].lastName).toUpperCase();
      }
    }
  }

  render() {
    let getAthlete = this.getAthlete.bind(this);
    if (this.props.purchases.length === 0) {
      return (<p> None to show </p>);
    } else {
      return (
        <table className="purchases-table">
          <tbody>
            <tr>
              <th>Quarter</th>
              <th>Group</th>
              <th>Facility</th>
              <th>Athlete</th>
            </tr>
            {this.props.purchases.map((purchase) => {
              if (purchase.userId === this.props.user.id) {
                return (
                  <tr key={purchase.id}>
                    <td>
                      {purchase.quarter.toUpperCase()}
                    </td>
                    <td>
                      {purchase.group === 'youth-adult' ? ('YOUTH OR ADULT') : purchase.group.toUpperCase()}
                    </td>
                    <td>
                      {purchase.facility.toUpperCase()}
                    </td>
                    <td>
                      {getAthlete(purchase.athleteId)}
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      );
    }
  }
}

export default AccountPanel;