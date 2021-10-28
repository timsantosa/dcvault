import React from 'react'
import apiHelpers from './api-helpers'
const $ = window.$

const parseFormValues = apiHelpers.parseFormValues

class Register extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentPage: '',
      pageNum: 0,
      data: {},
      showBar: false,
      registrationOpen: false
    }
  }

  advance (page, info) {
    let updatedData = this.state.data
    let newPageNum = this.state.pageNum + 1
    updatedData[page] = info
    this.setState({
      pageNum: newPageNum,
      data: updatedData
    })

    if (newPageNum === 2) {
      this.setState({
        currentPage: (<AthleteInfo advance={this.advance.bind(this)} />)
      })
    } else if (newPageNum === 3) {
      this.setState({
        currentPage: (<Agreement advance={this.advance.bind(this)} />)
      })
    } else if (newPageNum === 4) {
      this.setState({
        currentPage: (<Payment advance={this.advance.bind(this)} data={this.state.data} />)
      })
    } else if (newPageNum === 5) {
      this.setState({
        currentPage: (<Confirmation advance={this.advance.bind(this)} data={this.state.data} />)
      })
    }

    this.forceUpdate()
  }

  componentDidMount () {
    this.isLoggedIn()

    // let today = new Date()
    // let month = today.getMonth() + 1
    // let day = today.getDate()

    // let registrationOpen = false

    // let startMonths = [11, 2, 5, 8]
    // let activeMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    // if ((day >= 15 && startMonths.indexOf(month) !== -1) || activeMonths.indexOf(month) !== -1) {
    //   registrationOpen = true
    // }

    this.setState({
      registrationOpen: true
    })
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
        this.setState({
          currentPage: (<SelectPackage advance={this.advance.bind(this)} />),
          pageNum: 1,
          showBar: true
        })
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1
          loginDiv.style.visibility = 'visible'
        }
        this.setState({
          currentPage: (
            <div className='row'>
              <div className='col-xs-12' style={{textAlign: 'center'}}>
                <p className=''>You Must be Logged in to <span className='red-text'>Register for Training</span></p>
                <a className='red-text center-content' onClick={() => { loginButton.click() }}>Login/Register</a>
              </div>
            </div>
          )
        })
      }
    })
  }

  render () {
    window.scrollTo(0, 0)
    let progressBar = this.state.showBar ? (<ProgressBar pageNum={this.state.pageNum} />) : ''
    if (this.state.registrationOpen) {
      return (
        <section id='register'>
          <div className='containter'>
            <div className='row'>
              <div className='col-xs-12 col-md-6 col-md-push-3'>
                <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}><span className='red-text'>Private Lessons</span> or available <span className='red-text'>Discounts</span>, please <a className='red-text' onClick={() => { document.getElementById('contact-button').click() }}>click here</a> to contact us.</p>
              </div>
            </div>
            {this.state.currentPage}
            {progressBar}

          </div>
        </section>
      )
    } else {
      return (
        <section style={{minHeight: '90vh'}}>
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-md-6 col-md-push-3'>
                <p className='section-header'><span className='red-text'>DC Vault</span> Registration</p>
                <p className='content-text intro-text' style={{textAlign: 'justify'}}>Registration for training will re-open <span className='red-text'>15 days prior</span> to the start of the upcoming quarter. A <span className='red-text'>$25 late fee</span> will be applied if registration occurs after the start of a given quarter. Please check back later to register for training, and don't hesitate to <a className='red-text' onClick={() => { document.getElementById('contact-button').click() }}>contact us</a> if you have any questions. <span className='red-text'>Thank you</span>.</p>
                <p className='content-text intro-text' style={{textAlign: 'right'}}>- DC <span className='red-text'>Vault</span></p>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }
}

