import React from 'react'
import apiHelpers from './api-helpers'
const $ = window.$

const parseFormValues = apiHelpers.parseFormValues

class EventRegistration extends React.Component {
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

        if (newPageNum === 1) {
            this.setState({
                currentPage: (<Agreement advance={this.advance.bind(this)} />)
            })
        } else if (newPageNum === 2) {
            this.setState({
                currentPage: (<Payment advance={this.advance.bind(this)} data={this.state.data} />)
            })
        } else if (newPageNum === 3) {
            this.setState({
                currentPage: (<Confirmation advance={this.advance.bind(this)} data={this.state.data} />)
            })
        }

        this.forceUpdate()
    }

    componentDidMount () {
        this.setState({
            currentPage: (<AthleteInfo advance={this.advance.bind(this)} />),
            registrationOpen: true
        })
    }


    render () {
        window.scrollTo(0, 0)
        let progressBar = this.state.showBar ? (<ProgressBar pageNum={this.state.pageNum} />) : ''
        if (this.state.registrationOpen) {
            return (
                <section id='eventregistration'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-xs-12 col-md-6 col-md-push-3'>
                                <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}>If you have any trouble registering, wish to clarify any of the information, or would like to learn more about our events, please <a className='red-text' onClick={() => { document.getElementById('contact-button').click() }}>click here</a> to contact us.</p>
                            </div>
                        </div>
                        {this.state.currentPage}
                        {progressBar}
                        <div className='row'>
                            <div className='col-xs-12 col-md-6 col-md-push-3'>
                                <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}><a onClick={() => { document.getElementById('contact-button').click() }}>Contact us</a></p>
                            </div>
                        </div>
                    </div>
                </section>
            )
        } else {
            return (
                <section style={{minHeight: '90vh'}}>
                    <div className='container'>
                        <div className='row'>
                            <div className='col-xs-12 col-md-6 col-md-push-3'>
                                <p className='section-header'><span className='red-text'>DC Vault</span> Kids Camp Registration</p>
                                <p className='content-text intro-text' style={{textAlign: 'right'}}>- DC <span className='red-text'>Vault</span></p>
                            </div>
                        </div>
                    </div>
                </section>
            )
        }
    }
}



