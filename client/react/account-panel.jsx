import React from 'react'
import apiHelpers from './api-helpers'
import GenericModal from './generic-modal.jsx'
const $ = window.$

class AccountPanel extends React.Component {
  constructor (props) {
    super(props)
    apiHelpers.verifyToken().then((answer) => {
      if (!answer) {
        window.location.href = '/'
      }
    })

    this.state = {
      name: '',
      email: '',
      address: '',
      athletes: [],
      purchases: [],
      discounts: [],
      invites: [],
      isEditing: false,
      errorText: '',
      statusText: ''
    }
  }

  componentDidMount () {
    this.isLoggedIn()
    this.populateUserInfo()
  }

  isLoggedIn () {
    const loginDiv = document.getElementById('login')
    const loginButton = document.getElementById('login-button')
    apiHelpers.verifyToken().then((answer) => {
      if (answer) {
        loginButton.innerHTML = 'My Account'
        loginButton.onclick = () => {
          window.location.href = '/account'
        }
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1
          loginDiv.style.visibility = 'visible'
        }
      }
    })
  }

  editUserInfo () {
    let current = this.state.isEditing
    this.setState({
      isEditing: !current
    })
  }

  updateUserInfo () {
    this.setState({
      errorText: '',
      statusText: ''
    })

    let password = this.refs.passwordChange.value
    let passwordConf = this.refs.passwordChangeConfirm.value
    let name = this.refs.nameChange.value

    if (password !== passwordConf) {
      this.setState({
        errorText: 'New passwords do not match'
      })
    } else {
      apiHelpers.editUserInfo(name, password)
      .then((response) => {
        if (!response.data.ok) {
          this.setState({
            errorText: 'An error has occurred. Please try again later'
          })
        } else {
          this.setState({
            statusText: 'Your account has been updated. You will be logged out in 10 seconds. Please log in again for the changes to take effect'
          })
          setTimeout(this.logout.bind(this), 10000)
        }
      })
    }
  }

  populateUserInfo () {
    apiHelpers.getUserData()
    .then((response) => {
      if (response.data) {
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
          })
        } else {
          window.location.href = '/'
        }
      }
    })
  }

  logout () {
    window.localStorage.removeItem('token')
    window.location.href = '/'
  }

  render () {
    let purchases = this.state.purchases
    let athletes = this.state.athletes
    let user = this.state.user
    let errorContainer = ''
    let statusContainer = ''
    if (this.state.errorText.length > 0) {
      errorContainer = (
        <div className='error-container'>
          <p>{this.state.errorText}</p>
        </div>
      )
    }
    if (this.state.statusText.length > 0) {
      statusContainer = (
        <div className='status-container'>
          <p>{this.state.statusText}</p>
        </div>
      )
    }
    return (
      <section id='my-account'>
        <div className='row'>
          <div className='col-xs-12 col-md-6'>
            <p className='subsection-header'><span className='red-text'>Athlete</span> Profile</p>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>My Purchases</span>
              </div>
              <div className='body-box'>
                <Purchases purchases={purchases} athletes={athletes} user={user} />
              </div>
            </div>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Resources</span>
              </div>
              <div className='body-box'>
                <ul>
                  <li><a href='/files/quarterly-conditioning.pdf' download>Quarterly Conditioning Guide</a></li>
                  <li><a href='/files/parking-pass.pdf' download>DCV Parking Pass</a></li>
                </ul>
              </div>
            </div>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Pole Rental</span>
              </div>
              <div className='body-box'>
                <PoleRental user={user} />
              </div>
            </div>
          </div>

          <div className='col-xs-12 col-md-6'>
            <p className='subsection-header'>Account <span className='red-text'>Management</span></p>

            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>My Account Details</span>
                <span style={{display: this.state.isEditing ? 'none' : 'inline-block'}} className='glyphicon glyphicon-pencil edit-button' onClick={this.editUserInfo.bind(this)} />
                <span style={{display: this.state.isEditing ? 'inline-block' : 'none'}} className='glyphicon glyphicon-remove edit-button' onClick={this.editUserInfo.bind(this)} />
              </div>
              <div className='body-box'>
                <p><span className='item-name'>Name:</span>
                  <span style={{display: this.state.isEditing ? 'none' : 'inline-block'}}>{this.state.name}</span>
                  <input ref='nameChange' style={{display: this.state.isEditing ? 'inline-block' : 'none'}} />
                </p>
                <p><span className='item-name'>Email:</span>{this.state.email}</p>
                <p><span className='item-name'>Password:</span>
                  <span style={{display: this.state.isEditing ? 'none' : 'inline-block'}}>********</span>
                  <input ref='passwordChange' style={{display: this.state.isEditing ? 'inline-block' : 'none'}} type='password' />
                  <span style={{display: this.state.isEditing ? 'block' : 'none'}} />
                  <span className='item-name' style={{display: this.state.isEditing ? 'inline-block' : 'none'}}>Confirm:</span>
                  <input ref='passwordChangeConfirm' style={{display: this.state.isEditing ? 'inline-block' : 'none'}} type='password' />
                </p>

                <div className='red-button' style={{display: this.state.isEditing ? 'block' : 'none'}} onClick={this.updateUserInfo.bind(this)}>
                  <span className='button-text'>Update</span>
                </div>
                {errorContainer}
                {statusContainer}

                <p style={{display: this.state.isEditing ? 'none' : 'block'}}>
                  To edit your account information, click the pen icon in the top right
                </p>

                <div style={{display: this.state.isEditing ? 'none' : 'block'}} className='red-button' onClick={this.logout.bind(this)}>
                  <span className='button-text'>Log Out</span>
                </div>
              </div>
            </div>
            {this.state.isAdmin ? (
              <div className='account-panel-box'>
                <div className='title-box'>
                  <span className='title'>Admin Panel</span>
                </div>
                <div className='body-box'>
                  <p>
                    It appears you are an administrator. To view your Administrator Panel, click below.
                  </p>
                  <div className='multi-btn-container'>
                    <div className='red-button' onClick={() => { window.location.href = '/admin' }}>
                      <span className='button-text'>Admin</span>
                    </div>
                    <div className='red-button' onClick={() => { window.location.href = '/poles' }}>
                      <span className='button-text'>Poles</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : ''}
          </div>
        </div>
      </section>
    )
  }
}