class SelectPackage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      errorText: '',
      showYouthAdult: true,
      youthAdult: false,
      checkedGroup: null,
      checkedSession: null,
      checkedFacility: null,
      checkedMonth:null,
      checkedMembership: null,
      checkedFKMembership: null,
      checkedYesApparel: null,
      checkedStrength: 'none',
      showInvite: false,
      showEmergingElite: false,
      showElite: false,
      showProfessional: false,
      inviteCode: null,
      quarters: [
        {name: 'Summer', value: 'summer'},
        {name: 'Fall', value: 'fall'},
        {name: 'Winter', value: 'winter'},
        {name: 'Spring', value: 'spring'}
      ],
      activeQuarter: '',
      availableFacilities: {
        dcv: true,
        va: true,
        pa: true,
        prep: true
      }
    }
  }

  continue () {
    this.setState({
      errorText: ''
    })

    let output = {}

    output.quarter = $('input[name="quarter"]:checked').val()
    output.group = $('input[name="group"]:checked').val()
    output.facility = $('input[name="facility"]:checked').val()
    output.apparel = $('input[name="apparel"]:checked').val()
    output.strength = $('input[name="strength"]:checked').val()
    output.month = $('input[name="month"]:checked').val()
    output.membership = $('input[name="membership"]:checked').val()
    output.fkmembership = $('input[name="fkmembership"]:checked').val()
    output.yesApparel = $('input[name="yesapparel"]:checked').val()
    if (this.state.inviteCode) {
      output.invite = this.state.inviteCode
    }

    if (output.quarter === undefined || output.group === undefined || output.facility === undefined || output.yesApparel === undefined) {
      this.setState({
        errorText: 'Please fill in all required fields'
      })
    } else {
      console.log(output)
      this.props.advance('selectPackage', output)
    }
  }

  componentDidMount () {
    let today = new Date()
    let month = today.getMonth() + 1
    let day = today.getDate()
    let activeQuarter = ''
    console.log(month)
    if (month === 11 || month === 12 || month === 1 || month === 2) {
      activeQuarter = 'winter'
      this.setState({
        showYouthAdult: false
      })
    }

    if ((month === 2 && day >= 5) || month === 3 || month === 4 || month === 5) {
      activeQuarter = 'spring'
    }

    if ((month === 5 && day >= 5) || month === 6 || month === 7 || month === 8) {
      activeQuarter = 'summer'
    }

    if ((month === 8 && day >= 5) || month === 9 || month === 10) {
      activeQuarter = 'fall'
    }

    this.setState({
      activeQuarter: activeQuarter
    })
  }

  // fillInfo() {
  //   this.props.advance ('selectPackage', {quarter: 'fall', group: 'beginner', facility: 'dcv'});
  // }

  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>

  adjustOptions () {
    let group = $('input[name="group"]:checked').val()
    let quarter = $('input[name="quarter"]:checked').val()
    let facility = $('input[name="facility"]:checked').val()
    let month = $('input[name="month"]:checked').val()
    let membership = $('input[name="membership"]:checked').val()
    let fkmembership = $('input[name="fkmembership"]:checked').val()
    let strength = $('input[name="strength"]:checked').val()
    let yesApparel = $('input[name="yesapparel"]:checked').val()
    this.setState({
      checkedGroup: group,
      checkedSession: quarter,
      checkedFacility: facility,
      checkedMonth: month,
      checkedMembership: membership,
      checkedStrength: strength,
      checkedFKMembership: fkmembership,
      checkedYesApparel: yesApparel
    })

      /*
      This section is to determine what facilities are available for each quarter
       */
    if (quarter === 'winter' && (group === 'beginner-intermediate' || group === 'youth' || group === 'adult')) {
      this.setState({
        availableFacilities: {
          dcv: false,
          va: true,
          pa: false,
          prep: false
        }
      })
    } else if (quarter === 'spring') {
      if (group === 'fly-kids'){
        this.setState({
          availableFacilities: {
            dcv: true,
            va: false,
            pa: false,
            prep: false
          }
        })
      }else {
        this.setState({
          availableFacilities: {
            dcv: true,
            va: false,
            pa: false,
            prep: false
          }
        })
      }
    } else {
      this.setState({
        availableFacilities: {
          dcv: true,
          va: false,
          pa: false,
          prep: false
        }
      })
    }
  }

  toggleInvite () {
    let show = this.state.showInvite
    this.setState({
      showInvite: !show
    })
  }

  applyInvite () {
    this.setState({
      errorText: ''
    })
    let code = this.refs.inviteBox.value

    if (code.length === 0) {
      this.setState({
        errorText: 'You did not enter a code'
      })
    } else {
      apiHelpers.applyInvite(code)
      .then((response) => {
        let info = response.data
        if (!info || !info.ok) {
          this.setState({
            errorText: 'Invalid or Expired Code'
          })
        } else {
          let level = info.invite.level
          this.setState({
            inviteCode: code
          })

          if (level === 3) {
            this.setState({
              showEmergingElite: true
            })
          } else if (level === 4) {
            this.setState({
              showElite: true
            })
          } else if (level === 5) {
            this.setState({
              showProfessional: true
            })
          } else {
            this.setState({
              errorText: 'There is an error with this code. Please contact it@dcvault.org'
            })
          }
        }
      })
    }
  }

  /*
                <div>
                  <label>
                    <input type='radio' name='group' value='intermediate' checked={this.state.checkedGroup === 'intermediate'} onChange={this.adjustOptions.bind(this)} />
                    <span>Intermediate (Level II)</span>
                  </label>
                </div>
  */

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
        <div className='error-container'>
          <p>{this.state.errorText}</p>
        </div>
      </div>
    }
    return (
    /*
    To manually change what quarters are available to sign up for change the <div style = {{display: 'x'}}>
    line to either block or none. block will show the option as available and none will hide it
     */

      <div className='row'>
        <div className='col-xs-12' style={{textAlign: 'center'}}>
          <form id='select-package' className='form-labels-on-top'>



            <div className='form-row'>
              <label><span className='required'>Training Session</span></label>
              <div className='form-radio-buttons'>
                <div style={{display: 'none'}}>
                  <label>
                    <input type='radio' name='quarter' value='summer' checked={this.state.checkedSession === 'summer'} onChange={this.adjustOptions.bind(this)} />
                    <span>Summer</span>
                  </label>
                </div>
                <div style={{display: 'none'}}>
                  <label>
                    <input type='radio' name='quarter' value='fall' checked={this.state.checkedSession === 'fall'} onChange={this.adjustOptions.bind(this)} />
                    <span>Fall</span>
                  </label>
                </div>
                <div style={{display: 'none'}}>
                  <label>
                    <input type='radio' name='quarter' value='winter' checked={this.state.checkedSession === 'winter'} onChange={this.adjustOptions.bind(this)} />
                    <span>Winter</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='quarter' value='spring' checked={this.state.checkedSession === 'spring'} onChange={this.adjustOptions.bind(this)} />
                    <span>Spring</span>
                  </label>
                </div>
              </div>
            </div>

            <div className='form-row' style={{display: this.state.checkedSession ? 'block' : 'none'}}>
              <label><span className='required'>Training Group</span></label>
              <div className='form-radio-buttons'>
                <div style={{display:'block'}}>
                  <label>
                    <input type='radio' name='group' value='fly-kids' checked={this.state.checkedGroup === 'fly-kids'} onChange={this.adjustOptions.bind(this)} />
                    <span>Fly-Kids (6-10)</span>
                  </label>
                </div>
                <div style={{display:'block'}} >
                  <label>
                    <input type='radio' name='group' value='adult' checked={this.state.checkedGroup === 'adult'} onChange={this.adjustOptions.bind(this)} />
                    <span>Adult (21+)</span>
                  </label>
                </div>
                <div>
                  <label>
                    <input type='radio' name='group' value='beginner-intermediate' checked={this.state.checkedGroup === 'beginner-intermediate'} onChange={this.adjustOptions.bind(this)} />
                    <span>All Ages</span>
                  </label>
                </div>
                <div style={{display: this.state.showEmergingElite ? 'block' : 'none'}}>
                  <label>
                    <input type='radio' name='group' value='emerging-elite' checked={this.state.checkedGroup === 'emerging-elite'} onChange={this.adjustOptions.bind(this)} />
                    <span>Emerging Elite (Level III)</span>
                  </label>
                </div>
                <div style={{display: this.state.showElite ? 'block' : 'none'}}>
                  <label>
                    <input type='radio' name='group' value='elite' checked={this.state.checkedGroup === 'elite'} onChange={this.adjustOptions.bind(this)} />
                    <span>Elite (Level IV)</span>
                  </label>
                </div>
                <div style={{display: this.state.showProfessional ? 'block' : 'none'}}>
                  <label>
                    <input type='radio' name='group' value='professional' checked={this.state.checkedGroup === 'professional'} onChange={this.adjustOptions.bind(this)} />
                    <span>Professional (Level V)</span>
                  </label>
                </div>
              </div>
              <div>
                <a style={{color: '#C0282D'}} onClick={this.toggleInvite.bind(this)}> Elite Training Invite Code </a>
                <div className='form-row' style={{display: this.state.showInvite ? 'block' : 'none'}}>
                  <div className='row'>
                    <div className='col-xs-8'>
                      <label>
                        <span>Invite Code</span>
                        <input ref='inviteBox' type='text' name='invite' style={{width: '100%'}} />
                      </label>
                    </div>
                    <div className='col-xs-4'>
                      <button type='button' onClick={this.applyInvite.bind(this)}>Apply</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>



            <div className='form-row' style={{display: this.state.checkedGroup && ((this.state.checkedGroup === 'beginner-intermediate'))? 'block' : 'none'}}>
              <label><span>Membership Level</span></label>
              <div className='form-radio-buttons'>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='membership' value='basic' checked={this.state.checkedMembership === 'basic'} onChange={this.adjustOptions.bind(this)} />
                    <span>Basic (one month)</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='membership' value='apprentice' checked={this.state.checkedMembership === 'apprentice'} onChange={this.adjustOptions.bind(this)} />
                    <span>Apprentice (Full Quarter)</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='membership' value='master' checked={this.state.checkedMembership === 'master'} onChange={this.adjustOptions.bind(this)} />
                    <span>Master (Full Quarter)</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='membership' value='champion' checked={this.state.checkedMembership === 'champion'} onChange={this.adjustOptions.bind(this)} />
                    <span>Champion (Full Quarter)</span>
                  </label>
                </div>
              </div>
            </div>






            <div className='form-row' style={{display: this.state.checkedGroup && (this.state.checkedMembership ==='basic')? 'block' : 'none'}}>
              <label><span>Month</span></label>
              <div className='form-radio-buttons'>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='month' value='mar' checked={this.state.checkedMonth === 'mar'} onChange={this.adjustOptions.bind(this)} />
                    <span>March</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='month' value='apr' checked={this.state.checkedMonth === 'apr'} onChange={this.adjustOptions.bind(this)} />
                    <span>April</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='month' value='may' checked={this.state.checkedMonth === 'may'} onChange={this.adjustOptions.bind(this)} />
                    <span>May</span>
                  </label>
                </div>
              </div>
            </div>

            <div className='form-row' style={{display: this.state.checkedGroup && (this.state.checkedGroup === 'fly-kids')? 'block' : 'none'}}>
              <label><span>Fly-Kids Options</span></label>
              <div className='form-radio-buttons'>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='fkmembership' value='5classes' checked={this.state.checkedFKMembership === '5classes'} onChange={this.adjustOptions.bind(this)} />
                    <span>5 Classes ($150)</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='fkmembership' value='10classes' checked={this.state.checkedFKMembership === '10classes'} onChange={this.adjustOptions.bind(this)} />
                    <span>10 Classes ($275)</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='fkmembership' value='20classes' checked={this.state.checkedFKMembership === '20classes'} onChange={this.adjustOptions.bind(this)} />
                    <span>20 Classes ($475)</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='fkmembership' value='25classes' checked={this.state.checkedFKMembership === '25classes'} onChange={this.adjustOptions.bind(this)} />
                    <span>25 Classes ($550)</span>
                  </label>
                </div>
              </div>
            </div>



            <div className='form-row' style={{display: this.state.checkedMonth || this.state.checkedFKMembership || this.state.checkedGroup === 'adult' || this.state.checkedMembership ==='apprentice' || this.state.checkedMembership === 'master' || this.state.checkedMembership === 'champion' || this.state.checkedGroup === 'emerging-elite' || this.state.checkedGroup === 'elite' || this.state.checkedGroup === 'professional'? 'block' : 'none'}}>
              <label><span className='required'>Training Facility</span></label>
              <div className='form-radio-buttons'>
                <div style={{display: this.state.availableFacilities.dcv ? 'block' : 'none'}}>
                  <label>
                    <input type='radio' name='facility' value='dcv' checked={this.state.checkedFacility === 'dcv'} onChange={this.adjustOptions.bind(this)}/>
                    <span>Washington, DC (DCV)</span>
                  </label>
                </div>
                <div style={{display: this.state.availableFacilities.va ? 'block' : 'none'}}>
                  <label>
                    <input type='radio' name='facility' value='va' checked={this.state.checkedFacility === 'va'} onChange={this.adjustOptions.bind(this)}/>
                    <span>Virginia (VA)</span>
                  </label>
                </div>
                <div style={{display: this.state.availableFacilities.prep ? 'block' : 'none'}}>
                  <label>
                    <input type='radio' name='facility' value='prep' checked={this.state.checkedFacility === 'prep'} onChange={this.adjustOptions.bind(this)}/>
                    <span>North Bethesda, MD (PREP)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className='form-row' style={{display: this.state.checkedFacility  && (this.state.checkedGroup !== 'fly-kids') && (this.state.checkedGroup !== 'adult') && (this.state.checkedMembership !== 'basic') && (this.state.checkedMembership !== 'apprentice')? 'block' : 'none'}}>
              <label><span>Strength Training</span></label>
              <br/>
              <span style = {{fontSize: 12, textAlign: 'center', fontWeight: 'normal'}}>Would you like to sign up for the DC Vault Strength Training Program for $100? </span>
              <br/><br/>

              <div className='form-radio-buttons'>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='strength' value='none' checked={this.state.checkedStrength === 'none'} onChange={this.adjustOptions.bind(this)}/>
                    <span>No Thanks</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='strength' value='yes' checked={this.state.checkedStrength === 'yes'} onChange={this.adjustOptions.bind(this)}/>
                    <span>Yes!</span>
                  </label>
                </div>
              </div>


            </div>


            <div className='form-row' style={{display: this.state.checkedFacility? 'block' : 'none'}}>

              <label><span className='required'>Apparel</span></label>
              <br/>
              <span style = {{fontSize: 12, textAlign: 'center', fontWeight: 'normal'}}>Would you like team apparel? DC Vault T-shirts can be purchased for an additional $20. </span>
              <br/><br/>
              <img className='apparel-img' src='../img/forms/apparel.jpg' width='100%' height='auto'/>
              <br/><br/><br/>
              <div className='form-radio-buttons'>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='yesapparel' value='none' checked={this.state.checkedYesApparel === 'none'} onChange={this.adjustOptions.bind(this)}/>
                    <span>No Thanks</span>
                  </label>
                </div>
                <div style={{display: 'block'}}>
                  <label>
                    <input type='radio' name='yesapparel' value='yes' checked={this.state.checkedYesApparel === 'yes'} onChange={this.adjustOptions.bind(this)}/>
                    <span>Yes!</span>
                  </label>
                </div>
              </div>
              <div className='form-radio-buttons' style={{display: this.state.checkedYesApparel === 'yes'? 'block' : 'none'}}>
                <span style={{fontWeight:'normal'}}><i>Youth</i></span>
                <div>
                  <label>
                    <input type='radio' name='apparel' value='yxs' />
                    <span>XS</span>
                  </label>
                </div>

                <span style={{fontWeight:'normal'}}><i>Unisex</i></span>
                <div>
                  <label>
                    <input type='radio' name='apparel' value='xs' />
                    <span>XS</span>
                  </label>
                </div>
                <div>
                  <label>
                    <input type='radio' name='apparel' value='sm' />
                    <span>S</span>
                  </label>
                </div>
                <div>
                  <label>
                    <input type='radio' name='apparel' value='md' />
                    <span>M</span>
                  </label>
                </div>
                <div>
                  <label>
                    <input type='radio' name='apparel' value='lg' />
                    <span>L</span>
                  </label>
                </div>
              </div>











            </div>


            <div className='form-row'>
              <button type='button' onClick={this.continue.bind(this)}>Continue</button>
            </div>
            {errorContainer}

          </form>
        </div>
      </div>
    )
  }
}

class AthleteInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      errorText: [],
      showUSATFinfo: false
    }
  }

  formatDOB () {
    let dob = $('input[name=dob]').val()
    let dobFormatted = apiHelpers.formatDate(dob)
    $('input[name=dob]').val(dobFormatted)
    // $('input[name=dob]').setSelectionRange(dobFormatted.length, dobFormatted.length);
  }

  formatPhone () {
    let phoneFormatted = apiHelpers.formatPhone($('input[name=emergency-phone]').val())
    $('input[name=emergency-phone]').val(phoneFormatted)
    // $('input[name=emergency-phone]').setSelectionRange(phoneFormatted.length, phoneFormatted.length);
  }

  formatUSATF () {
    let usatf = $('input[name=usatf]').val().split('')
    let usatfFormatted = []
    for (let digit of usatf) {
      if (('0123456789').indexOf(digit) !== -1) {
        usatfFormatted.push(digit)
      }
    }
    $('input[name=usatf]').val(usatfFormatted.slice(0, 10).join(''))
  }

  continue () {
    this.setState({
      errorText: []
    })

    let required = ['fname', 'lname', 'email', 'dob', 'usatf', 'emergency-contact', 'emergency-phone', 'emergency-relation', 'gender', 'state', 'conditions']
    let complete = true

    let output = parseFormValues($('#athlete-info').serializeArray())

    if (output.email.length !== 0 && !apiHelpers.validateEmail(output.email)) {
      let errorText = this.state.errorText
      errorText.push('Please provide a valid email address')
      this.setState({
        errorText: errorText
      })
      complete = false
    }

    if (output.usatf.length !== 0 && output.usatf.length !== 10) {
      let errorText = this.state.errorText
      errorText.push('Please provide a valid USATF membership number')
      this.setState({
        errorText: errorText
      })
      complete = false
    }

    if (output.dob.length !== 0 && output.dob.length !== 10) {
      let errorText = this.state.errorText
      errorText.push('Please provide a valid date of birth (MM/DD/YYYY)')
      this.setState({
        errorText: errorText
      })
      complete = false
    }

    if (output['emergency-phone'].length !== 0 && output['emergency-phone'].length !== 12) {
      let errorText = this.state.errorText
      errorText.push('Please provide a valid emergency contact phone number')
      this.setState({
        errorText: errorText
      })
      complete = false
    }

    for (let field of required) {
      if (output[field].length === 0) {
        let errorText = this.state.errorText
        errorText.push('Please fill in all required fields')
        this.setState({
          errorText: errorText
        })
        complete = false
        break
      }
    }

    if (complete) {
      this.props.advance('athleteInfo', output)
    }
  }

  // fillInfo() {
  //   let output = {
  //     conditions: 'Medical Conditions',
  //     dob: "07/12/1994",
  //     email: "moores.alexd@gmail.com",
  //     fname: "Alex",
  //     gender: "male",
  //     lname: "Moores",
  //     school: "school",
  //     state: "ME",
  //     usatf: "6546545645"
  //   }
  //   output['emergency-contact'] = 'Emergency Contact Name';
  //   output['emergency-phone'] = '555-555-5555';
  //   output['emergency-relation'] = 'Emergency Contact Relationship';

  //   this.props.advance('athleteInfo', output);
  // }
  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>

  toggleUSATFinfo () {
    let current = this.state.showUSATFinfo
    this.setState({
      showUSATFinfo: !current
    })
  }

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
        <div className='error-container'>
          {this.state.errorText.map((error) => {
            return <p key={error}>{error}</p>
          })}
        </div>
      </div>
    }

    return (
      <div className='row'>
        <div className='col-xs-12' style={{textAlign: 'center'}}>
          <form id='athlete-info' className='form-labels-on-top'>

            <div className='form-title-row'>
              <h1>Athlete Information</h1>
            </div>

            <div className='row'>
              <div className='col-xs-12 col-md-6'>
                <div className='form-row'>
                  <label>
                    <span className='required'>Athlete First Name</span>
                    <input type='text' name='fname' style={{width: '100%'}} />
                  </label>
                </div>
              </div>

              <div className='col-xs-12 col-md-6'>
                <div className='form-row'>
                  <label>
                    <span className='required'>Athlete Last Name</span>
                    <input type='text' name='lname' style={{width: '100%'}} />
                  </label>
                </div>
              </div>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Athlete DOB (mm/dd/yyyy)</span>
                <input type='text' name='dob' onChange={this.formatDOB.bind(this)} />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Athlete Email</span>
                <input type='text' name='email' />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Notification Email (for announcements, schedule adjustments, etc.) </span>
                <input type='text' name='lstserv' />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <div className='row'>
                  <div className='col-xs-10'>
                    <span className='required'>Athlete USATF Number</span>
                  </div>
                  <div className='col-xs-2'>
                    <span onClick={this.toggleUSATFinfo.bind(this)} style={{color: '#C0282D'}}>?</span>
                  </div>
                </div>
                <p className='info-text' style={{display: this.state.showUSATFinfo ? 'block' : 'none'}}>
                        We are sanctioned by USATF. As such, our participants need a current USATF membership ($30 for 1-year). If you have a current number, but do not know it, you can look it up <a style={{color: '#C0282D'}} target='_blank' href='https://www.usatf.org/membership/help/number.asp'>here</a>. If you do not have a current number, you can join or renew <a style={{color: '#C0282D'}} target='_blank' href='http://www.usatf.org/Products---Services/Individual-Memberships.aspx'>here</a>.
                      </p>
                <input type='text' name='usatf' onChange={this.formatUSATF.bind(this)} />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Emergency Contact Name</span>
                <input type='text' name='emergency-contact' />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Emergency Contact Relation</span>
                <input type='text' name='emergency-relation' />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Emergency Contact Phone</span>
                <input type='text' name='emergency-phone' onChange={this.formatPhone.bind(this)} />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Athlete Gender</span>
                <select name='gender'>
                  <option value=''>Select Gender</option>
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                  <option value='other'>Other/Non-Binary</option>
                </select>
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>State of Residence</span>
                <select name='state'>
                  <option value=''>Select State</option>
                  <option value='AL'>Alabama</option>
                  <option value='AK'>Alaska</option>
                  <option value='AZ'>Arizona</option>
                  <option value='AR'>Arkansas</option>
                  <option value='CA'>California</option>
                  <option value='CO'>Colorado</option>
                  <option value='CT'>Connecticut</option>
                  <option value='DE'>Delaware</option>
                  <option value='DC'>Dist of Columbia</option>
                  <option value='FL'>Florida</option>
                  <option value='GA'>Georgia</option>
                  <option value='HI'>Hawaii</option>
                  <option value='ID'>Idaho</option>
                  <option value='IL'>Illinois</option>
                  <option value='IN'>Indiana</option>
                  <option value='IA'>Iowa</option>
                  <option value='KS'>Kansas</option>
                  <option value='KY'>Kentucky</option>
                  <option value='LA'>Louisiana</option>
                  <option value='ME'>Maine</option>
                  <option value='MD'>Maryland</option>
                  <option value='MA'>Massachusetts</option>
                  <option value='MI'>Michigan</option>
                  <option value='MN'>Minnesota</option>
                  <option value='MS'>Mississippi</option>
                  <option value='MO'>Missouri</option>
                  <option value='MT'>Montana</option>
                  <option value='NE'>Nebraska</option>
                  <option value='NV'>Nevada</option>
                  <option value='NH'>New Hampshire</option>
                  <option value='NJ'>New Jersey</option>
                  <option value='NM'>New Mexico</option>
                  <option value='NY'>New York</option>
                  <option value='NC'>North Carolina</option>
                  <option value='ND'>North Dakota</option>
                  <option value='OH'>Ohio</option>
                  <option value='OK'>Oklahoma</option>
                  <option value='OR'>Oregon</option>
                  <option value='PA'>Pennsylvania</option>
                  <option value='RI'>Rhode Island</option>
                  <option value='SC'>South Carolina</option>
                  <option value='SD'>South Dakota</option>
                  <option value='TN'>Tennessee</option>
                  <option value='TX'>Texas</option>
                  <option value='UT'>Utah</option>
                  <option value='VT'>Vermont</option>
                  <option value='VA'>Virginia</option>
                  <option value='WA'>Washington</option>
                  <option value='WV'>West Virginia</option>
                  <option value='WI'>Wisconsin</option>
                  <option value='WY'>Wyoming</option>
                </select>
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span>Current School (optional)</span>
                <input type='text' name='school' />
              </label>
            </div>

            <div className='form-row'>
              <label>
                <span className='required'>Medical Conditions</span>
                <span style={{textSize: '75%', fontWeight: 'normal'}}> If none, write 'none' </span>
                <textarea rows='6' cols='40' name='conditions' />
              </label>
            </div>

            {errorContainer}

            <div className='form-row'>
              <button type='button' onClick={this.continue.bind(this)}>Continue</button>
            </div>

          </form>
        </div>
      </div>
    )
  }
}

