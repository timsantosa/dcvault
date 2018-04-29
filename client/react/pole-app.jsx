import React from 'react'
import apiHelpers from './api-helpers'
import SuperTable from './super-table.jsx'
import GenericModal from './generic-modal.jsx'

const $ = window.$

class PoleApp extends React.Component {
  constructor (props) {
    super(props)
    apiHelpers.isAdmin().then(res => {
      if (!res) {
        window.location.href = '/'
      }
    })

    this.state = {
      poles: [],
      rentals: [],
      rentalsFormatted: [],
      requests: [],
      athletes: [],
      showSelectionModal: false,
      showInfoModal: false,
      showRentalModal: false,
      activeRequest: null,
      activePole: null,
      activeRental: null
    }
  }

  componentDidMount () {
    this.isLoggedIn()
    this.populateData()
  }

  populateData () {
    apiHelpers.getPoles().then(res => {
      if (res.data.ok) {
        this.setState({
          poles: res.data.poles
        })
      }
    })

    apiHelpers.getRentals().then(res => {
      if (res.data.ok) {
        let requestList = res.data.rentals.filter(rental => !rental.poleId)
        this.setState({
          rentals: res.data.rentals.slice(),
          requests: requestList
        })
      }
    })

    apiHelpers.getUserData().then(res => {
      if (res.data.ok) {
        this.setState({
          athletes: res.data.athletes
        })
      }
    })
  }

  getAthlete (id) {
    for (let i = 0; i < this.state.athletes.length; i++) {
      if (this.state.athletes[i].id === id) {
        return (this.state.athletes[i].firstName + ' ' + this.state.athletes[i].lastName).toUpperCase()
      }
    }
  }

  getPole (id) {
    if (!id) {
      return null
    }
    for (let i = 0; i < this.state.poles.length; i++) {
      if (this.state.poles[i].id === id) {
        let pole = this.state.poles[i]
        return `${pole.brand} ${pole.feet}'${pole.inches}" ${pole.weight}`
      }
    }
  }