class PoleRental extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      openModal: false,
      athletes: [],
      errorText: '',
      rentalOptions: [
        {name: 'oneTime', displayName: 'One Time', displayPrice: '$75'},
        {name: 'quarterly', displayName: 'Quarterly', displayPrice: '$150'}
      ]
    }

    this.getAthleteList()
  }

  getAthleteList () {
    apiHelpers.getUserData().then(res => {
      if (res.data.ok) {
        this.setState({
          athletes: res.data.athletes.slice()
        })
      } else {
        this.setState({
          errorText: 'We could not retrieve any athletes for this account. Please refresh and try again. If the issue persists, please contact us'
        })
      }
    })
  }

  getSelectedAthlete () {
    let id = parseInt(apiHelpers.parseFormValues($('#rental-info').serializeArray()).athlete)
    let selected = {}
    this.state.athletes.forEach(athlete => {
      if (athlete.id === id) {
        selected = athlete
      }
    })
    return selected
  }

  submit () {
    let output = apiHelpers.parseFormValues($('#rental-info').serializeArray())
    // output.type = $('input[name="type"]:checked').val()
    let selected = false
    if (output.type === 'quarterly') {
      this.setState({
        period: 'quarterly'
      })
      selected = true
    } else if (output.type === 'oneTime') {
      this.setState({
        period: 'oneTime'
      })
      selected = true
    }

    if (selected) {
      this.setState({
        openModal: true
      })
    }
  }

  closeModal () {
    this.setState({
      openModal: false
    })
  }

  render () {
    const openModal = this.state.openModal
    return (
      <div className='pole-rental'>
        <p>
          To request a pole rental, select from the options below
        </p>
        <div style={{textAlign: 'center'}}>
          <form id='rental-info' className='form-labels-on-top' style={{padding: '8px', boxShadow: 'none'}}>
            <div className='form-row'>
              <label>
                <span className='required'>Select Rental Period</span>
                <select name='type'>
                  {
                    this.state.rentalOptions.map(option => {
                      return (<option key={option.name} value={option.name}>{option.displayName}: {option.displayPrice}</option>)
                    })
                  }
                </select>
              </label>
            </div>
            { this.state.athletes.length ? (
              <div className='form-row'>
                <label>
                  <span className='required'>Select Athlete</span>
                  <select name='athlete'>
                    {
                      this.state.athletes.filter(athlete => athlete.currentlyRegistered).map(athlete => {
                        return (<option key={athlete.id} value={athlete.id}>{athlete.firstName + ' ' + athlete.lastName}</option>)
                      })
                    }
                  </select>
                </label>
              </div>
            ) : (
              <div className='error-container'>
                <p>{this.state.errorText}</p>
              </div>
            )}

          </form>
          <div className='red-button' style={{marginTop: '16px', marginBottom: '16px'}} onClick={this.submit.bind(this)}>
            <span className='button-text'>Request Rental</span>
          </div>
        </div>
        {openModal ? (<GenericModal style={{zIndex: 9999}} title={'Request Rental'} onClose={this.closeModal.bind(this)} childComponent={<PoleRentalPurchase period={this.state.period} user={this.props.user} closeFunction={this.closeModal.bind(this)} athlete={this.getSelectedAthlete()} />} />) : ''}
      </div>
    )
  }
}

