import React from 'react'
import apiHelpers from './api-helpers'
import GenericModal from './generic-modal.jsx'
import AccountCard from './account-card.jsx'
const $ = window.$

class AccountPanel extends React.Component {
  constructor (props) {
    super(props)
    apiHelpers.verifyToken().then((answer) => {
      if (!answer) {
        window.location.href = '/login/'
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
      loaded: false,
      errorText: '',
      statusText: ''
    }
  }

  componentDidMount () {
    this.isLoggedIn()
    this.populateUserInfo()
  }

  isLoggedIn () {
    const loginButton = document.getElementById('login-button')
    apiHelpers.verifyToken().then((answer) => {
      if (answer) {
        loginButton.innerHTML = '<i class="fa fa-user"></i>'
        loginButton.onclick = () => {
          window.location.href = '/home/'
        }
      } else {
        loginButton.onclick = () => {
          window.location.href = '/login/'
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
            invites: response.data.invites || [],
            loaded: true
          })
        } else {
          window.location.href = '/login/'
        }
      }
    })
  }

  logout () {
    window.localStorage.removeItem('token')
    window.location.href = '/login/'
  }

  render () {
    let purchases = this.state.purchases
    let athletes = this.state.athletes
    let user = this.state.user
    let isEditing = this.state.isEditing
    let hasName = this.state.name && this.state.name !== 'None Entered'

    let heroSub = 'Loading your account...'
    if (this.state.loaded) {
      heroSub = hasName ? ('Welcome back, ' + this.state.name + '.') : 'Welcome back.'
    }

    let editAction = (
      <button type='button' className='acct-card__action' onClick={this.editUserInfo.bind(this)}>
        <i className={isEditing ? 'fa fa-times' : 'fa fa-pencil'} /> {isEditing ? 'Cancel' : 'Edit'}
      </button>
    )

    return (
      <section className='reg-redesign acct-redesign'>
        <header className='acct-hero'>
          <div className='container acct-hero__inner'>
            <div>
              <p className='acct-hero__eyebrow'>Athlete Profile</p>
              <h1 className='acct-hero__title'>My Account</h1>
              <p className='acct-hero__sub'>{heroSub}</p>
            </div>
            <div className='acct-hero__actions'>
              <button type='button' className='reg-btn acct-btn--light acct-btn--sm' onClick={this.logout.bind(this)}>Log Out</button>
            </div>
          </div>
        </header>

        <div className='container acct-body'>
          <div className='acct-grid'>
            <div className='acct-col'>
              <AccountCard title='My Purchases'>
                <Purchases purchases={purchases} athletes={athletes} user={user} loaded={this.state.loaded} />
              </AccountCard>

              <AccountCard title='Pole Rental'>
                <PoleRental user={user} />
              </AccountCard>
            </div>

            <div className='acct-col'>
              <AccountCard title='Account Details' action={editAction}>
                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); this.updateUserInfo() }}>
                    <div className='reg-field'>
                      <label htmlFor='acct-name'>Name</label>
                      <input id='acct-name' className='reg-input' ref='nameChange' placeholder={hasName ? this.state.name : ''} />
                    </div>
                    <div className='reg-field'>
                      <label>Email</label>
                      <p className='acct-muted' style={{margin: 0}}>{this.state.email}</p>
                    </div>
                    <div className='reg-field'>
                      <label htmlFor='acct-password'>New Password</label>
                      <input id='acct-password' className='reg-input' ref='passwordChange' type='password' />
                    </div>
                    <div className='reg-field'>
                      <label htmlFor='acct-password-confirm'>Confirm New Password</label>
                      <input id='acct-password-confirm' className='reg-input' ref='passwordChangeConfirm' type='password' />
                    </div>
                    <div className='acct-form-actions'>
                      <button type='submit' className='reg-btn acct-btn--sm'>Update</button>
                      <button type='button' className='reg-btn reg-btn--ghost acct-btn--sm' onClick={this.editUserInfo.bind(this)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <dl className='acct-dl'>
                    <div className='acct-dl__row'>
                      <dt>Name</dt>
                      <dd>{this.state.name}</dd>
                    </div>
                    <div className='acct-dl__row'>
                      <dt>Email</dt>
                      <dd>{this.state.email}</dd>
                    </div>
                    <div className='acct-dl__row'>
                      <dt>Password</dt>
                      <dd>********</dd>
                    </div>
                  </dl>
                )}
                {this.state.errorText.length > 0 ? (
                  <div className='reg-error'>
                    <p>{this.state.errorText}</p>
                  </div>
                ) : null}
                {this.state.statusText.length > 0 ? (
                  <div className='acct-status'>
                    <p>{this.state.statusText}</p>
                  </div>
                ) : null}
              </AccountCard>

              {this.state.isAdmin ? (
                <AccountCard title='Administrator'>
                  <p>You have administrator access. Manage registrations, discount codes and poles below.</p>
                  <div className='acct-form-actions'>
                    <a className='reg-btn acct-btn--sm' href='/admin'>Admin Panel</a>
                    <a className='reg-btn reg-btn--ghost acct-btn--sm' href='/poles'>Poles</a>
                  </div>
                </AccountCard>
              ) : null}

              <AccountCard title='Resources'>
                <ul className='acct-links'>
                  <li>
                    <a href='/files/quarterly-conditioning.pdf' download>
                      <i className='fa fa-file-pdf-o' /> Quarterly Conditioning Guide
                      <i className='fa fa-download acct-links__arrow' />
                    </a>
                  </li>
                </ul>
              </AccountCard>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