  getDisplayKeys (dataArr) {
    if (dataArr.length && typeof dataArr[0] === 'object') {
      let obj = dataArr[0]
      return Object.keys(obj).filter(key => key !== 'createdAt' && key !== 'updatedAt')
    }
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

  fulfillPole (request) {
    this.setState({
      showSelectionModal: true,
      activeRequest: request
    })
  }

  closeSelectionModal () {
    this.setState({
      showSelectionModal: false,
      activeRequest: null
    })
  }

  closeInfoModal () {
    this.setState({
      showInfoModal: false,
      activePole: null
    })
  }

  closeRentalModal () {
    this.setState({
      showRentalModal: false,
      activeRental: null
    })
  }
  poleInfo (pole) {
    this.setState({
      showInfoModal: true,
      activePole: pole
    })
  }
  poleUpdate (success) {
    if (!success) {
      window.alert('An error occurred, please try again')
    } else {
      window.alert('Poles Updated')
    }
    this.closeInfoModal()
    this.populateData()
  }

  assignPole (pole) {
    apiHelpers.assignPole(this.state.activeRequest, pole).then(res => {
      if (res.data.ok) {
        window.alert('Assigned Pole')
      } else {
        window.alert('An error occurred: ' + res.message)
      }
      this.closeSelectionModal()
      this.populateData()
    })
  }

  addPole () {
    this.poleInfo({})
  }

  viewRentalInfo (row) {
    this.setState({showRentalModal: true, activeRental: this.getById(this.state.rentals, row.rentalId)})
  }

  getById (list, id) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return list[i]
      }
    }
  }

  getRentalData () {
    return this.state.rentals.filter(rental => rental.poleId !== null).map(rental => {
      return {
        rentalId: rental.id,
        athleteId: rental.id,
        createdAt: rental.createdAt,
        updatedAt: rental.updatedAt,
        athlete: this.getAthlete(rental.athleteId),
        expiration: new Date(rental.expiration).toLocaleDateString('en-US'),
        pole: this.getPole(rental.poleId)
      }
    })
  }

  render () {
    var poleList = this.state.poles.filter(pole => !pole.rented)
    return (
      <section id='my-account'>
        <p className='subsection-header'><span className='red-text'>Pole</span> Rental</p>
        <div className='row'>
          <div className='col-xs-12'>
            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Requests</span>
              </div>
              <div className='body-box' >
                {this.state.requests.map(request => {
                  return (<PoleRequest key={request.id} request={request} athlete={this.getAthlete(request.athleteId)} callback={this.fulfillPole.bind(this)} poles={this.state.poles} />)
                })}
              </div>
            </div>

            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Rentals</span>
              </div>
              <div className='body-box'>
                <div style={{display: this.getRentalData().length ? 'block' : 'none'}}>
                  <SuperTable data={this.getRentalData()} extraAction actionInfo={{title: 'More', iconClass: 'glyphicon glyphicon-chevron-right'}} callback={this.viewRentalInfo.bind(this)} shownColumns={['athlete', 'expiration', 'pole']} />
                </div>
              </div>
            </div>

            <div className='account-panel-box'>
              <div className='title-box'>
                <span className='title'>Poles</span>
              </div>
              <div className='body-box'>
                <PoleViewer poles={this.state.poles} hasAction callback={this.poleInfo.bind(this)} />
                <a onClick={this.addPole.bind(this)}>+ Add Pole</a>
              </div>
            </div>
          </div>
        </div>
        {this.state.showSelectionModal
          ? <GenericModal title='Choose Pole' onClose={this.closeSelectionModal.bind(this)} childComponent={(
            <PoleViewer poles={poleList} hasAction callback={this.assignPole.bind(this)} />
          )} />
         : null}
        {this.state.showInfoModal
          ? <GenericModal title='Pole Information' onClose={this.closeInfoModal.bind(this)} childComponent={(
            <PoleInfo pole={this.state.activePole} callback={this.poleUpdate.bind(this)} cancelAdd={this.closeInfoModal.bind(this)} />
          )} />
         : null}
        {this.state.showRentalModal
          ? <GenericModal title='Rental Information' onClose={this.closeRentalModal.bind(this)} childComponent={
            <RentalInfo rentalData={this.state.activeRental} rental={this.state.activeRental} pole={this.getById(this.state.poles, this.state.activeRental.poleId)} athlete={this.getById(this.state.athletes, this.state.activeRental.athleteId)} onClose={this.closeRentalModal.bind(this)} poleList={this.state.poles} populateData={this.populateData.bind(this)} />
          } />
         : null}
      </section>
    )
  }
}

