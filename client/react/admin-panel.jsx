import React from 'react'
import apiHelpers from './api-helpers'
import SuperTable from './super-table.jsx'
const $ = window.$

class AdminPanel extends React.Component {
  constructor (props) {
    super(props)
    apiHelpers.isAdmin().then((answer) => {
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
      displayData: []
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

  populateUserInfo () {
    apiHelpers.getUserData()
    .then((response) => {
      if (response.data) {
        if (response.data.ok) {
          if (response.data.user.isAdmin) {
            let combinedData = this.combineData(response.data.athletes, response.data.purchases)
            let filteredData = this.filterByCurrentQuarter(combinedData)
            this.setState({
              name: response.data.user.name || 'None Entered',
              email: response.data.user.email,
              address: response.data.user.address || {line1: 'None Entered'},
              isAdmin: response.data.user.isAdmin,
              athletes: response.data.athletes || [],
              purchases: response.data.purchases || [],
              discounts: response.data.discounts || [],
              invites: response.data.invites || [],
              displayData: filteredData,
              filteredData: filteredData,
              fullData: combinedData
            })
          } else {
            window.location.href = '/'
          }
        } else {
          window.location.href = '/'
        }
      }
    })
  }

  filterByCurrentQuarter (arr) {
    let quarter = apiHelpers.getCurrentQuarter()
    let currentYear = (new Date()).getFullYear()
    return arr.filter(record => {
      let recordYear = new Date(record.createdAt).getFullYear()
      return (recordYear === currentYear && record.quarter.indexOf(quarter) !== -1)
    })
  }

  combineData (athletes, purchases) {
    let returnArr = []
    for (let i = 0; i < purchases.length; i++) {
      let athleteId = purchases[i].athleteId
      for (let j = 0; j < athletes.length; j++) {
        if (athletes[j].id === athleteId) {
          let purchaseClone = JSON.parse(JSON.stringify(purchases[i]))
          let athleteClone = JSON.parse(JSON.stringify(athletes[j]))
          for (let key in athleteClone) {
            if (!(purchaseClone.hasOwnProperty(key))) {
              purchaseClone[key] = athleteClone[key]
            } else if (key.toUpperCase().indexOf('ID') === -1) {
              purchaseClone['athlete_' + key] = athleteClone[key]
            }
          }
          returnArr.push(purchaseClone)
        }
      }
    }
    return returnArr
  }

  addCode (e) {
    e.preventDefault()
    let amount = this.refs.percentInput.value
    amount = parseFloat(amount) / 100
    let description = this.refs.descInput.value
    if (!!amount && !!description) {
      apiHelpers.createDiscount(description, amount)
      .then((response) => {
        window.location.reload()
      })
    }
  }

  addInvite (e) {
    e.preventDefault()
    let level = this.refs.levelInput.value
    let description = this.refs.inviteDescInput.value

    if (!(level <= 5 && level >= 3)) {
      window.alert('Level must be 3, 4, or 5')
    } else {
      if (!!level && !!description) {
        apiHelpers.createInvite(description, level)
        .then((response) => {
          window.location.reload()
        })
      }
    }
  }

  toggleOldRecords () {
    let checked = $('#showOld').is(':checked')
    if (checked) {
      this.setState({
        displayData: this.state.fullData
      })
    } else {
      this.setState({
        displayData: this.state.filteredData
      })
    }
  }

  render () {
    return (
      <section id='my-account'>

        <p className='subsection-header'><span className='red-text'>Admin</span> Panel</p>

        <div className='row'>
          <div className='col-xs-12'>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Registered Athletes</span>
              </div>
              <div className='body-box'>
                <input id='showOld' type='checkbox' onChange={this.toggleOldRecords.bind(this)} /> Show Old Records
                <SuperTable data={this.state.displayData} shownColumns={['firstName', 'lastName', 'facility', 'group', 'quarter', 'emergencyContactMDN']} />
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-12 col-md-6'>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Discount Codes</span>
              </div>
              <div className='body-box'>
                <Discounts discounts={this.state.discounts} />
                <form id='addCode' className='form-labels-on-top' onSubmit={this.addCode.bind(this)}>
                  <div className='row'>
                    <div className='col-xs-12 col-md-6'>
                      <div className='form-row'>
                        <label>
                          <span className='required'>Description</span>
                          <input type='text' name='description' ref='descInput' style={{width: '100%'}} />
                        </label>
                      </div>
                    </div>

                    <div className='col-xs-12 col-md-6'>
                      <div className='form-row'>
                        <label>
                          <span className='required'>Percentage (0-100)</span>
                          <input type='text' name='amount' ref='percentInput' style={{width: '100%'}} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='form-row' >
                    <button type='submit'>Add Code</button>
                  </div>

                </form>
              </div>
            </div>
          </div>
          <div className='col-xs-12 col-md-6'>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Invite Codes</span>
              </div>
              <div className='body-box'>
                <Invites invites={this.state.invites} />
                <form id='addInvite' className='form-labels-on-top' onSubmit={this.addInvite.bind(this)}>
                  <div className='row'>
                    <div className='col-xs-12 col-md-6'>
                      <div className='form-row'>
                        <label>
                          <span className='required'>Description</span>
                          <input type='text' name='description' ref='inviteDescInput' style={{width: '100%'}} />
                        </label>
                      </div>
                    </div>

                    <div className='col-xs-12 col-md-6'>
                      <div className='form-row'>
                        <label>
                          <span className='required'>Level (3-5)</span>
                          <input type='text' name='amount' ref='levelInput' style={{width: '100%'}} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='form-row' >
                    <button type='submit'>Add Code</button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

class Discounts extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      errorText: '',
      statusText: ''
    }
  }

  deleteCode (index) {
    this.setState({
      errorText: '',
      statusText: ''
    })
    apiHelpers.deleteDiscount(index)
    .then((response) => {
      if (response.data.ok) {
        this.setState({
          statusText: 'Code Deleted'
        })
        setTimeout(() => { window.location.reload() }, 2000)
      } else {
        this.setState({
          errorText: 'An error has occurred'
        })
      }
    })
  }

  render () {
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

    if (this.props.discounts.length === 0) {
      return (<p> None to show </p>)
    } else {
      return (
        <div>
          <table className='purchases-table'>
            <tbody>
              <tr>
                <th>Description</th>
                <th>Code</th>
                <th>Amount</th>
                <th>Delete</th>
              </tr>
              {this.props.discounts.map((discount, index) => {
                return (
                  <tr key={discount.id}>
                    <td>
                      {discount.type}
                    </td>
                    <td>
                      {discount.code}
                    </td>
                    <td>
                      {discount.amount * 100}%
                    </td>
                    <td>
                      <span className='glyphicon glyphicon-remove edit-button' onClick={() => { this.deleteCode.bind(this)(discount.id) }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {errorContainer}
          {statusContainer}
        </div>
      )
    }
  }
}

class Invites extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      errorText: '',
      statusText: ''
    }
  }

  deleteCode (index) {
    this.setState({
      errorText: '',
      statusText: ''
    })
    apiHelpers.deleteInvite(index)
    .then((response) => {
      if (response.data.ok) {
        this.setState({
          statusText: 'Code Deleted'
        })
        setTimeout(() => { window.location.reload() }, 2000)
      } else {
        this.setState({
          errorText: 'An error has occurred'
        })
      }
    })
  }

  render () {
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

    if (this.props.invites.length === 0) {
      return (<p> None to show </p>)
    } else {
      return (
        <div>
          <table className='purchases-table'>
            <tbody>
              <tr>
                <th>Description</th>
                <th>Code</th>
                <th>Level</th>
                <th>Delete</th>
              </tr>
              {this.props.invites.map((invite) => {
                return (
                  <tr key={invite.id}>
                    <td>
                      {invite.type}
                    </td>
                    <td>
                      {invite.code}
                    </td>
                    <td>
                      {invite.level}
                    </td>
                    <td>
                      <span className='glyphicon glyphicon-remove edit-button' onClick={() => { this.deleteCode.bind(this)(invite.id) }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {errorContainer}
            {statusContainer}
          </table>
        </div>
      )
    }
  }
}

export default AdminPanel