class PoleRentalPurchase extends React.Component {
  constructor (props) {
    super(props)
    if (this.props.period === 'quarterly') {
      this.state = {
        price: 150.00,
        periodDisplay: 'Quarterly',
        successfulPayment: false,
        failedPayment: false,
        statusText: ''
      }
    } else if (this.props.period === 'oneTime') {
      this.state = {
        price: 75.00,
        periodDisplay: 'One Time',
        successfulPayment: false,
        failedPayment: false,
        statusText: ''
      }
    }
  }

  componentDidMount () {
    if (!this.state.successfulPayment) {
      this.renderButton()
    }
  }

  continue (data) {
    apiHelpers.requestPole(this.props.athlete.id, this.props.period).then(res => {
      if (res.data.ok) {
        this.setState({
          successfulPayment: true,
          statusText: 'Your request has been processed. Please see the head coach at your next training session to check out your Pole'
        })
      } else {
        this.setState({
          failedPayment: true,
          statusText: 'Request Failed. Please check your PayPal records to verify the payment, and contact us to resolve the issue'
        })
      }
    })
  }

  renderButton () {
    let amount = 1.03 * this.state.price

    var cont = this.continue.bind(this)
    var paymentDescription = 'Pole rental: ' + this.state.periodDisplay + '; Athlete: ' + this.props.athlete.firstName + ' ' + this.props.athlete.lastName

    paypal.Button.render({ // eslint-disable-line
      env: window.configVariables.PAYPAL_MODE, // sandbox | production
      client: {
        sandbox: window.configVariables.PAYPAL_SANDBOX_ID,
        production: window.configVariables.PAYPAL_CLIENT_ID
      },
      commit: true,

      style: {
        size: 'responsive',
        shape: 'rect',
        color: 'silver',
        label: 'pay'
      },

      payment: function (data, actions) {
        return actions.payment.create({
          payment: {
            transactions: [
              {
                amount: { total: amount.toFixed(2), currency: 'USD' },
                note_to_payee: paymentDescription
              }
            ]
          }
        })
      },

    // onAuthorize() is called when the buyer approves the payment
      onAuthorize: function (data, actions) {
        return actions.payment.execute().then(function () {
          cont(data)
        })
      }

    }, '#paypal-button-container')
  }

  render () {
    if (!this.state.successfulPayment && !this.state.failedPayment) {
      return (
        <div style={{textAlign: 'center'}}>
          <p>
            {this.props.period === 'oneTime'
          ? 'A one-time rental is good for one week. You are expected to return the pole at practice one week from the date the pole is issued'
          : 'A quarterly rental is good for the duration of the training quarter. You are expected to return the pole at practice before the start of the following quarter'}</p>
          <p><span className='red-text'>{this.state.periodDisplay} rental:</span> ${this.state.price.toFixed(2)}</p>
          <p><span className='red-text'>Online Transaction Fee:</span> ${(this.state.price * 0.03).toFixed(2)}</p>
          <div id='paypal-button-container' />
        </div>
      )
    } else {
      return (
        <div className={this.state.failedPayment ? 'error-container' : 'status-container'}>
          <p>{this.state.statusText}</p>
        </div>
      )
    }
  }
}

class Purchases extends React.Component {
  getAthlete (id) {
    for (let i = 0; i < this.props.athletes.length; i++) {
      if (this.props.athletes[i].id === id) {
        return (this.props.athletes[i].firstName + ' ' + this.props.athletes[i].lastName).toUpperCase()
      }
    }
  }

  render () {
    let getAthlete = this.getAthlete.bind(this)
    if (this.props.purchases.length === 0) {
      return (<p> None to show </p>)
    } else {
      return (
        <table className='purchases-table'>
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
                )
              }
            })}
          </tbody>
        </table>
      )
    }
  }
}

export default AccountPanel
