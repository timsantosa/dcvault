import React from 'react'
import apiHelpers from './api-helpers'
const $ = window.$

const parseFormValues = apiHelpers.parseFormValues

class Competition extends React.Component {
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
        let newPageNum = this.state.pageNum + 2
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


    render () {
        window.scrollTo(0, 0)
        let progressBar = this.state.showBar ? (<ProgressBar pageNum={this.state.pageNum} />) : ''
        if (this.state.registrationOpen) {
            return (
                <section id='competition'>
                    <div className='containter'>
                        <div className='row'>
                            <div className='col-xs-12 col-md-6 col-md-push-3'>
                                <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}>If you have any trouble registering, wish to clarify any of the information, or would like to learn more about our events, please <a className='red-text' onClick={() => { document.getElementById('contact-button').click() }}>click here</a> to contact us.</p>
                            </div>
                        </div>
                        {this.state.currentPage}
                        {progressBar}
                        <div className='row'>
                            <div className='col-xs-12 col-md-6 col-md-push-3'>
                                <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}><span className='red-text'>Please Note:</span> Early registration is open until June 5th.</p>
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
                                <p className='section-header'><span className='red-text'>DC Vault</span> Independence Day Pole Vault Championships Registration</p>
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

        let required = ['fname', 'lname', 'email', 'dob', 'pr', 'team', 'usatf', 'emergency-contact', 'emergency-phone', 'emergency-relation', 'gender', 'state', 'accomplishments']
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

                        <div className ='form-row'>
                            <label>
                                <span className = 'required'>Personal Record (in meters)</span>
                                <input type = 'number' name = 'pr' step = '.01'/>
                            </label>
                        </div>

                        <div className = 'form-row'>
                            <label>
                                <span className = 'required'>Club/Team Name (Write N/A if unattached)</span>
                                <input type = 'text' name = 'team'/>
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
                                    For more information on USATF numbers, go to <a style={{color: '#C0282D'}} target='_blank' href='https://usatf.org'>USATF.org</a>. If you have a current number, but do not know it, you can look it up <a style={{color: '#C0282D'}} target='_blank' href='https://www.usatf.org/membership/help/number.asp'>here</a>. If you do not have a current number, you can join or renew <a style={{color: '#C0282D'}} target='_blank' href='http://www.usatf.org/Products---Services/Individual-Memberships.aspx'>here</a>.
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
                                <span className='required'>Accomplishments (Optional)</span>
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
        if (new Date('June 5, 2019' < new Date())) {
            price = 50
        } else {
            price = 35
        }


        this.state = {
            price: price,
            errorText: '',
        }
    }

    componentDidMount () {
        this.calculatePrice()
        $('#payment').submit((e) => {
            e.preventDefault()
        })
    }

    calculatePrice () {
        let price = this.state.price * 1.03
        price = parseFloat(price) < 10 ? 10 : price
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

        let currentPrice = (this.state.price)
        currentPrice = currentPrice < 10 ? (10).toFixed(2) : currentPrice.toFixed(2)
        let currentProcessingFee = ((this.state.price) * 0.03).toFixed(2)

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
                                    <p className='price-text'>Online Processing Fee: <span className='red-text'>${currentProcessingFee}</span></p>
                                </div>
                            </div>
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
                        message: 'Please check your email for Confirmation and Event information. Thank you!'
                    })

                    //Send the athlete a confirmation email
                    if (apiHelpers.validateEmail(athleteEmail)) {
                        apiHelpers.sendConfirmationEmail(athleteEmail)
                    }
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

export default Competition