class RentalInfo extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showSelectionModal: false
    }
  }

  getBoolStr () {
    let yesNoArr = []
    yesNoArr.push(this.props.pole.rented ? 'Y' : 'N')
    yesNoArr.push(this.props.pole.needsTip ? 'Y' : 'N')
    yesNoArr.push(this.props.pole.damaged ? 'Y' : 'N')
    yesNoArr.push(this.props.pole.broken ? 'Y' : 'N')
    yesNoArr.push(this.props.pole.missing ? 'Y' : 'N')
    return yesNoArr.join(', ')
  }

  endRental () {
    if (window.confirm('End Rental?')) {
      apiHelpers.endRental(this.props.rental.id).then(res => {
        if (res.data.ok) {
          window.alert('Rental ended')
          this.props.onClose()
          this.props.populateData()
        } else {
          window.alert('An error occurred, please try again')
        }
      })
    }
  }

  showSelectionModal () {
    this.setState({
      showSelectionModal: true
    })
  }

  closeSelectionModal () {
    this.setState({
      showSelectionModal: false
    })
  }

  removePole () {
    let updatedRental = JSON.parse(JSON.stringify(this.props.rental))
    updatedRental.poleId = null
    let updatedPole = JSON.parse(JSON.stringify(this.props.pole))
    updatedPole.rented = false
    let p1 = apiHelpers.updateRental(updatedRental)
    let p2 = apiHelpers.updatePole(updatedPole)
    Promise.all([p1, p2]).then(responses => {
      if (responses[1].data.ok && responses[0].data.ok) {
        window.alert('Rental updated')
        this.props.onClose()
        this.props.populateData()
      } else {
        window.alert('An error occurred, please try again')
      }
    })
  }

  assignPole (pole) {
    let updatedPole = JSON.parse(JSON.stringify(this.props.pole))
    updatedPole.rented = false
    apiHelpers.updatePole(updatedPole).then(poleRes => {
      if (poleRes.data.ok) {
        let updatedRental = JSON.parse(JSON.stringify(this.props.rental))
        updatedRental.poleId = pole.id
        apiHelpers.updateRental(updatedRental).then(rentalRes => {
          if (rentalRes.data.ok) {
            let rentedPole = JSON.parse(JSON.stringify(pole))
            rentedPole.rented = true
            apiHelpers.updatePole(rentedPole).then(rentedPoleRes => {
              if (rentedPoleRes.data.ok) {
                window.alert('Rental updated')
                this.closeSelectionModal()
                this.props.onClose()
                this.props.populateData()
              } else {
                window.alert('An error occurred, please try again')
              }
            })
          } else {
            window.alert('An error occurred, please try again')
          }
        })
      } else {
        window.alert('An error occurred, please try again')
      }
    })
  }

  render () {
    return (
      <div className='pole-info__container'>
        <div className='pole-info__element'><span className='red-text'>Brand:</span>{this.props.pole.brand}</div>
        <div className='pole-info__element'><span className='red-text'>Length:</span>{this.props.pole.feet + '\'' + this.props.pole.inches + '"'}</div>
        <div className='pole-info__element'><span className='red-text'>Weight:</span>{this.props.pole.weight}</div>
        <div className='pole-info__element'><span className='red-text'>Location:</span>{this.props.pole.location}</div>
        <div className='pole-info__element'><span className='red-text'>R, Nt, D, B, M:</span>{this.getBoolStr()}</div>
        <div className='pole-info__element'><span className='red-text'>Note:</span>{this.props.pole.note}</div>
        <p />
        <div className='pole-info__element'><span className='red-text'>Athlete:</span>{this.props.athlete.firstName + ' ' + this.props.athlete.lastName}</div>
        <div className='pole-info__element'><span className='red-text'>Email:</span>{this.props.athlete.email}</div>
        <div className='pole-info__element'><span className='red-text'>Rental Expiration:</span>{new Date(this.props.rental.expiration).toLocaleDateString('en-US')}</div>

        <div className='pole-info__edit-btns'>
          <div className='red-button' onClick={this.showSelectionModal.bind(this)}>
            <span className='button-text'>Swap</span>
          </div>
          <div className='red-button' onClick={this.removePole.bind(this)}>
            <span className='button-text'>Remove</span>
          </div>
        </div>
        <div className='pole-info__edit-btns'>
          <div className='red-button' onClick={this.endRental.bind(this)}>
            <span className='button-text'>End</span>
          </div>
        </div>
        {this.state.showSelectionModal
          ? <GenericModal title='Choose Pole' onClose={this.closeSelectionModal.bind(this)} childComponent={(
            <PoleViewer poles={this.props.poleList} hasAction callback={this.assignPole.bind(this)} />
          )} />
         : null}
      </div>
    )
  }
}