class Agreement extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      errorText: ''
    }
  }

  formatDate () {
    let date = $('input[name=date]').val()
    let dateFormatted = apiHelpers.formatDate(date)
    $('input[name=date]').val(dateFormatted)
  }

  componentDidMount () {
    let today = new Date()
    let year = today.getFullYear()
    let day = today.getDate()
    let month = today.getMonth() + 1
    if (day < 10) {
      day = '0' + day
    }
    if (month < 10) {
      month = '0' + month
    }

    $('input[name=date]').val(month + '/' + day + '/' + year)
  }

  continue () {
    this.setState({
      errorText: ''
    })

    let output = parseFormValues($('#agreement').serializeArray())

    if (!output.hasOwnProperty('name') || !output.hasOwnProperty('date')) {
      this.setState({
        errorText: 'Please fill in all fields'
      })
    } else if (output.date.length !== 10) {
      this.setState({
        errorText: 'Please input a valid date'
      })
    } else {
      this.props.advance('agreement', output)
    }
  }

  // fillInfo() {
  //   this.props.advance('agreement', {name: 'Signatory Jones', date: '01/23/2562'});
  // }

  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
        <div className='error-container'>
          <p>{this.state.errorText}</p>
        </div>
      </div>
    }

    return (
      <div className='row'>
        <div className='col-xs-12' style={{textAlign: 'center'}}>
          <form id='agreement' className='form-labels-on-top'>
            <div className='form-title-row'>
              <h1>Waiver Agreement</h1>
            </div>

              <img className='waiver-image' src='../img/forms/adult-comp-1.png' />
              <img className='waiver-image' src='../img/forms/adult-comp-2.png' />
              <img className='waiver-image' src='../img/forms/adult-comp-3.png' />
              <img className='waiver-image' src='../img/forms/youth-comp-1.png' />
              <img className='waiver-image' src='../img/forms/youth-comp-2.png' />
              <img className='waiver-image' src='../img/forms/youth-comp-3.png' />

            <p style={{fontSize: '12px', fontWeight: 'normal'}}> By signing below and clicking 'continue' you agree that you (the adult athlete or the athlete's legal guardian) agree with the above waivers. You may <a style={{color: '#C0282D'}} href='../files/DC Vault Waiver - Competition.pdf' target='_blank'>click here</a> to view the waivers as a PDF</p>

            <div className='row'>
              <div className='col-xs-12 col-md-6'>
                <div className='form-row'>
                  <label>
                    <span className='required'>Full Name</span>
                    <input type='text' name='name' style={{width: '100%'}} />
                  </label>
                </div>
              </div>

              <div className='col-xs-12 col-md-6'>
                <div className='form-row'>
                  <label>
                    <span className='required'>Date (mm/dd/yyyy)</span>
                    <input type='text' name='date' style={{width: '100%'}} onChange={this.formatDate.bind(this)} />
                  </label>
                </div>
              </div>
            </div>

            {errorContainer}

            <div className='form-row'>
              <button type='button' onClick={this.continue.bind(this)}>Continue</button>
            </div>

          </form>
        </div>
      </div>
    )
  }
}

