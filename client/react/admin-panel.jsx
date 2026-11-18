import React from 'react'
import apiHelpers from './api-helpers'
import SuperTable from './super-table.jsx'
import AccountCard from './account-card.jsx'
import RegistrationChart from './registration-chart.jsx'
import RegistrationBreakdown from './registration-breakdown.jsx'
const $ = window.$

// {quarter: 'fall', year: 2026} -> 'Fall 2026'
const quarterName = (q) => q.quarter.charAt(0).toUpperCase() + q.quarter.slice(1) + ' ' + q.year

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
        loginButton.innerHTML = '<i class="fa fa-user"></i>'
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
    let currentFullQuarter = apiHelpers.getCurrentFullQuarter()
    return arr.filter(record => {
      let recordQuarter = this.getFullQuarter(record)
      return (recordQuarter.quarter.indexOf(currentFullQuarter.quarter) !== -1 && recordQuarter.year === currentFullQuarter.year)
    })
  }

  getFullQuarter (row) {
    let rowMonth = new Date(row.createdAt).getMonth() + 1
    let rowYear = new Date(row.createdAt).getFullYear()

    if ((rowMonth === 1 || rowMonth === 2) && row.quarter.indexOf('winter') !== -1) {
      rowYear--
    }

    return {
      year: rowYear,
      quarter: row.quarter
    }
  }


  // Adds a `year` column (the year of the training quarter, derived from the
  // purchase's createdAt via getFullQuarter so January/February winter
  // registrations count toward the previous year's winter). SuperTable orders
  // columns by key order, so `year` is inserted directly after `quarter`.
  withQuarterYear (row) {
    if (!row.createdAt || !row.quarter) {
      return row
    }
    let year = this.getFullQuarter(row).year
    let out = {}
    for (let key in row) {
      if (key === 'dcvMobileApp') {
        continue // placed just before quarter below
      }
      if (key === 'quarter') {
        out.dcvMobileApp = row.dcvMobileApp || ''
      }
      out[key] = row[key]
      if (key === 'quarter') {
        out.year = year
      }
    }
    return out
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
          returnArr.push(this.withQuarterYear(purchaseClone))
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

    if (!(level <= 5 && level >= 1)) {
      window.alert('Level must be 1,2,3, 4, or 5')
    } else {
      if (!!level && !!description) {
        apiHelpers.createInvite(description, level)
        .then((response) => {
          window.location.reload()
        })
      }
    }
  }

  filterByUpcoming (arr) {
    return arr.filter(record => {
      let rowQuarterFull = this.getFullQuarter(record)
      let nextQuarterFull = apiHelpers.getNextFullQuarter()
      return (rowQuarterFull.quarter.indexOf(nextQuarterFull.quarter) !== -1 && nextQuarterFull.year === rowQuarterFull.year)
    })
  }

  updateDisplayRecords () {
    let allChecked = $('#showAll').is(':checked')
    let upcomingChecked = $('#showUpcoming').is(':checked')
    let currentChecked = $('#showCurrent').is(':checked')

    if (allChecked) {
      this.setState({
        displayData: this.state.fullData
      })
    } else if (upcomingChecked && currentChecked) {
      let upcoming = this.filterByUpcoming(this.state.fullData || [])
      this.setState({
        displayData: this.state.filteredData.concat(upcoming)
      })
    } else if (upcomingChecked) {
      let upcoming = this.filterByUpcoming(this.state.fullData || [])
      this.setState({
        displayData: upcoming
      })
    } else if (currentChecked) {
      this.setState({
        displayData: this.state.filteredData
      })
    } else {
      this.setState({
        displayData: []
      })
    }
  }

  // Distinct athletes in the shown records, and how many have a DCV mobile
  // app profile linked to their training record
  mobileAppStat () {
    let all = {}
    let onApp = {}
    ;(this.state.displayData || []).forEach((row) => {
      all[row.athleteId] = true
      if (row.dcvMobileApp === 'Yes') {
        onApp[row.athleteId] = true
      }
    })
    let total = Object.keys(all).length
    let count = Object.keys(onApp).length
    return {count: count, total: total, pct: total ? Math.round((count / total) * 100) : 0}
  }

  render () {
    let showAllRecords = $('#showAll').is(':checked')
    let appStat = this.mobileAppStat()

    return (
      <section className='reg-redesign acct-redesign'>
        <header className='acct-hero'>
          <div className='container acct-hero__inner'>
            <div>
              <p className='acct-hero__eyebrow'>Administrator</p>
              <h1 className='acct-hero__title'>Admin Panel</h1>
              <p className='acct-hero__sub'>Registered athletes, discount codes and invite codes.</p>
            </div>
            <div className='acct-hero__actions'>
              <a className='reg-btn acct-btn--sm' href='/poles'>Poles</a>
              <a className='reg-btn acct-btn--light acct-btn--sm' href='/account'>My Account</a>
            </div>
          </div>
        </header>

        <div className='container acct-body'>
          <div className='acct-col'>
            <AccountCard title='Registered Athletes' action={(
              <span className='acct-app-stat' title='Distinct athletes in the records shown below whose DCV mobile app profile is linked to their training record'>
                <img src='/img/logos/cropped-logo_square-180x180.png' alt='' className='acct-app-logo' />
                Athletes on Mobile App <strong>{appStat.count}/{appStat.total}</strong> ({appStat.pct}%)
              </span>
            )}>
              <div className='acct-filters'>
                <span className='acct-filters__label'>Show</span>
                <label className='acct-chip'>
                  <input id='showCurrent' type='checkbox' disabled={showAllRecords} onChange={this.updateDisplayRecords.bind(this)} defaultChecked />
                  <span>Current Quarter</span>
                </label>
                <label className='acct-chip'>
                  <input id='showUpcoming' type='checkbox' disabled={showAllRecords} onChange={this.updateDisplayRecords.bind(this)} />
                  <span>Upcoming Quarter</span>
                </label>
                <label className='acct-chip'>
                  <input id='showAll' type='checkbox' onChange={this.updateDisplayRecords.bind(this)} />
                  <span>All Records</span>
                </label>
              </div>
              <SuperTable data={this.state.displayData}
                shownColumns={['firstName', 'lastName', 'email', 'facility', 'group', 'membership', 'dcvMobileApp', 'quarter', 'year', 'size', 'notifications', 'emergencyContactMDN']}
                columnLabels={{dcvMobileApp: 'DCV Mobile App'}}
                renderCell={(key, value) => {
                  if (key !== 'dcvMobileApp') {
                    return undefined
                  }
                  return value === 'Yes'
                    ? (<img src='/img/logos/cropped-logo_square-180x180.png' className='acct-app-logo' alt='On DCV Mobile App' title='On DCV Mobile App' />)
                    : ''
                }} />
            </AccountCard>

            <AccountCard title='Registrations by Quarter'>
              <RegistrationChart data={this.state.fullData} />
            </AccountCard>

            <RegistrationBreakdown
              currentData={this.state.filteredData}
              upcomingData={this.filterByUpcoming(this.state.fullData || [])}
              currentLabel={quarterName(apiHelpers.getCurrentFullQuarter())}
              upcomingLabel={quarterName(apiHelpers.getNextFullQuarter())} />

            <div className='acct-grid acct-grid--halves'>
              <AccountCard title='Discount Codes'>
                <Discounts discounts={this.state.discounts} />
                <form id='addCode' onSubmit={this.addCode.bind(this)} style={{marginTop: '24px'}}>
                  <div className='reg-grid-2'>
                    <div className='reg-field'>
                      <label htmlFor='discount-description'>Description<span className='rd-req'>*</span></label>
                      <input id='discount-description' className='reg-input' type='text' name='description' ref='descInput' />
                    </div>
                    <div className='reg-field'>
                      <label htmlFor='discount-amount'>Percentage (0-100)<span className='rd-req'>*</span></label>
                      <input id='discount-amount' className='reg-input' type='text' name='amount' ref='percentInput' />
                    </div>
                  </div>
                  <div className='acct-form-actions'>
                    <button type='submit' className='reg-btn acct-btn--sm'>Add Code</button>
                  </div>
                </form>
              </AccountCard>

              <AccountCard title='Invite Codes'>
                <Invites invites={this.state.invites} />
                <form id='addInvite' onSubmit={this.addInvite.bind(this)} style={{marginTop: '24px'}}>
                  <div className='reg-grid-2'>
                    <div className='reg-field'>
                      <label htmlFor='invite-description'>Description<span className='rd-req'>*</span></label>
                      <input id='invite-description' className='reg-input' type='text' name='description' ref='inviteDescInput' />
                    </div>
                    <div className='reg-field'>
                      <label htmlFor='invite-level'>Level (1-5)<span className='rd-req'>*</span></label>
                      <input id='invite-level' className='reg-input' type='text' name='amount' ref='levelInput' />
                    </div>
                  </div>
                  <p className='reg-subnote'>1: Drop in &middot; 2: Private Lesson &middot; 3-5: Elite Groups</p>
                  <div className='acct-form-actions'>
                    <button type='submit' className='reg-btn acct-btn--sm'>Add Code</button>
                  </div>
                </form>
              </AccountCard>
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
        <div className='reg-error'>
          <p>{this.state.errorText}</p>
        </div>
      )
    }
    if (this.state.statusText.length > 0) {
      statusContainer = (
        <div className='acct-status'>
          <p>{this.state.statusText}</p>
        </div>
      )
    }

    if (this.props.discounts.length === 0) {
      return (<div className='acct-empty'>No discount codes yet.</div>)
    } else {
      return (
        <div>
          <div className='acct-table-wrap'>
            <table className='acct-table'>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Code</th>
                  <th>Amount</th>
                  <th className='acct-table__actions'><span className='sr-only'>Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {this.props.discounts.map((discount, index) => {
                  return (
                    <tr key={discount.id}>
                      <td>
                        {discount.type}
                      </td>
                      <td>
                        <span className='acct-table__code'>{discount.code}</span>
                      </td>
                      <td>
                        {discount.amount * 100}%
                      </td>
                      <td className='acct-table__actions'>
                        <button type='button' className='acct-icon-btn' title='Delete code' aria-label={'Delete code ' + discount.code} onClick={() => { this.deleteCode.bind(this)(discount.id) }}>
                          <i className='fa fa-trash-o' />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
        <div className='reg-error'>
          <p>{this.state.errorText}</p>
        </div>
      )
    }
    if (this.state.statusText.length > 0) {
      statusContainer = (
        <div className='acct-status'>
          <p>{this.state.statusText}</p>
        </div>
      )
    }

    if (this.props.invites.length === 0) {
      return (<div className='acct-empty'>No invite codes yet.</div>)
    } else {
      return (
        <div>
          <div className='acct-table-wrap'>
            <table className='acct-table'>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Code</th>
                  <th>Level</th>
                  <th className='acct-table__actions'><span className='sr-only'>Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {this.props.invites.map((invite) => {
                  return (
                    <tr key={invite.id}>
                      <td>
                        {invite.type}
                      </td>
                      <td>
                        <span className='acct-table__code'>{invite.code}</span>
                      </td>
                      <td>
                        {invite.level}
                      </td>
                      <td className='acct-table__actions'>
                        <button type='button' className='acct-icon-btn' title='Delete code' aria-label={'Delete code ' + invite.code} onClick={() => { this.deleteCode.bind(this)(invite.id) }}>
                          <i className='fa fa-trash-o' />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {errorContainer}
          {statusContainer}
        </div>
      )
    }
  }
}

export default AdminPanel