class PoleRental extends React.Component {
  constructor (props) {
    super(props)

    window.testFunc = () => {
      console.log(this.getSelectedInfo())
    }

    this.state = {
      openModal: false,
      athletes: [],
      errorText: '',
      rentalOptions: [
        {name: 'oneTime', displayName: '48 Hours', displayPrice: '$50'},
      ],
      quarters: [
        {name: 'winter', displayName: 'Winter'},
        {name: 'summer', displayName: 'Summer'},
        {name: 'fall', displayName: 'Fall'},
        {name: 'spring', displayName: 'Spring'}
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

  getSelectedInfo () {
    return apiHelpers.parseFormValues($('#rental-info').serializeArray())
  }

  updateState () {
    let output = this.getSelectedInfo()
    if (output.type === 'quarterly') {
      this.setState({
        period: 'quarterly',
        quarter: output.quarter
      })
    } else if (output.type === 'oneTime') {
      this.setState({
        period: 'oneTime'
      })
    }
  }

  submit () {
    let output = this.getSelectedInfo()
    // output.type = $('input[name="type"]:checked').val()
    let selected = false
    if (output.type === 'quarterly') {
      this.setState({
        period: 'quarterly',
        quarter: output.quarter
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
    if (this.state.athletes.filter(athlete => athlete.currentlyRegistered).length === 0) {
      return (
        <div>
          {this.state.errorText ? (
            <div className='reg-error'>
              <p>{this.state.errorText}</p>
            </div>
          ) : null}
          <div className='acct-empty'>There are no actively registered athletes associated with this account.</div>
        </div>
      )
    } else {
      return (
        <div className='pole-rental'>
          <p className='acct-muted'>
            Registered athletes can rent a pole. Choose a rental period and athlete below.
          </p>
          <form id='rental-info' onChange={this.updateState.bind(this)} onSubmit={(e) => { e.preventDefault(); this.submit() }}>
            <div className='reg-grid-2'>
              <div className='reg-field'>
                <label htmlFor='rental-type'>Rental Period<span className='rd-req'>*</span></label>
                <select id='rental-type' className='reg-input' name='type'>
                  {
                    this.state.rentalOptions.map(option => {
                      return (<option key={option.name} value={option.name}>{option.displayName}: {option.displayPrice}</option>)
                    })
                  }
                </select>
              </div>
              <div className='reg-field'>
                <label htmlFor='rental-athlete'>Athlete<span className='rd-req'>*</span></label>
                <select id='rental-athlete' className='reg-input' name='athlete'>
                  {
                    this.state.athletes.filter(athlete => athlete.currentlyRegistered).map(athlete => {
                      return (<option key={athlete.id} value={athlete.id}>{athlete.firstName + ' ' + athlete.lastName}</option>)
                    })
                  }
                </select>
              </div>
            </div>
            <div className='reg-field' style={{display: this.state.period === 'quarterly' ? 'block' : 'none'}}>
              <label htmlFor='rental-quarter'>Quarter<span className='rd-req'>*</span></label>
              <select id='rental-quarter' className='reg-input' name='quarter' defaultValue={apiHelpers.getCurrentQuarter()}>
                {
                  this.state.quarters.map(option => {
                    return (<option key={option.name} value={option.name}>{option.displayName}</option>)
                  })
                }
              </select>
            </div>
            <div className='acct-form-actions'>
              <button type='submit' className='reg-btn acct-btn--sm'>Request Rental</button>
            </div>
          </form>
          {openModal ? (<GenericModal style={{zIndex: 9999}} title={'Request Rental'} onClose={this.closeModal.bind(this)} childComponent={<PoleRentalPurchase period={this.state.period} user={this.props.user} quarter={this.state.quarter} closeFunction={this.closeModal.bind(this)} athlete={this.getSelectedAthlete()} />} />) : ''}
        </div>
      )
    }
  }
}

class PoleRentalPurchase extends React.Component {
  constructor (props) {
    super(props)
    if (this.props.period === 'quarterly') {
      this.state = {
        price: 200.00,
        periodDisplay: 'Quarterly',
        successfulPayment: false,
        failedPayment: false,
        statusText: ''
      }
    } else if (this.props.period === 'oneTime') {
      this.state = {
        price: 50.00,
        periodDisplay: '48 Hours',
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
    apiHelpers.requestPole(this.props.athlete.id, this.props.period, this.props.quarter).then(res => {
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
        <div className='reg-redesign' style={{minHeight: 0, backgroundColor: 'transparent'}}>
          <p className='acct-modal-copy'>
            {this.props.period === 'oneTime'
          ? 'A one-time rental is good for 48 hours. You are expected to return the pole at practice 48 hours from the date the pole is issued.'
          : 'A quarterly rental is good for the duration of the training quarter. You are expected to return the pole at practice before the start of the following quarter.'}</p>
          <div className='reg-summary'>
            <div className='reg-summary__row'>
              <span className='reg-summary__label'>{this.state.periodDisplay} rental</span>
              <span className='reg-summary__amount'>${this.state.price.toFixed(2)}</span>
            </div>
            <div className='reg-summary__row reg-summary__row--muted'>
              <span className='reg-summary__label'>Online transaction fee (3%)</span>
              <span className='reg-summary__amount'>${(this.state.price * 0.03).toFixed(2)}</span>
            </div>
            <div className='reg-summary__row reg-summary__row--total'>
              <span className='reg-summary__label'>Total</span>
              <span className='reg-summary__amount'>${(this.state.price * 1.03).toFixed(2)}</span>
            </div>
          </div>
          <div id='paypal-button-container' />
        </div>
      )
    } else {
      return (
        <div className={this.state.failedPayment ? 'reg-error' : 'acct-status'}>
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
    if (!this.props.loaded) {
      return (<p className='acct-muted'>Loading...</p>)
    }
    let user = this.props.user || {}
    let purchases = this.props.purchases.filter((purchase) => purchase.userId === user.id)
    if (purchases.length === 0) {
      return (
        <div className='acct-empty'>
          No training purchases yet.
          <div><a className='reg-btn acct-btn--sm' href='/'>Register for Training</a></div>
        </div>
      )
    } else {
      return (
        <div className='acct-table-wrap'>
          <table className='acct-table'>
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Year</th>
                <th>Group</th>
                <th>Facility</th>
                <th>Athlete</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => {
                return (
                  <tr key={purchase.id}>
                    <td>
                      {purchase.quarter.toUpperCase()}
                    </td>
                    <td>
                      {purchase.createdAt ? apiHelpers.getPurchaseFullQuarter(purchase).year : ''}
                    </td>
                    <td>
                      {purchase.group === 'beginner-intermediate' ? ('BEGINNER/INTERMEDIATE') : purchase.group.toUpperCase()}
                    </td>
                    <td>
                      {purchase.facility.toUpperCase()}
                    </td>
                    <td>
                      {getAthlete(purchase.athleteId)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }
  }
}

export default AccountPanel
