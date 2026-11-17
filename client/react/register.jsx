import React from 'react'
import apiHelpers from './api-helpers'
import waivers from './waivers'
const $ = window.$

const parseFormValues = apiHelpers.parseFormValues

// Feature flag: set to false to disable the "select an existing athlete"
// feature and revert registration to the original blank-form flow.
const ENABLE_ATHLETE_SELECTOR = true

// Pricing shared by the Packages step text and the Payment step charge.
const APPAREL_PRICE = 20
const PROCESSING_FEE_RATE = 0.03

// Display labels for the Payment step order summary
const LABELS = {
  quarter: {spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter'},
  group: {
    'fly-kids': 'Fly-Kids (7-11) + Camps',
    'dropin': 'Drop-In',
    'adult': 'Adult (21+)',
    'plesson': 'Private Lesson',
    'allages': 'All Ages (12+ Beginner thru Advanced)',
    'emerging-elite': 'Emerging Elite (Level III)',
    'elite': 'Elite (Level IV)',
    'professional': 'Professional (Level V)'
  },
  membership: {
    '2classes': '2 Classes',
    '4classes': '4 Classes',
    '8classes': '8 Classes',
    '15classes': '15 Classes',
    '30classes': 'Unlimited Classes',
    'summercamp': 'Summer Camp'
  },
  facility: {dcv: 'DC Vault', prep: 'Georgetown Prep', dcvprep: 'Flexible (DC Vault + Georgetown Prep)'},
  size: {yxs: 'Youth XS', xs: 'XS', sm: 'S', md: 'M', lg: 'L'}
}

const formatMoney = (amount) => '$' + (Math.round(amount * 100) / 100).toFixed(2)

// "DEFY GRAVITY" photo panel shown beside every registration step.
const RegHero = () => (
  <aside className='reg-hero'>
    <div className='reg-hero__overlay' />
    <div className='reg-hero__content'>
      <h1 className='reg-hero__title'>DEFY<br />GRAVITY.</h1>
      <p className='reg-hero__sub'>Join the elite. Select your training packages below and secure your spot in our upcoming sessions.</p>
      <ul className='reg-hero__features'>
        <li><i className='fa fa-check-circle' /> Expert Coaching</li>
        <li><i className='fa fa-check-circle' /> State-of-the-art Facilities</li>
        <li><i className='fa fa-check-circle' /> All Skill Levels Welcome</li>
      </ul>
    </div>
  </aside>
)

class Register extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentPage: '',
      pageNum: 0,
      data: {},
      showBar: false,
      registrationOpen: false,
      existingAthletes: []
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
        currentPage: (<AthleteInfo advance={this.advance.bind(this)} existingAthletes={this.state.existingAthletes} />)
      })
    } else if (newPageNum === 3) {
      this.setState({
        currentPage: (<Agreement advance={this.advance.bind(this)} data={this.state.data} />)
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
        loginButton.innerHTML = '<i class="fa fa-user"></i>'
        loginButton.onclick = () => {
          window.location.href = '/account'
        }
        if (ENABLE_ATHLETE_SELECTOR) {
          // Skip the lookup for admins: the /users/info admin branch returns
          // every athlete in the system, which we don't want to surface in the
          // selector. We avoid the request entirely rather than changing that endpoint.
          apiHelpers.isAdmin()
          .then((admin) => {
            if (admin) {
              return
            }
            apiHelpers.getUserData()
            .then((response) => {
              if (response && response.data && response.data.ok && response.data.athletes) {
                this.setState({
                  existingAthletes: response.data.athletes
                }, () => {
                  // If the athletes arrive after the user already reached the
                  // athlete page, rebuild it so the selector actually renders.
                  if (this.state.pageNum === 2) {
                    this.setState({
                      currentPage: (<AthleteInfo advance={this.advance.bind(this)} existingAthletes={this.state.existingAthletes} />)
                    })
                  }
                })
              }
            })
          })
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
            <div className='reg-center'>
              <form className='reg-form' style={{textAlign: 'center'}}>
                <p className='reg-form__title'>Register for Training</p>
                <p style={{fontFamily: 'var(--rd-font-body)', color: '#374151'}}>You must be logged in to <span className='reg-link'>register for training</span>.</p>
                <a className='reg-btn' onClick={() => { loginButton.click() }}>Login / Register</a>
              </form>
            </div>
          )
        })
      }
    })
  }

  render () {
    window.scrollTo(0, 0)
    let stepper = this.state.showBar ? (<ProgressBar pageNum={this.state.pageNum} />) : ''
    if (this.state.registrationOpen) {
      return (
        <section id='register' className='reg-redesign'>
          {stepper}
          <div className='reg-split'>
            <RegHero />
            <div className='reg-main'>
              {this.state.currentPage}
            </div>
          </div>
        </section>
      )
    } else {
      return (
        <section id='register' className='reg-redesign'>
          <div className='reg-center'>
            <form className='reg-form'>
              <p className='reg-form__title'>DC Vault Registration</p>
              <p style={{fontFamily: 'var(--rd-font-body)', color: '#374151', lineHeight: 1.6}}>Registration for training will re-open <span className='reg-link'>15 days prior</span> to the start of the upcoming quarter. A <span className='reg-link'>$25 late fee</span> will be applied if registration occurs after the start of a given quarter. Please check back later to register for training, and don't hesitate to <a className='reg-link' onClick={() => { document.getElementById('contact-button').click() }}>contact us</a> if you have any questions. <span className='reg-link'>Thank you</span>.</p>
              <p style={{fontFamily: 'var(--rd-font-body)', color: '#374151', textAlign: 'right'}}>- DC Vault</p>
            </form>
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
      checkedStrengthFam: 'none',
      showInvite: false,
      showDropIn: false,
      showPrivateLesson:false,
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
    output.strengthFam = $('input[name="strengthFam"]:checked').val()
    output.month = $('input[name="month"]:checked').val()
    output.membership = $('input[name="membership"]:checked').val()
    output.fkmembership = $('input[name="fkmembership"]:checked').val()
    output.yesApparel = $('input[name="yesapparel"]:checked').val()
    // Size picker is always on screen; only send a size if they opted in
    if (output.yesApparel !== 'yes') {
      delete output.apparel
    }
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

    if ((month === 2 && day >= 1) || month === 3 || month === 4 || month === 5) {
      activeQuarter = 'spring'
    }

    if ((month === 5 && day >= 1) || month === 6 || month === 7 || month === 8) {
      activeQuarter = 'summer'
    }

    if ((month === 8 && day >= 1) || month === 9 || month === 10) {
      activeQuarter = 'fall'
    }

    this.setState({
      activeQuarter: activeQuarter
    })
  }

  adjustOptions () {
    let group = $('input[name="group"]:checked').val()
    // All class-option lists stay in the DOM, so clear the class choice when
    // the group changes; otherwise e.g. an All Ages pick would carry over.
    if (group !== this.state.checkedGroup) {
      $('input[name="membership"], input[name="fkmembership"]').prop('checked', false)
    }
    let quarter = $('input[name="quarter"]:checked').val()
    let facility = $('input[name="facility"]:checked').val()
    let month = $('input[name="month"]:checked').val()
    let membership = $('input[name="membership"]:checked').val()
    let fkmembership = $('input[name="fkmembership"]:checked').val()
    let strength = $('input[name="strength"]:checked').val()
    let strengthFam = $('input[name="strengthFam"]:checked').val()
    let yesApparel = $('input[name="yesapparel"]:checked').val()
    this.setState({
      checkedGroup: group,
      checkedSession: quarter,
      checkedFacility: facility,
      checkedMonth: month,
      checkedMembership: membership,
      checkedStrength: strength,
      checkedStrengthFam: strengthFam,
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
          if (level === 1){
            this.setState({
              showDropIn: true
            })
          }
          else if(level === 2){
            this.setState({
              showPrivateLesson: true
            })
          }
          else if (level === 3) {
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

  // Selectable option card (used for session + location pickers)
  optionCard (name, value, title, sub, selected, extraStyle) {
    return (
      <label className={'reg-option' + (selected ? ' reg-option--selected' : '')} style={extraStyle || {}}>
        <input type='radio' name={name} value={value} checked={selected} onChange={this.adjustOptions.bind(this)} />
        <span className='reg-option__body'>
          <span className='reg-option__title'>{title}</span>
          {sub ? (<span className='reg-option__sub'>{sub}</span>) : ''}
        </span>
        <i className='fa fa-check-circle reg-option__check' />
      </label>
    )
  }

  // Full-width selectable radio card (used for the training-group picker)
  groupCard (value, label, selected, show) {
    return (
      <label className={'reg-radio reg-radio-card' + (selected ? ' reg-radio--selected' : '')} style={{display: show ? 'flex' : 'none'}}>
        <input type='radio' name='group' value={value} checked={selected} onChange={this.adjustOptions.bind(this)} />
        <span className='reg-radio__dot' />
        <span className='reg-radio__label'>{label}</span>
      </label>
    )
  }

  // Inline radio row (used for class-option lists)
  radioRow (name, value, label, sub) {
    return (
      <label className='reg-radio'>
        <input type='radio' name={name} value={value} onChange={this.adjustOptions.bind(this)} />
        <span className='reg-radio__dot' />
        <span className='reg-radio__label'>{label}{sub ? (<small>{sub}</small>) : ''}</span>
      </label>
    )
  }

  render () {
    let s = this.state
    let errorContainer
    if (!(s.errorText.length === 0)) {
      errorContainer = (
        <div className='reg-error'>
          <p>{s.errorText}</p>
        </div>
      )
    }

    // Groups that have a class-count choice in the Class Options section
    let classGroups = ['allages', 'adult', 'fly-kids']
    let sizesEnabled = s.checkedYesApparel === 'yes'

    return (
        <div className='reg-form-col'>
          <form id='select-package' className='reg-form'>

            {/* Training Session */}
            <div className='reg-section'>
              <p className='reg-heading'>Training Session<span className='rd-req'>*</span></p>
              <p className='reg-subnote'>(consult the training <span className='reg-link'>calendar</span> for class schedule BEFORE registering)</p>
              <div className='reg-option-grid'>
                {this.optionCard('quarter', 'spring', 'Spring', '(Mar-May)', s.checkedSession === 'spring')}
                {this.optionCard('quarter', 'summer', 'Summer', '(Jun-Aug)', s.checkedSession === 'summer')}
                {this.optionCard('quarter', 'fall', 'Fall', '(Sep-Nov)', s.checkedSession === 'fall')}
                {this.optionCard('quarter', 'winter', 'Winter', '(Dec-Feb)', s.checkedSession === 'winter')}
              </div>
            </div>

            {/* Training Group */}
            <div className='reg-section'>
              <p className='reg-heading'>Training Group<span className='rd-req'>*</span></p>
              {this.groupCard('fly-kids', 'Fly-Kids (7-11) + Camps', s.checkedGroup === 'fly-kids', true)}
              {this.groupCard('dropin', 'Drop-In', s.checkedGroup === 'dropin', s.showDropIn)}
              {this.groupCard('adult', 'Adult (21+)', s.checkedGroup === 'adult', true)}
              {this.groupCard('plesson', 'Private Lesson', s.checkedGroup === 'plesson', s.showPrivateLesson)}
              {this.groupCard('allages', 'All Ages (12+ Beginner thru Advanced)', s.checkedGroup === 'allages', true)}
              {this.groupCard('emerging-elite', 'Emerging Elite (Level III)', s.checkedGroup === 'emerging-elite', s.showEmergingElite)}
              {this.groupCard('elite', 'Elite (Level IV)', s.checkedGroup === 'elite', s.showElite)}
              {this.groupCard('professional', 'Professional (Level V)', s.checkedGroup === 'professional', s.showProfessional)}

              <div className='reg-callout' style={{marginTop: '12px'}}>
                <div><span className='reg-link' onClick={this.toggleInvite.bind(this)}>CLICK HERE</span> and enter your <span className='reg-link'>Invite Code</span> to register for a <span className='reg-link'>Private Lesson</span> or <span className='reg-link'>Drop-In Class</span></div>
                <div className='reg-callout__sub'>Don't have an <span className='reg-link'>Invite Code?</span> <span className='reg-link' onClick={() => { document.getElementById('contact-button').click() }}>CLICK HERE</span></div>
                <div style={{display: s.showInvite ? 'block' : 'none', marginTop: '12px'}}>
                  <div className='reg-grid-2'>
                    <input ref='inviteBox' type='text' name='invite' placeholder='Invite Code' />
                    <button type='button' className='reg-btn' onClick={this.applyInvite.bind(this)}>Apply</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Options — always visible. The per-group lists are stacked in
                one grid cell so the section is always as tall as the longest
                list, and switching groups doesn't shift the layout. */}
            <div className='reg-section'>
              <p className='reg-heading'>Class Options<span className='rd-req'>*</span></p>
              <div className='reg-stack'>
                <div className={'reg-stack__layer' + (classGroups.indexOf(s.checkedGroup) === -1 ? '' : ' reg-stack__layer--hidden')}>
                  <p className='reg-subnote'>{s.checkedGroup ? 'No class options to choose for this training group.' : 'Select a training group above to see class options.'}</p>
                </div>

                {/* All Ages */}
                <div className={'reg-stack__layer' + (s.checkedGroup === 'allages' ? '' : ' reg-stack__layer--hidden')}>
                  {this.radioRow('membership', '4classes', '4 Classes ($250)')}
                  {this.radioRow('membership', '8classes', '8 Classes ($425)')}
                  {this.radioRow('membership', '15classes', '15 Classes ($575)')}
                  {this.radioRow('membership', '30classes', 'Unlimited Classes ($825)', '- 30-50 depending on training schedule')}
                  <p className='reg-subnote' style={{marginTop: '12px'}}>(see above highlighted updates for pricing and options for each category including private lessons)</p>
                </div>

                {/* Adult */}
                <div className={'reg-stack__layer' + (s.checkedGroup === 'adult' ? '' : ' reg-stack__layer--hidden')}>
                  {this.radioRow('membership', '2classes', '2 Classes ($100)')}
                  {this.radioRow('membership', '8classes', '8 Classes ($350)')}
                  <p className='reg-subnote' style={{marginTop: '12px'}}>(see above highlighted updates for pricing and options for each category including private lessons)</p>
                </div>

                {/* Fly-Kids */}
                <div className={'reg-stack__layer' + (s.checkedGroup === 'fly-kids' ? '' : ' reg-stack__layer--hidden')}>
                  <p className='reg-subnote'>Check back next Summer 2026 for Fly-Kids Summer Camp!</p>
                  {this.radioRow('fkmembership', '2classes', '2 Classes ($60)')}
                  {this.radioRow('fkmembership', '8classes', '8 Classes ($200)')}
                  {this.radioRow('fkmembership', '15classes', '15 Classes ($300)')}
                  <p className='reg-subnote' style={{marginTop: '12px'}}>(see above highlighted updates for pricing and options for each category including private lessons)</p>
                </div>
              </div>
            </div>

            {/* Preferred Training Location */}
            <div className='reg-section reg-section--divider'>
              <p className='reg-heading'>Preferred Training Location<span className='rd-req'>*</span></p>
              <div className='reg-option-grid'>
                {this.optionCard('facility', 'dcv', 'DC Vault', null, s.checkedFacility === 'dcv', {justifyContent: 'center', textAlign: 'center', paddingRight: '16px'})}
                {s.checkedFKMembership !== 'summercamp' ? this.optionCard('facility', 'prep', 'Georgetown Prep', null, s.checkedFacility === 'prep', {justifyContent: 'center', textAlign: 'center', paddingRight: '16px'}) : ''}
              </div>
              {s.checkedFKMembership !== 'summercamp' ? (
                <label className={'reg-option reg-option--center' + (s.checkedFacility === 'dcvprep' ? ' reg-option--selected' : '')} style={{marginTop: '16px'}}>
                  <input type='radio' name='facility' value='dcvprep' checked={s.checkedFacility === 'dcvprep'} onChange={this.adjustOptions.bind(this)} />
                  <span className='reg-option__body'>
                    <span className='reg-option__title'>Flexible <span style={{fontWeight: 400, textTransform: 'none', color: 'var(--rd-muted)'}}>(I may train at more than one site)</span></span>
                  </span>
                </label>
              ) : ''}
            </div>

            {/* Apparel */}
            <div className='reg-section'>
              <p className='reg-heading'>Apparel<span className='rd-req'>*</span></p>
              <p className='reg-subnote'>Would you like team apparel? DC Vault T-shirts can be purchased for an additional ${APPAREL_PRICE} (INCLUDED IN FLY-KIDS CAMP PLEASE SELECT "YES!" AND SIZE).</p>
              <div className='reg-apparel-card'>
                <img className='reg-apparel-card__img' src='../img/register/apparel-shirts.png' />
                <div className='reg-apparel-card__options'>
                  <label className='reg-radio'>
                    <input type='radio' name='yesapparel' value='none' checked={s.checkedYesApparel === 'none'} onChange={this.adjustOptions.bind(this)} />
                    <span className='reg-radio__dot' />
                    <span className='reg-radio__label'>No Thanks</span>
                  </label>
                  <label className='reg-radio'>
                    <input type='radio' name='yesapparel' value='yes' checked={s.checkedYesApparel === 'yes'} onChange={this.adjustOptions.bind(this)} />
                    <span className='reg-radio__dot' />
                    <span className='reg-radio__label'>Yes!</span>
                  </label>
                </div>
              </div>

              <div className={'reg-sizes' + (sizesEnabled ? '' : ' reg-sizes--disabled')} style={{marginTop: '16px'}} aria-disabled={!sizesEnabled}>
                <p className='reg-subnote'>Ask the coach for your shirt at your first class!</p>
                <p className='reg-field' style={{fontWeight: 700, fontSize: '13px', color: 'var(--rd-ink-soft)', margin: '0 0 6px'}}>Youth</p>
                <label className='reg-radio'>
                  <input type='radio' name='apparel' value='yxs' disabled={!sizesEnabled} />
                  <span className='reg-radio__dot' />
                  <span className='reg-radio__label'>XS</span>
                </label>
                <p className='reg-field' style={{fontWeight: 700, fontSize: '13px', color: 'var(--rd-ink-soft)', margin: '12px 0 6px'}}>Unisex</p>
                <label className='reg-radio'>
                  <input type='radio' name='apparel' value='xs' disabled={!sizesEnabled} />
                  <span className='reg-radio__dot' />
                  <span className='reg-radio__label'>XS</span>
                </label>
                <label className='reg-radio'>
                  <input type='radio' name='apparel' value='sm' disabled={!sizesEnabled} />
                  <span className='reg-radio__dot' />
                  <span className='reg-radio__label'>S</span>
                </label>
                <label className='reg-radio'>
                  <input type='radio' name='apparel' value='md' disabled={!sizesEnabled} />
                  <span className='reg-radio__dot' />
                  <span className='reg-radio__label'>M</span>
                </label>
                <label className='reg-radio'>
                  <input type='radio' name='apparel' value='lg' disabled={!sizesEnabled} />
                  <span className='reg-radio__dot' />
                  <span className='reg-radio__label'>L</span>
                </label>
              </div>
            </div>

            {errorContainer}

            <div className='reg-section'>
              <button type='button' className='reg-btn reg-btn--block' onClick={this.continue.bind(this)}>Continue</button>
            </div>

          </form>
        </div>
    )
  }
}

class AthleteInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      errorText: [],
      showUSATFinfo: false,
      selectedAthleteId: null
    }
  }

  selectAthlete (athlete) {
    this.setState({
      selectedAthleteId: athlete.id
    })

    // Prefill identity fields from the existing athlete. Emergency contact
    // fields are intentionally left blank so they are re-entered each time.
    $('input[name=fname]').val(athlete.firstName || '')
    $('input[name=lname]').val(athlete.lastName || '')
    $('input[name=dob]').val(athlete.dob || '')
    $('input[name=email]').val(athlete.email || '')
    $('input[name=lstserv]').val(athlete.notifications || '')
    $('input[name=usatf]').val(athlete.usatf || '')
    $('select[name=gender]').val(athlete.gender || '')
    $('select[name=state]').val(athlete.state || '')
    $('input[name=school]').val(athlete.school || '')

    $('input[name=emergency-contact]').val('')
    $('input[name=emergency-relation]').val('')
    $('input[name=emergency-phone]').val('')
  }

  createNewAthlete () {
    this.setState({
      selectedAthleteId: null
    })

    $('input[name=fname]').val('')
    $('input[name=lname]').val('')
    $('input[name=dob]').val('')
    $('input[name=email]').val('')
    $('input[name=lstserv]').val('')
    $('input[name=usatf]').val('')
    $('select[name=gender]').val('')
    $('select[name=state]').val('')
    $('input[name=school]').val('')
    $('textarea[name=conditions]').val('')
    $('input[name=emergency-contact]').val('')
    $('input[name=emergency-relation]').val('')
    $('input[name=emergency-phone]').val('')
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
      output.athleteId = this.state.selectedAthleteId || null
      this.props.advance('athleteInfo', output)
    }
  }

  toggleUSATFinfo () {
    let current = this.state.showUSATFinfo
    this.setState({
      showUSATFinfo: !current
    })
  }

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = (
        <div className='reg-error'>
          {this.state.errorText.map((error) => {
            return <p key={error}>{error}</p>
          })}
        </div>
      )
    }

    let athleteSelector
    let existingAthletes = ENABLE_ATHLETE_SELECTOR ? (this.props.existingAthletes || []) : []
    if (existingAthletes.length > 0) {
      let detailStyle = {fontWeight: 'normal', fontSize: '13px', color: '#5f5f5f', marginTop: '6px'}
      let columnStyle = {display: 'inline-block', verticalAlign: 'top', width: '50%', boxSizing: 'border-box'}

      athleteSelector = (
        <div className='reg-section'>
          <p className='reg-heading' style={{fontSize: '16px'}}>Select an existing athlete or create a new one</p>

          {existingAthletes.map((athlete) => {
            let isSelected = this.state.selectedAthleteId === athlete.id
            let profile = athlete.athleteProfile
            return (
              <div
                key={athlete.id}
                className={'reg-athlete-card' + (isSelected ? ' reg-athlete-card--selected' : '')}
                onClick={() => { this.selectAthlete(athlete) }}
              >
                <div style={{fontWeight: 'bold', color: '#5f5f5f', display: 'flex', justifyContent: 'space-between'}}>
                  <span>
                    {athlete.firstName} {athlete.lastName}
                    {athlete.currentlyRegistered
                      ? (<span style={{color: '#1a7f37', fontWeight: 'normal', marginLeft: '8px'}}>(Currently Registered)</span>)
                      : ''}
                  </span>
                  {athlete.dob
                    ? (<span style={{fontWeight: 'normal', fontStyle: 'italic', marginLeft: '8px'}}>{athlete.dob}</span>)
                    : ''}
                </div>
                <div style={{marginTop: '6px'}}>
                  <div style={Object.assign({}, columnStyle, detailStyle)}>
                    <div>{athlete.gender ? (athlete.gender.charAt(0).toUpperCase() + athlete.gender.slice(1)) : 'N/A'}</div>
                  </div>
                  <div style={Object.assign({}, columnStyle, detailStyle, {textAlign: 'right'})}>
                    <div>USATF: {athlete.usatf || 'N/A'}</div>
                  </div>
                  {profile
                    ? (<div style={Object.assign({marginTop: '4px'}, detailStyle)}>
                        Linked App Profile: {profile.firstName + ' ' + profile.lastName + (profile.alwaysActiveOverride ? ' (active member)' : '')}
                      </div>)
                    : ''}
                </div>
              </div>
            )
          })}

          <div
            className={'reg-athlete-card' + (this.state.selectedAthleteId === null ? ' reg-athlete-card--selected' : '')}
            onClick={() => { this.createNewAthlete() }}
          >
            <div style={{fontWeight: 'bold', color: '#5f5f5f'}}>+ Create New Athlete</div>
            <div style={detailStyle}>
              Add a new athlete with the information below.
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='reg-center'>
        <form id='athlete-info' className='reg-form'>

          <p className='reg-form__title'>Athlete Information</p>

          {athleteSelector}

          <div className='reg-grid-2'>
            <div className='reg-field'>
              <label>Athlete First Name<span className='rd-req'>*</span></label>
              <input type='text' name='fname' />
            </div>
            <div className='reg-field'>
              <label>Athlete Last Name<span className='rd-req'>*</span></label>
              <input type='text' name='lname' />
            </div>
          </div>

          <div className='reg-field'>
            <label>Athlete DOB (mm/dd/yyyy)<span className='rd-req'>*</span></label>
            <input type='text' name='dob' onChange={this.formatDOB.bind(this)} />
          </div>

          <div className='reg-field'>
            <label>Athlete Email<span className='rd-req'>*</span></label>
            <input type='text' name='email' />
          </div>

          <div className='reg-field'>
            <label>Notification Email (for announcements, schedule adjustments, etc.)<span className='rd-req'>*</span></label>
            <input type='text' name='lstserv' />
          </div>

          <div className='reg-field'>
            <label>
              Athlete USATF Number<span className='rd-req'>*</span>
              <span onClick={this.toggleUSATFinfo.bind(this)} className='reg-link' style={{marginLeft: '8px'}}>?</span>
            </label>
            <p className='reg-subnote' style={{display: this.state.showUSATFinfo ? 'block' : 'none'}}>
              We are sanctioned by USATF. As such, our participants need a current USATF membership ($30 for 1-year). If you have a current number, but do not know it, you can look it up <a className='reg-link' target='_blank' href='https://www.usatf.org/membership/help/number.asp'>here</a>. If you do not have a current number, you can join or renew <a className='reg-link' target='_blank' href='https://www.usatf.org/home/top-utility-nav-content/membership-1'>here</a>.
            </p>
            <input type='text' name='usatf' onChange={this.formatUSATF.bind(this)} />
          </div>

          <div className='reg-field'>
            <label>Emergency Contact Name<span className='rd-req'>*</span></label>
            <input type='text' name='emergency-contact' />
          </div>

          <div className='reg-field'>
            <label>Emergency Contact Relation<span className='rd-req'>*</span></label>
            <input type='text' name='emergency-relation' />
          </div>

          <div className='reg-field'>
            <label>Emergency Contact Phone<span className='rd-req'>*</span></label>
            <input type='text' name='emergency-phone' onChange={this.formatPhone.bind(this)} />
          </div>

          <div className='reg-field'>
            <label>Athlete Gender<span className='rd-req'>*</span></label>
            <select name='gender'>
              <option value=''>Select Gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other/Non-Binary</option>
            </select>
          </div>

          <div className='reg-field'>
            <label>State of Residence<span className='rd-req'>*</span></label>
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
          </div>

          <div className='reg-field'>
            <label>Current School (optional)</label>
            <input type='text' name='school' />
          </div>

          <div className='reg-field'>
            <label>Medical Conditions<span className='rd-req'>*</span> <span style={{fontWeight: 'normal', color: 'var(--rd-muted)'}}>If none, write 'none'</span></label>
            <textarea rows='6' name='conditions' />
          </div>

          {errorContainer}

          <div className='reg-section'>
            <button type='button' className='reg-btn reg-btn--block' onClick={this.continue.bind(this)}>Continue</button>
          </div>

        </form>
      </div>
    )
  }
}