class PoleInfo extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isEditing: false,
      isNewPole: Object.keys(this.props.pole).length === 0
    }
  }

  getIcon (bool) {
    if (bool) {
      return (<span style={{color: 'green'}} className='glyphicon glyphicon-ok' />)
    } else {
      return (<span style={{color: '#434343'}} className='glyphicon glyphicon-minus' />)
    }
  }

  toggleEdit () {
    if (!this.state.isNewPole) {
      this.setState({
        isEditing: !this.state.isEditing
      })
    } else {
      this.props.cancelAdd()
    }
  }

  submit () {
    let output = apiHelpers.parseFormValues($('#edit-pole-info').serializeArray())
    let bools = ['rented', 'missing', 'broken', 'needsTip', 'damaged']
    bools.forEach(boolKey => {
      output[boolKey] = $('#pole-is-' + boolKey).is(':checked')
    })
    if (this.state.isNewPole) {
      this.submitAdd(output)
    } else {
      this.submitUpdate(output)
    }
  }

  deletePole () {
    if (this.props.pole.rented) {
      window.alert('This pole is currently rented out')
    } else {
      let confirmed = window.confirm('Delete this pole?')
      if (confirmed) {
        apiHelpers.deletePole(this.props.pole.id).then(res => {
          if (res.data) {
            this.props.callback(res.data.ok)
          } else {
            this.props.callback(false)
          }
        })
      }
    }
  }

  submitAdd (output) {
    apiHelpers.addPole(output).then(res => {
      if (res.data) {
        this.props.callback(res.data.ok)
      } else {
        this.props.callback(false)
      }
    })
  }
  submitUpdate (output) {
    let updatedPole = {}
    Object.keys(this.props.pole).forEach(key => {
      updatedPole[key] = output.hasOwnProperty(key) ? output[key] : this.props.pole[key]
    })
    apiHelpers.updatePole(updatedPole).then(res => {
      if (res.data) {
        this.props.callback(res.data.ok)
      } else {
        this.props.callback(false)
      }
    })
  }

  render () {
    if (this.state.isEditing || this.state.isNewPole) {
      return (
        <div className='pole-info__container'>
          <form id='edit-pole-info'>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Brand:</span>
                <input type='text' name='brand' style={{marginLeft: '16px'}} defaultValue={this.props.pole.brand} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Feet:</span>
                <input type='text' name='feet' style={{marginLeft: '16px'}} defaultValue={this.props.pole.feet} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Inches:</span>
                <input type='text' name='inches' style={{marginLeft: '16px'}} defaultValue={this.props.pole.inches} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Weight:</span>
                <input type='text' name='weight' style={{marginLeft: '16px'}} defaultValue={this.props.pole.weight} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Location:</span>
                <input type='text' name='location' style={{marginLeft: '16px'}} defaultValue={this.props.pole.location} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Rented:</span>
                <input type='checkbox' id='pole-is-rented' defaultChecked={this.props.pole.rented} disabled />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Needs Tip:</span>
                <input type='checkbox' id='pole-is-needsTip' defaultChecked={this.props.pole.needsTip} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Damaged:</span>
                <input type='checkbox' id='pole-is-damaged' defaultChecked={this.props.pole.damaged} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Broken:</span>
                <input type='checkbox' id='pole-is-broken' defaultChecked={this.props.pole.broken} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Missing:</span>
                <input type='checkbox' id='pole-is-missing' defaultChecked={this.props.pole.missing} />
              </label>
            </div>
            <div className='form-row'>
              <label className='pole-info__edit-form'>
                <span>Note:</span>
                <input type='text' name='note' style={{marginLeft: '16px'}} defaultValue={this.props.pole.note} />
              </label>
            </div>
          </form>
          <div className='pole-info__edit-btns'>
            <div className='red-button' onClick={this.toggleEdit.bind(this)}>
              <span className='button-text'>Cancel</span>
            </div>
            <div className='red-button' onClick={this.submit.bind(this)}>
              <span className='button-text'>Submit</span>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className='pole-info__container'>
          <div className='pole-info__element'><span className='red-text'>Brand:</span>{this.props.pole.brand}</div>
          <div className='pole-info__element'><span className='red-text'>Feet:</span>{this.props.pole.feet}</div>
          <div className='pole-info__element'><span className='red-text'>Inches:</span>{this.props.pole.inches}</div>
          <div className='pole-info__element'><span className='red-text'>Weight:</span>{this.props.pole.weight}</div>
          <div className='pole-info__element'><span className='red-text'>Location:</span>{this.props.pole.location}</div>
          <div className='pole-info__element'><span className='red-text'>Rented:</span>{this.getIcon(this.props.pole.rented)}</div>
          <div className='pole-info__element'><span className='red-text'>Needs Tip:</span>{this.getIcon(this.props.pole.needsTip)}</div>
          <div className='pole-info__element'><span className='red-text'>Damaged:</span>{this.getIcon(this.props.pole.damaged)}</div>
          <div className='pole-info__element'><span className='red-text'>Broken:</span>{this.getIcon(this.props.pole.broken)}</div>
          <div className='pole-info__element'><span className='red-text'>Missing:</span>{this.getIcon(this.props.pole.missing)}</div>
          <div className='pole-info__element'><span className='red-text'>Note:</span>{this.props.pole.note}</div>

          <div className='pole-info__edit-btns'>
            <div className='red-button' onClick={this.toggleEdit.bind(this)}>
              <span className='button-text'>Edit</span>
            </div>
            <div className='red-button' onClick={this.deletePole.bind(this)}>
              <span className='button-text'>Delete</span>
            </div>
          </div>
        </div>
      )
    }
  }
}