class Payment extends React.Component {
  constructor (props) {
    super(props)
    let price
    let group = this.props.data.selectPackage.group
    let membership = this.props.data.selectPackage.membership
    let fkmembership = this.props.data.selectPackage.fkmembership

    // if the membership is fly kids then check the membership
    // Then assign it to the props data for membership so it will reflect under "membership in the database"
    if(group === 'fly-kids'){
      if(fkmembership === '5classes'){
        price = 150
        this.props.data.selectPackage.membership = fkmembership
      }else if(fkmembership === '10classes') {
        price = 275
        this.props.data.selectPackage.membership = fkmembership
      }else if(fkmembership === '20classes') {
        price = 475
        this.props.data.selectPackage.membership = fkmembership
      }else{
        price = 550
        this.props.data.selectPackage.membership = fkmembership
      }
    }else if (group === 'adult') {
      price = 300
    } else if (group === 'elite' || group === 'professional') {
      price = 0
    } else if (group === 'beginner' || group === 'intermediate' || group === 'beginner-intermediate') {
      if(membership === 'basic'){
        price = 225
      }else if (membership === 'apprentice'){
        price = 450
      }else if (membership === 'master'){
        price = 575
      }else{
        price = 650
      }
    } else {
      price = 600
    }

    let quarter = this.props.data.selectPackage.quarter
    let now = new Date()
    let month = now.getMonth() + 1
    let lateFee = 0

    if (quarter === 'winter' && (month === 12 || month === 1 || month === 2)) {
      lateFee = 0
    } else if (quarter === 'spring' && (month === 3 || month === 4 || month === 5)) {
      lateFee = 0
    } else if (quarter === 'summer' && (month === 6 || month === 7 || month === 8)) {
      lateFee = 0
    } else if (quarter === 'fall' && (month === 9 || month === 10 || month === 11)) {
      lateFee = 0
    }

    this.state = {
      price: price,
      discount: 0,
      errorText: '',
      showDiscount: false,
      discountCode: '',
      lateFee: lateFee
    }
  }