class AthleteInfo extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            errorText: [],
            showUSATFinfo: false,
            dateOptions: [],
            selectedEvent: '',
            afterPartyTickets: ''
        }
    }

    formatDOB () {
        let dob = $('input[name=dob]').val()
        let dobFormatted = apiHelpers.formatDate(dob)
        $('input[name=dob]').val(dobFormatted)
    }

    formatPhone () {
        let phoneFormatted = apiHelpers.formatPhone($('input[name=emergency-phone]').val())
        $('input[name=emergency-phone]').val(phoneFormatted)
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

    formatDateList (e) {
        const dateOptions = this.state.dateOptions
        let index

        if(e.target.checked){
            dateOptions.push(+e.target.value)
        } else{
            index = dateOptions.indexOf(+e.target.value)
            dateOptions.splice(index, 1)
        }

        this.setState({dateOptions: dateOptions})
    }

    handleEventChange (e) {
        this.setState({
            selectedEvent: e.target.value,
            afterPartyTickets: ''
        })
    }

    continue () {
        this.setState({
            errorText: []
        })

        let required = ['fname', 'lname', 'email', 'dob', 'pr', 'team', 'emergency-contact', 'emergency-phone', 'emergency-relation', 'gender', 'state', 'division']
        let complete = true

        let output = parseFormValues($('#event-athlete-info').serializeArray())

        // Build dates1 value with event and add-ons
        if (output.dates1) {
            let addOns = []
            if (output.afterparty === 'afterparty') {
                addOns.push('afterparty-' + (output['afterparty-tickets'] || '0'))
            }
            if (output.eventbag === 'eventbag') {
                addOns.push('eventbag')
            }
            if (addOns.length > 0) {
                output.dates1 = output.dates1 + ',' + addOns.join(',')
            }
        }

        if (output.email.length !== 0 && !apiHelpers.validateEmail(output.email)) {
            let errorText = this.state.errorText
            errorText.push('Please provide a valid email address')
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
                    <form id='event-athlete-info' className='form-labels-on-top'>

                    <div className='form-title-row'>
                            <h1>Event Registration</h1>
                            <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}>2026 Pole Vault Championships Registration is Open!
                                <br></br>
                            </p>
                    </div>

                    <div className='form-row'>
                    <label>
                        <span className='required'>Competition</span>
                    </label>

                    <div>
                        <input
                        type="radio"
                        name="dates1"
                        id="pvchamps26"
                        value="pvchamps26"
                        onChange={this.handleEventChange.bind(this)}
                        />
                        <label htmlFor="pvchamps26">&nbsp;&nbsp;2026 Pole Vault Championships ($50)</label>
                        <br />

                        <input
                        type="radio"
                        name="dates1"
                        id="family-pv-experience"
                        value="family-pv-experience"
                        onChange={this.handleEventChange.bind(this)}
                        />
                        <label htmlFor="family-pv-experience">&nbsp;&nbsp;Family Pole Vault Experience ($15)</label>
                        <br />

                        <input
                        type="radio"
                        name="dates1"
                        id="spring-fling-urself"
                        value="spring-fling-urself"
                        onChange={this.handleEventChange.bind(this)}
                        />
                        <label htmlFor="spring-fling-urself">&nbsp;&nbsp;Spring Fling - Urself Over a Bar! ($30)</label>
                        <br />
                    </div>
                    </div>

                    {this.state.selectedEvent === 'pvchamps26' && (
                        <div>
                            <div className='form-row'>
                                <label>
                                    <span>After Party - 18 and up only ($30)</span>
                                    <input
                                    type="checkbox"
                                    name="afterparty"
                                    value="afterparty"
                                    checked={this.state.afterparty === true}
                                    onChange={(e) =>
                                        this.setState({
                                        afterparty: e.target.checked,
                                        afterpartyTickets: e.target.checked ? (this.state.afterpartyTickets || '') : ''
                                        })
                                    }
                                    />
                                </label>
                            </div>

                        {this.state.afterparty && (
                            <div className='form-row'>
                                <label>
                                    <span>After Party Tickets</span>
                                    <select
                                        name="afterparty-tickets"
                                        value={this.state.afterpartyTickets || ''}
                                        onChange={(e) =>
                                            this.setState({ afterpartyTickets: e.target.value })
                                        }
                                    >
                                        <option value=''>Select number of tickets</option>
                                        <option value='1'>1 Ticket</option>
                                        <option value='2'>2 Tickets</option>
                                        <option value='3'>3 Tickets</option>
                                        <option value='4'>4 Tickets</option>
                                        <option value='5'>5 Tickets</option>
                                    </select>
                                </label>
                            </div>
                        )}

                            <div className='form-row'>
                                <label>
                                    <span>Event Bag ($85)</span>
                                    <input type="checkbox" name="eventbag" value="eventbag" />
                                </label>
                            </div>
                        </div>
                    )}

                    {this.state.selectedEvent !== 'pvchamps26' && this.state.selectedEvent !== '' && (
                        <div>
                            <input type='hidden' name='afterparty' value='n/a' />
                            <input type='hidden' name='eventbag' value='n/a' />
                        </div>
                    )}

                        <div className='form-title-row'>
                            <h1>Athlete Information</h1>
                        </div>
                        
                        {this.state.selectedEvent === 'pvchamps26' && (
                            <div>
                                <div className='form-row'>
                                    <label>
                                        <span className='required'>Are you a CURRENT member of DC Vault?</span>
                                        <select name='memberdisc'>
                                            <option value=''>Select yes/no</option>
                                            <option value='dcvault-member'>Yes</option>
                                            <option value='not-member'>No</option>
                                        </select>
                                    </label>
                                </div>
                                <div className='form-row'>
                                    <label>
                                        <span className='required'>Are you a registering for an Elite Division? (Standards - Men: 5.65m+ / Women: 4.3m+)</span>
                                        <select name='elitedisc'>
                                            <option value=''>Select yes/no</option>
                                            <option value='elite'>Yes</option>
                                            <option value='not-elite'>No</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        )}

                        {this.state.selectedEvent !== 'pvchamps26' && this.state.selectedEvent !== '' && (
                            <input type='hidden' name='memberdisc' value='n/a' />
                        )}

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
                                <span className='required'>Age</span>
                                <input type='number' name='age' />
                            </label>
                        </div>

                        <div className='form-row'>
                            <label>
                                <span className='required'>Athlete DOB (mm/dd/yyyy)</span>
                                <input type='text' name='dob' onChange={this.formatDOB.bind(this)} />
                            </label>
                        </div>

                        <div className='form-row'>
                            <label>
                                <span className='required'>Contact Email</span>
                                <input type='text' name='email' />
                            </label>
                        </div>

                        <div className ='form-row'>
                            <label>
                                <span className = 'required'>Personal Record (in meters)</span>
                                <input type = 'number' name = 'pr' step = '.01'/>
                            </label>
                        </div>

                        <div className = 'form-row'>
                            <label>
                                <span className = 'required'>Club/School Team Name (N/A if unattached)</span>
                                <input type = 'text' name = 'team'/>
                            </label>
                        </div>
                        
                        {this.state.selectedEvent === 'pvchamps26' && (
                            <div className='form-row'>
                                <label>
                                    <span className='required'>Division</span>
                                    <select name='division'>
                                        <option value=''>Select Division</option>
                                        <option value='Boys State Champs'>Boy's State Champions Division (High School State Champions Only!)</option>
                                        <option value='Girls State Champs'>Girl's State Champions Division (High School State Champions Only!)</option>
                                        <option value='Girls Elementary'>Elementary School Division - Girls (Ages 7-11 who attended 5th grade and under during Spring of 2025)</option>
                                        <option value='Boys Elementary'>Elementary School Division - Boys (Ages 7-11 who attended 5th grade and under during Spring of 2025)</option>
                                        <option value='Girls Middle School'>Middle School Division - Girls (Ages 11-14 who attended grades 6-8 during Spring of 2025)</option>
                                        <option value='Boys Middle School'>Middle School Division - Boys (Ages 11-14 who attended grades 6-8 during Spring of 2025)</option>
                                        <option value='Girls High School'>High School Division - Girls (Ages 14-18 who attended grades 9-12 in Spring of 2025)</option>
                                        <option value='Boys High School D1'>High School Division - Boys D1 PR 12'6"+(Ages 14-18 who attended grades 9-12 in Spring of 2025)</option>
                                        <option value='Boys High School D2'>High School Division - Boys D2 PR under 12'6" (Ages 14-18 who attended grades 9-12 in Spring of 2025) </option>
                                        <option value='Womens Adult'>Open Adult Division - Women</option>
                                        <option value='Mens Adults'>Open Adult Division - Men</option>
                                        <option value='Mens Emerging Elite'>Men’s Emerging Elite Division (PR of 4.57m/15'1" or higher)</option>
                                        <option value='Mens Elite'>Elite Women (PR of 4.3m or higher)</option>
                                        <option value='Womens Elite'>Elite Men (PR of 5.65m or higher)</option>
                                    </select>
                                </label>
                            </div>
                        )}

                        {this.state.selectedEvent !== 'pvchamps26' && this.state.selectedEvent !== '' && (
                            <input type='hidden' name='division' value='n/a' />
                        )}

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
                                <span>Accomplishments (Optional)</span>
                                <textarea rows='6' cols='40' name='accomplishments' />
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

        let output = parseFormValues($('#event-agreement').serializeArray())

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
                    <form id='event-agreement' className='form-labels-on-top'>
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
                        <br></br>
                        <p style={{fontSize: '12px', fontWeight: 'normal'}}> By signing below and clicking 'continue' you also agree to notify us if you or anyone in your family has tested positive for COVID-19. You will also notify us if you have any of the following <a style={{color: '#C0282D'}} target='_blank' href='https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html'>symptoms</a> the week of the event.</p>

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
        let price = 0
        
        // Parse dates1 to extract individual items and calculate price
        if(this.props.data.athleteInfo.dates1){
            let items = this.props.data.athleteInfo.dates1.split(',').map(item => item.trim())
            
            for(let item of items) {
                if(item === 'pvchamps26') {
                    // Apply member or elite discount
                    if(this.props.data.athleteInfo.memberdisc === "dcvault-member" || this.props.data.athleteInfo.elitedisc === "elite") {
                        price += 5
                    } else {
                        price += 50
                    }
                } else if(item === 'family-pv-experience') {
                    price += 15
                } else if(item === 'spring-fling-urself') {
                    price += 30
                } else if(item.startsWith('afterparty-')) {
                    let ticketCount = parseInt(item.split('-')[1])
                    price += (30 * ticketCount)
                } else if(item === 'eventbag') {
                    price += 85
                }
            }
        }

        this.state = {
            price: price,
            errorText: '',
        }
    }

    componentDidMount () {
        this.calculatePrice()
        $('#event-payment').submit((e) => {
            e.preventDefault()
        })
    }

    calculatePrice () {
        let price = this.state.price * 1.03
        this.renderButton(price)
    }

    renderButton (amount) {
        amount = parseFloat(amount)

        var cont = this.continue.bind(this)
        var dateLst = ""
        if(this.props.data.athleteInfo.dates1){
            dateLst += this.props.data.athleteInfo.dates1 + ", "
        }
        if(this.props.data.athleteInfo.dates2){
            dateLst += this.props.data.athleteInfo.dates2 + ", "
        }
        if(this.props.data.athleteInfo.dates3){
            dateLst += this.props.data.athleteInfo.dates3 + ", "
        }
        if(this.props.data.athleteInfo.dates4){
            dateLst += this.props.data.athleteInfo.dates4 + ", "
        }
        if(this.props.data.athleteInfo.dates5){
            dateLst += this.props.data.athleteInfo.dates5 + ", "
        }
        if(this.props.data.athleteInfo.dates6){
            dateLst += this.props.data.athleteInfo.dates6 + ", "
        }
        if(this.props.data.athleteInfo.dates7){
            dateLst += this.props.data.athleteInfo.dates7 + ", "
        }
        if(this.props.data.athleteInfo.dates8){
            dateLst += this.props.data.athleteInfo.dates8 + ", "
        }
        if(this.props.data.athleteInfo.dates9){
            dateLst += this.props.data.athleteInfo.dates9 + ", "
        }
        if(this.props.data.athleteInfo.dates10){
            dateLst += this.props.data.athleteInfo.dates10 + ", "
        }
        this.props.data.athleteInfo.dates1 = dateLst
        
        // Parse dates1 to extract add-on details for payment description
        let addOnDetails = ''
        if(this.props.data.athleteInfo.dates1){
            let items = this.props.data.athleteInfo.dates1.split(',').map(item => item.trim())
            let addOns = []
            for(let item of items) {
                if(item.startsWith('afterparty-')) {
                    let ticketCount = item.split('-')[1]
                    addOns.push('After Party (' + ticketCount + ' tickets)')
                } else if(item === 'eventbag') {
                    addOns.push('Event Bag')
                }
            }
            if(addOns.length > 0) {
                addOnDetails = '\nAdd-ons: ' + addOns.join(', ')
            }
        }
        
        var paymentDescription = 'Athlete Name: ' + this.props.data.athleteInfo.fname + ' ' + this.props.data.athleteInfo.lname + '\nState: ' + this.props.data.athleteInfo.state + '\nDivision: ' + this.props.data.athleteInfo.division + '\nAthlete Email: ' + this.props.data.athleteInfo.email + '\nCompetitions: ' + dateLst + addOnDetails


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
        this.props.advance('event-payment', {
            paymentId: data.paymentID,
            payerId: data.payerID
        })
    }



    render () {
        let errorContainer
        if (!(this.state.errorText.length === 0)) {
            errorContainer = <div className='row'>
                <div className='error-container'>
                    <p>{this.state.errorText}</p>
                </div>
            </div>
        }

        let currentPrice = (this.state.price)
        let currentProcessingFee = ((this.state.price) * 0.03).toFixed(2)

        return (
            <div className='row'>
                <div className='col-xs-12' style={{textAlign: 'center'}}>
                    <form id='event-payment' className='form-labels-on-top'>
                        <div className='form-title-row'>
                            <h1>Finalize Payment</h1>
                        </div>

                        <div className='form-row'>
                            <div className='row'>
                                <div className='col-xs-12' style={{textAlign: 'center'}}>
                                    <p className='price-text'>Registration Fee: <span className='red-text'>${currentPrice}</span></p>
                                    <p className='price-text'>Online Processing Fee: <span className='red-text'>${currentProcessingFee}</span></p>
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

        apiHelpers.finalizeEventPayment(this.props.data)
            .then((response) => {
                if (!response.data.ok) {
                    this.setState({
                        title: 'Uh-oh...',
                        message: 'There was an error storing your payment information. Please email it@dcvault.com to verify that your payment went through, or recieve help to fix the issue if not.'
                    })
                } else {
                    this.setState({
                        title: 'Success!',
                        message: 'Please check your email for Confirmation and Event information. Thank you!'
                    })

                    //Send the athlete a confirmation email
                    if (apiHelpers.validateEmail(athleteEmail)) {
                        apiHelpers.sendDMVEventConfirmationEmail(athleteEmail, this.props.data)
                    }
                }
            })
    }

    render () {
        return (
            <div className='row'>
                <div className='col-xs-12' style={{textAlign: 'center'}}>
                    <form id='event-confirmation' className='form-labels-on-top'>
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
                        <div style={this.props.pageNum === 0 ? onStyle : offStyle} />
                        <p>Athlete</p>
                    </div>
                    <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
                        <div style={this.props.pageNum === 1 ? onStyle : offStyle} />
                        <p>Agreement</p>
                    </div>
                    <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
                        <div style={this.props.pageNum === 2 ? onStyle : offStyle} />
                        <p>Payment</p>
                    </div>
                    <div className='col-xs-2 col-xs-push-1 progress-text' style={{textAlign: 'center'}}>
                        <div style={this.props.pageNum === 3 ? onStyle : offStyle} />
                        <p>Done!</p>
                    </div>

                </div>
            </div>
        )
    }
}

export default EventRegistration