class PoleViewer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      sortBy: '',
      reverse: false,
      poles: this.props.poles
    }
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      sortBy: '',
      reverse: false,
      poles: newProps.poles
    })
  }

  sortBy (sortBy) {
    let reverse = this.state.reverse
    if (this.state.sortBy === sortBy) {
      reverse = !reverse
      this.setState({reverse})
    } else {
      this.setState({sortBy})
    }

    let poleList = this.state.poles.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      let reverseVal = reverse ? -1 : 1
      if (sortBy === 'length') {
        aVal = a.feet + (a.inches / 12)
        bVal = b.feet + (b.inches / 12)
      }
      if (aVal < bVal) {
        return reverseVal * -1
      } else if (aVal > bVal) {
        return reverseVal * 1
      } else {
        return 0
      }
    })

    this.setState({
      poles: poleList
    })
  }

  getRowClass (pole) {
    if (pole.missing) {
      return 'pole-viewer__missing'
    } else if (pole.broken) {
      return 'pole-viewer__broken'
    } else if (pole.rented) {
      return 'pole-viewer__rented'
    } else if (pole.needsTip) {
      return 'pole-viewer__needs-tip'
    } else if (pole.damaged) {
      return 'pole-viewer__damaged'
    } else {
      return 'pole-viewer__pole'
    }
  }

  render () {
    return (
      <div className='pole-viewer__container'>
        <table>
          <thead>
            <tr>
              <th onClick={() => { this.sortBy('brand') }}>Brand</th>
              <th onClick={() => { this.sortBy('length') }}>Length</th>
              <th onClick={() => { this.sortBy('weight') }}>Weight</th>
              {this.props.hasAction ? (<th>More</th>) : null}
            </tr>
          </thead>
          <tbody>
            {this.state.poles.map(pole => {
              return (
                <tr key={pole.id} className={this.getRowClass(pole)}>
                  <td>{pole.brand}</td>
                  <td>{pole.feet + '\'' + pole.inches + '"'}</td>
                  <td>{pole.weight}</td>
                  {this.props.hasAction ? (<td onClick={() => { this.props.callback(pole) }}><span className='glyphicon glyphicon-chevron-right' /></td>) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

class PoleRequest extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      dateDisplay: new Date(this.props.request.expiration).toLocaleDateString('en-US')
    }
  }

  callback () {
    this.props.callback(this.props.request)
  }

  render () {
    return (
      <div className='pole-request__row'>
        <span className='pole-request__item'>
          Athlete: {this.props.athlete}
        </span>
        <span className='pole-request__item'>
          Until: {this.state.dateDisplay}
        </span>
        <span className='pole-request__item'>
          <a onClick={this.callback.bind(this)}>
            Fill
          </a>
        </span>
      </div>
    )
  }
}

export default PoleApp