  componentDidMount () {
    this.calculatePrice()
    $('#payment').submit((e) => {
      e.preventDefault()
    })
  }

  calculatePrice () {
    let price = (this.state.price * (1 - this.state.discount))
    price = parseFloat(price) < 10 ? 1 : price
    price += this.state.lateFee
    let group = this.props.data.selectPackage.group
    let apparel = this.props.data.selectPackage.apparel
    let apparelRes= this.props.data.selectPackage.yesApparel
    let str = this.props.data.selectPackage.strength

    if (apparelRes === 'none'){
    }else{
      price += 20
    }
    if(str === 'none' || group ==='fly-kids'){
    }else{
      price += 100
    }
    price = price * 1.03

    this.renderButton(price)
  }

  renderButton (amount) {
    amount = parseFloat(amount)

    var cont = this.continue.bind(this)
    var paymentDescription = 'Athlete Name: ' + this.props.data.athleteInfo.fname + ' ' + this.props.data.athleteInfo.lname + '\nAthlete Email: ' + this.props.data.athleteInfo.email

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

  continue (data) {
    this.props.advance('payment', {
      paymentId: data.paymentID,
      payerId: data.payerID,
      discount: this.state.discountCode
    })
  }

  applyDiscount () {
    this.setState({
      errorText: ''
    })
    let code = this.refs.discountBox.value

    if (code.length === 0) {
      this.setState({
        errorText: 'You did not enter a code'
      })
    } else {
      apiHelpers.getDiscountAmount(code)
      .then((response) => {
        let info = response.data
        if (!info || !info.ok) {
          this.setState({
            errorText: 'Invalid or Expired Code'
          })
        } else {
          let discountAmount = info.amount
          this.setState({
            discount: discountAmount,
            discountCode: info.code
          })
          document.getElementById('paypal-button-container').innerHTML = ''
          this.calculatePrice()
        }
      })
    }
  }

  toggleDiscount () {
    this.setState({
      showDiscount: !(this.state.showDiscount)
    })
  }

  // fillInfo() {
  //   this.props.advance('payment', {paymentId: 'paymentID==2348759012834570', payerId: 'payerID==9018245709284'})
  // }
  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
        <div className='error-container'>
          <p>{this.state.errorText}</p>
        </div>
      </div>
    }