class Agreement extends React.Component {
  constructor (props) {
    super(props)

    // The waiver is chosen automatically from the athlete's DOB: under 18 →
    // youth (guardian) waiver, 18+ → adult waiver. Only if the DOB can't be
    // read do we fall back to letting them pick.
    let autoWaiverType = Agreement.waiverTypeForDob(props.data)

    this.state = {
      errorText: '',
      autoWaiverType: autoWaiverType,
      waiverType: autoWaiverType || 'adult',
      agreed: false
    }
  }

  // athleteInfo.dob is collected on the previous step as mm/dd/yyyy.
  // Returns 'youth', 'adult', or null when the DOB can't be read.
  static waiverTypeForDob (data) {
    let dob = data && data.athleteInfo && data.athleteInfo.dob
    let parts = (dob || '').split('/')
    if (parts.length !== 3) return null
    let month = parseInt(parts[0], 10)
    let day = parseInt(parts[1], 10)
    let year = parseInt(parts[2], 10)
    if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900)) return null
    let birth = new Date(year, month - 1, day)
    if (isNaN(birth.getTime()) || birth > new Date()) return null
    // Age on the registration date
    let eighteenth = new Date(year + 18, month - 1, day)
    return eighteenth > new Date() ? 'youth' : 'adult'
  }

  selectWaiver (waiverType) {
    if (waiverType === this.state.waiverType) return
    this.setState({ waiverType: waiverType })
    // Start the newly selected waiver from the top
    if (this.refs.waiverBody) this.refs.waiverBody.scrollTop = 0
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
    delete output.agree
    output.waiverType = this.state.waiverType

    if (!this.state.agreed) {
      this.setState({
        errorText: 'Please confirm that you have read and agree to the waiver'
      })
    } else if (!output.hasOwnProperty('name') || !output.hasOwnProperty('date')) {
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

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = (
        <div className='reg-error'>
          <p>{this.state.errorText}</p>
        </div>
      )
    }

    let waiver = waivers[this.state.waiverType]

    return (
      <div className='reg-form-col'>
        <form id='agreement' className='reg-form'>
          <div className='reg-section'>
            <p className='reg-heading'>Waiver Agreement<span className='rd-req'>*</span></p>
            <p className='reg-subnote'>Please read the waiver below in full, then sign to continue.</p>
          </div>

          {/* Waiver: chosen from the athlete's DOB, or picked if DOB is unreadable */}
          {this.state.autoWaiverType ? (
            <div className='reg-section'>
              <p className='reg-heading reg-heading--icon'>
                <img src='../img/register/icon-waiver.svg' width='17.29' height='17.29' alt='' />
                {waiver.tabTitle} Waiver
              </p>
              <div className='reg-callout'>
                {this.state.autoWaiverType === 'youth'
                  ? 'This waiver must be signed by the athlete’s parent or legal guardian because the athlete is under 18'
                  : 'This waiver is for athletes 18 or older'}
                {' '}(date of birth <strong>{this.props.data.athleteInfo.dob}</strong>).
                <div className='reg-callout__sub'>If the date of birth is incorrect, please restart registration and correct it on the Athlete step.</div>
              </div>
            </div>
          ) : (
          <div className='reg-section'>
            <p className='reg-heading reg-heading--icon'>
              <img src='../img/register/icon-waiver.svg' width='17.29' height='17.29' alt='' />
              Select Waiver
            </p>
            <div className='reg-option-grid' role='tablist'>
              {['adult', 'youth'].map((key) => {
                let w = waivers[key]
                let selected = this.state.waiverType === key
                return (
                  <label key={key} role='tab' aria-selected={selected} className={'reg-option' + (selected ? ' reg-option--selected' : '')}>
                    <input type='radio' name='waiverType' value={key} checked={selected} onChange={() => this.selectWaiver(key)} />
                    <span className='reg-option__body'>
                      <span className='reg-option__title'>{w.tabTitle}</span>
                      <span className='reg-option__sub'>{w.tabSub}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          )}

          {/* Waiver text */}
          <div className='reg-section'>
            <div className='reg-waiver' role='tabpanel'>
              <div className='reg-waiver__bar'>
                <span className='reg-waiver__bar-title'>{waiver.title}</span>
                <span className='reg-waiver__badge'>Scroll to read</span>
              </div>
              <div className='reg-waiver__body' ref='waiverBody' tabIndex='0'>
                <h4 className='reg-waiver__heading'>{waiver.title}</h4>
                {waiver.subtitle ? (<p className='reg-waiver__subtitle'>{waiver.subtitle}</p>) : ''}
                {waiver.sections.map((section, i) => (
                  <div key={waiver.key + i} className={'reg-waiver__section' + (section.emphasis ? ' reg-waiver__section--emphasis' : '')}>
                    {section.heading ? (<h4 className='reg-waiver__heading'>{section.heading}</h4>) : ''}
                    {section.paragraphs.map((text, j) => (<p key={j}>{text}</p>))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='reg-section'>
            <div className='reg-callout'>
              By signing below and clicking ‘Continue’ you agree that you (the adult athlete or the athlete’s legal guardian) agree with the above waivers. You may <a className='reg-link' href='../files/DC Vault Waiver - Competition.pdf' target='_blank'>click here</a> to view the waivers as a PDF.
            </div>
          </div>

          {/* Signature */}
          <div className='reg-section'>
            <p className='reg-heading reg-heading--icon'>
              <img src='../img/register/icon-signature.svg' width='17.29' height='17.29' alt='' />
              Signature
            </p>
            <label className={'reg-agree' + (this.state.agreed ? ' reg-agree--checked' : '')}>
              <input type='checkbox' name='agree' checked={this.state.agreed} onChange={(e) => this.setState({ agreed: e.target.checked })} />
              <span>I have read and agree to the waiver above.</span>
            </label>
            <div className='reg-grid-2'>
              <div className='reg-field'>
                <label>{this.state.waiverType === 'youth' ? 'Parent/Guardian Full Name' : 'Full Name'}<span className='rd-req'>*</span></label>
                <input type='text' name='name' placeholder='Full name' />
              </div>
              <div className='reg-field'>
                <label>Date (mm/dd/yyyy)<span className='rd-req'>*</span></label>
                <input type='text' name='date' placeholder='mm/dd/yyyy' onChange={this.formatDate.bind(this)} />
              </div>
            </div>
          </div>

          {errorContainer}

          <div className='reg-section'>
            <button type='button' className='reg-btn reg-btn--block' onClick={this.continue.bind(this)}>Continue</button>
          </div>

        </form>
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
      if(fkmembership === '8classes'){
        price = 200
        this.props.data.selectPackage.membership = fkmembership
      }else if(fkmembership === '2classes') {
        price = 60
        this.props.data.selectPackage.membership = fkmembership
      }else if(fkmembership === '15classes') {
        price = 300
        this.props.data.selectPackage.membership = fkmembership
      }else if(fkmembership === 'summercamp') {
        price = 350
        this.props.data.selectPackage.membership = fkmembership
      }else{
        price = 550
        this.props.data.selectPackage.membership = fkmembership
      }
    }else if (group === 'dropin'){
      price = 75
    }else if(group === 'plesson'){
      price = 250
    }else if (group === 'adult') {
      if(membership === '2classes'){
        price = 100
      }else{
        price = 350
      }
    } else if (group === 'elite' || group === 'professional') {
      price = 0
    } else if (group === 'allages') {
      if(membership === '4classes'){
        price = 250
      }else if (membership === '8classes'){
        price = 425
      }else if (membership === '15classes'){
        price = 575
      }else if (membership === '30classes'){
        price = 825
      }else{
        price = 825
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

  // Single source of truth for every amount shown in the summary AND charged
  // through PayPal, so the breakdown always adds up to the charged total.
  getTotals () {
    let pkg = this.props.data.selectPackage
    let packagePrice = this.state.price
    let packageAfterDiscount = packagePrice * (1 - this.state.discount)
    // Existing rule: a package under $10 (after discount) is charged $1
    if (packageAfterDiscount < 10) packageAfterDiscount = 1
    // e.g. $0 Elite/Professional packages are charged the $1 minimum; show
    // the package at that price so the summary lines add up to the total
    if (packageAfterDiscount > packagePrice) packagePrice = packageAfterDiscount
    let discountAmount = packagePrice - packageAfterDiscount

    let shirtIncluded = pkg.membership === 'summercamp'
    let wantsShirt = pkg.yesApparel !== 'none'
    let apparelPrice = (wantsShirt && !shirtIncluded) ? APPAREL_PRICE : 0

    let lateFee = this.state.lateFee
    let subtotal = packageAfterDiscount + apparelPrice + lateFee
    let total = subtotal * (1 + PROCESSING_FEE_RATE)

    return {
      packagePrice: packagePrice,
      discountAmount: discountAmount,
      wantsShirt: wantsShirt,
      shirtIncluded: shirtIncluded,
      apparelPrice: apparelPrice,
      lateFee: lateFee,
      subtotal: subtotal,
      processingFee: total - subtotal,
      total: total
    }
  }

  calculatePrice () {
    this.renderButton(this.getTotals().total)
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

  render () {
    let errorContainer
    if (!(this.state.errorText.length === 0)) {
      errorContainer = (
        <div className='reg-error'>
          <p>{this.state.errorText}</p>
        </div>
      )
    }

    let pkg = this.props.data.selectPackage
    let athlete = this.props.data.athleteInfo || {}
    let t = this.getTotals()

    // Package description lines (only the ones that apply to this selection)
    let packageDetails = [
      pkg.quarter ? ['Session', LABELS.quarter[pkg.quarter] || pkg.quarter] : null,
      pkg.group ? ['Training group', LABELS.group[pkg.group] || pkg.group] : null,
      LABELS.membership[pkg.membership] ? ['Class option', LABELS.membership[pkg.membership]] : null,
      pkg.facility ? ['Location', LABELS.facility[pkg.facility] || pkg.facility] : null
    ].filter(Boolean)

    let shirtSize = LABELS.size[pkg.apparel]

    return (
      <div className='reg-center'>
        <form id='payment' className='reg-form'>
          <p className='reg-form__title'>Finalize Payment</p>

          <div className='reg-section'>
            <p className='reg-heading'>Order Summary</p>
            {athlete.fname ? (<p className='reg-subnote'>Athlete: {athlete.fname} {athlete.lname}</p>) : ''}

            <div className='reg-summary'>
              <div className='reg-summary__item'>
                <div className='reg-summary__row'>
                  <span className='reg-summary__label'>Training Package</span>
                  <span className='reg-summary__amount'>{formatMoney(t.packagePrice)}</span>
                </div>
                <ul className='reg-summary__details'>
                  {packageDetails.map((d) => (<li key={d[0]}><span>{d[0]}:</span> {d[1]}</li>))}
                </ul>
              </div>

              {t.discountAmount > 0 ? (
                <div className='reg-summary__row reg-summary__row--discount'>
                  <span className='reg-summary__label'>Discount{this.state.discountCode ? ' (' + this.state.discountCode + ')' : ''}</span>
                  <span className='reg-summary__amount'>&minus;{formatMoney(t.discountAmount)}</span>
                </div>
              ) : ''}

              {t.wantsShirt ? (
                <div className='reg-summary__item'>
                  <div className='reg-summary__row'>
                    <span className='reg-summary__label'>DC Vault T-Shirt</span>
                    <span className='reg-summary__amount'>{t.shirtIncluded ? 'Included' : formatMoney(t.apparelPrice)}</span>
                  </div>
                  <ul className='reg-summary__details'>
                    <li><span>Size:</span> {shirtSize || 'Not selected (coach will confirm)'}</li>
                  </ul>
                </div>
              ) : ''}

              {t.lateFee > 0 ? (
                <div className='reg-summary__row'>
                  <span className='reg-summary__label'>Late Fee</span>
                  <span className='reg-summary__amount'>{formatMoney(t.lateFee)}</span>
                </div>
              ) : ''}

              <div className='reg-summary__row reg-summary__row--muted'>
                <span className='reg-summary__label'>Online Processing Fee</span>
                <span className='reg-summary__amount'>{formatMoney(t.processingFee)}</span>
              </div>

              <div className='reg-summary__row reg-summary__row--total'>
                <span className='reg-summary__label'>Total</span>
                <span className='reg-summary__amount'>{formatMoney(t.total)}</span>
              </div>
            </div>
          </div>

          <a className='reg-link' onClick={this.toggleDiscount.bind(this)}>Have a Discount Code?</a>

          <div style={{display: this.state.showDiscount ? 'block' : 'none', marginTop: '12px'}}>
            <div className='reg-grid-2'>
              <input ref='discountBox' type='text' name='discount' placeholder='Discount Code' />
              <button type='button' className='reg-btn' onClick={this.applyDiscount.bind(this)}>Apply</button>
            </div>
            {errorContainer}
          </div>

          <p className='reg-subnote' style={{marginTop: '20px'}}>Click the button to process your payment through PayPal</p>
          <div className='reg-section' style={{textAlign: 'center'}}>
            <div id='paypal-button-container' />
          </div>
        </form>
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
              apiHelpers.sendConfirmationEmail(response.data.user.email, this.props.data)

              if (response.data.user.email !== athleteEmail) {
                apiHelpers.sendConfirmationEmail(athleteEmail, this.props.data)
              }
            }
          }
        })
      }
    })
  }

  render () {
    return (
      <div className='reg-center'>
        <form id='confirmation' className='reg-form' style={{textAlign: 'center'}}>
          <p className='reg-form__title'>{this.state.title}</p>
          <p style={{fontFamily: 'var(--rd-font-body)', color: '#374151', lineHeight: 1.6}}>{this.state.message}</p>
          <div className='reg-section'>
            <button type='button' className='reg-btn' onClick={() => { window.location.href = '/' }}>Home</button>
          </div>
        </form>
      </div>
    )
  }
}

class ProgressBar extends React.Component {
  render () {
    let steps = ['Packages', 'Athlete', 'Agreement', 'Payment', 'Done!']
    let current = this.props.pageNum

    return (
      <div className='reg-stepper'>
        <div className='reg-stepper__track'>
          {steps.map((label, i) => {
            let n = i + 1
            let cls = 'reg-step'
            if (n === current) {
              cls += ' reg-step--active'
            } else if (n < current) {
              cls += ' reg-step--done'
            }
            let content = (n < current || n === 5) ? (<i className='fa fa-check' />) : n
            return (
              <div className={cls} key={label}>
                <div className='reg-step__circle'>{content}</div>
                <div className='reg-step__label'>{label}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default Register