    let currentPrice = (this.state.price * (1 - this.state.discount))
    currentPrice = currentPrice < 10 ? (1).toFixed(2) : currentPrice.toFixed(2)
    let size = this.props.data.selectPackage.apparel
    let apparelRes = this.props.data.selectPackage.yesApparel
    let str = this.props.data.selectPackage.strength
    let group = this.props.data.selectPackage.group
    let currentProcessingFee = 0
    if (apparelRes === 'none' && str === 'none'){
      currentProcessingFee = ((this.state.price * (1 - this.state.discount)) * 0.03).toFixed(2)
    }else{
      if (str === 'none') {
        currentProcessingFee = ((((this.state.price * (1 - this.state.discount))) + 20) * 0.03).toFixed(2)
      }else if (apparelRes === 'none' && group !== 'fly-kids'){
        currentProcessingFee = ((((this.state.price * (1 - this.state.discount))) + 75) * 0.03).toFixed(2)
      }else{
        currentProcessingFee = ((((this.state.price * (1 - this.state.discount))) + 95) * 0.03).toFixed(2)
      }
    }
    let lateFee = this.state.lateFee

    /*
    old late fee code
    {lateFee > 0 ? (<p className='price-text'>Late Fee: <span className='red-text'>${lateFee.toFixed(2)}</span></p>) : ''}
     */

    return (
      <div className='row'>
        <div className='col-xs-12' style={{textAlign: 'center'}}>
          <form id='payment' className='form-labels-on-top'>
            <div className='form-title-row'>
              <h1>Finalize Payment</h1>
            </div>

            <div className='form-row'>
              <div className='row'>
                <div className='col-xs-12' style={{textAlign: 'center'}}>
                  <p className='price-text'>Registration Fee: <span className='red-text'>${currentPrice}</span></p>
                  {apparelRes !== 'none' ? (<p className='price-text'>Apparel Fee: <span className='red-text'>${20}</span></p>) : ''}
                  {(str !== 'none') && (group !== 'fly-kids') ? (<p className='price-text'>Strength Training Fee: <span className='red-text'>${75}</span></p>) : ''}
                  <p className='price-text'>Online Processing Fee: <span className='red-text'>${currentProcessingFee}</span></p>
                </div>
              </div>
            </div>

            <a style={{color: '#C0282D'}} onClick={this.toggleDiscount.bind(this)}> Have a Discount Code? </a>

            <div className='form-row' style={{display: this.state.showDiscount ? 'block' : 'none'}}>
              <div className='row'>
                <div className='col-xs-8'>
                  <label>
                    <span>Discount Code</span>
                    <input ref='discountBox' type='text' name='discount' style={{width: '100%'}} />
                  </label>
                </div>
                <div className='col-xs-4'>
                  <button type='button' onClick={this.applyDiscount.bind(this)}>Apply</button>
                </div>
              </div>
              {errorContainer}
            </div>

            <p style={{fontSize: '14px', fontWeight: 'normal', marginTop: '20px'}}>Click the button to process your payment through PayPal</p>
            <div className='form-row' style={{textAlign: 'center'}}>
              <div id='paypal-button-container' />
            </div>
          </form>
        </div>
      </div>
    )
  }
}

class Confirmation extends React.Component {
  constructor (props) {
    super(props)

    let athleteEmail = this.props.data.athleteInfo.email

    this.state = {
      title: 'Loading...',
      message: 'Please wait, your purchase is being processed'
    }

    apiHelpers.finalizePayment(this.props.data)
    .then((response) => {
      if (!response.data.ok) {
        this.setState({
          title: 'Uh-oh...',
          message: 'There was an error storing your payment information. Please email it@dcvault.com to verify that your payment went through, or recieve help to fix the issue if not.'
        })
      } else {
        this.setState({
          title: 'Success!',
          message: 'Please check your email for Confirmation and Training information. Thank you!'
        })
        apiHelpers.getUserData()
        .then((response) => {
          if (response.data.ok) {
            if (response.data.user.email && apiHelpers.validateEmail(response.data.user.email)) {
              apiHelpers.sendConfirmationEmail(response.data.user.email)

              if (response.data.user.email !== athleteEmail) {
                apiHelpers.sendConfirmationEmail(athleteEmail)
              }
            }
          }
        })
      }
    })
  }

  render () {
    return (
      <div className='row'>
        <div className='col-xs-12' style={{textAlign: 'center'}}>
          <form id='confirmation' className='form-labels-on-top'>
            <div className='form-title-row'>
              <h1>{this.state.title}</h1>
            </div>
            <p style={{fontSize: '14px', fontWeight: 'normal'}}> {this.state.message} </p>
            <div className='form-row' style={{textAlign: 'center'}}>
              <button type='button' onClick={() => { window.location.href = '/' }}>Home</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

class ProgressBar extends React.Component {
  render () {
    let offStyle = {width: '0px', height: '0px', padding: '5px', border: '1px solid black', borderRadius: '10px', backgroundColor: '#AAA', margin: '0 auto'}
    let onStyle = {width: '0px', height: '0px', padding: '5px', border: '1px solid black', borderRadius: '10px', backgroundColor: '#C0282D', margin: '0 auto'}

    return (
      <div className='container' style={{marginTop: '35px'}}>
        <div className='row'>
          <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 1 ? onStyle : offStyle} />
            <p>Packages</p>
          </div>
          <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 2 ? onStyle : offStyle} />
            <p>Athlete</p>
          </div>
          <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 3 ? onStyle : offStyle} />
            <p>Agreement</p>
          </div>
          <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 4 ? onStyle : offStyle} />
            <p>Payment</p>
          </div>
          <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 5 ? onStyle : offStyle} />
            <p>Done!</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Register
