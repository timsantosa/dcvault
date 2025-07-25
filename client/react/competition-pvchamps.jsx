import React from 'react'
import apiHelpers from './api-helpers'
import { loadPayPalSDK } from './paypal-helpers'
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
            currentPage: (<AthleteInfo advance={this.advance.bind(this)} />),
            registrationOpen: true
        })
    }


    render () {
        window.scrollTo(0, 0)
        let progressBar = this.state.showBar ? (<ProgressBar pageNum={this.state.pageNum} />) : ''
        if (this.state.registrationOpen) {
            return (
                <section id='competition'>
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
                                <p className='info-text' style={{textAlign: 'center', fontStyle: 'italic'}}><a onClick="document.getElementById('contact-button').click()">Contact us</a></p>
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
            dateOptions: []
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

    //Link on how to get the list of check boxes
    //https://stackoverflow.com/questions/37129437/how-do-i-use-react-and-forms-to-get-an-array-of-checked-checkbox-values
    formatDateList (e) {
        //current array of options
        const dateOptions = this.state.dateOptions
        let index

        // check if the check box is checked or unchecked
        if(e.target.checked){
            //add the numerical value of the checkbox to options array
            dateOptions.push(+e.target.value)
        } else{
            // or remove the value from the unchecked checkbox from the array
            index = dateOptions.indexOf(+e.target.value)
            dateOptions.splice(index, 1)
        }

        // update the state with the new array of options
        this.setState({dateOptions: dateOptions})
    }

    continue () {
        this.setState({
            errorText: []
        })

        let required = ['fname', 'lname', 'email', 'dob', 'emergency-contact', 'emergency-phone', 'emergency-relation', 'gender', 'state','pr','division']
        let complete = true

        let output = parseFormValues($('#event-athlete-info').serializeArray())


        if (output.email.length !== 0 && !apiHelpers.validateEmail(output.email)) {
            let errorText = this.state.errorText
            errorText.push('Please provide a valid email address')
            this.setState({
                errorText: errorText
            })
            complete = false
        }

        /*
        if (output.usatf.length !== 0 && output.usatf.length !== 10) {
            let errorText = this.state.errorText
            errorText.push('Please provide a valid USATF membership number')
            this.setState({
                errorText: errorText
            })
            complete = false
        }
        */

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


    // <div className='form-row'>
    //                     <label>
    //                         <span className='required'>Weeks</span>
    //                         <input type ="checkbox" name="dates1" value="jul10-14"/>
    //                         <label for="jul10-14">&nbsp;&nbsp;Jul 10th - Jul 14th</label>
    //                         <br></br>
    //                         <input type ="checkbox" name="dates2" value="jul17-21"/>
    //                         <label for="jul17-21">&nbsp;&nbsp;Jul 17th - Jul 21st</label>
    //                         <br></br>
    //                         <input type ="checkbox" name="dates3" value="jul24-28"/>
    //                         <label for="jul24-28">&nbsp;&nbsp;Jul 24th - Jul 28th</label>
    //                         <br></br>
    //                         <input type ="checkbox" name="dates4" value="jul31-aug4"/>
    //                         <label for="jul31-aug4">&nbsp;&nbsp;Jul 31st - Aug 4th</label>
    //                         <br></br>
    //                         <input type ="checkbox" name="dates5" value="aug7-11"/>
    //                         <label for="aug7-11">&nbsp;&nbsp;Aug 7th - Aug 11th</label>
    //                         <br></br>
    //                     </label>
    //                 </div>

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
                            <h1>2024 Pole Vault Championships Registration</h1>
                    </div>

                    <div className='form-row'>
                        <label>
                            <input type ="checkbox" name="dates1" value="24pvchamps" checked/>
                            <label for="24pvchamps">&nbsp;&nbsp;2024 PV Championships</label>
                            <br></br>
                        </label>
                    </div>


                        <div className='form-title-row'>
                            <h1>Athlete Information</h1>
                        </div>
                        <div className='form-row'>
                            <label>
                                <span className='required'>Are you a CURRENT member of DC Vault?</span>
                                <select name='member'>
                                    <option value=''>Select yes/no</option>
                                    <option value='dcvault-member'>Yes</option>
                                    <option value='not-member'>No</option>
                                </select>
                            </label>
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
                        <div className='form-row'>
                            <label>
                                <span className='required'>Division</span>
                                <select name='division'>
                                    <option value=''>Select Division (see event info for division classifications)</option>
                                    <option value='Elementary'>Elementary</option>
                                    <option value='Middle School'>Middle School</option>
                                    <option value='High School'>High School</option>
                                    <option value='Open Adult'>Open Adult</option>
                                    <option value='Emerging Elite'>Emerging Elite</option>
                                    <option value='Elite'>Elite</option>


                                </select>
                            </label>
                        </div>
                        <div className='form-row'>
                            <label>
                                <span className='required'>Contact Email</span>
                                <input type='text' name='email' />
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
                    <form id='event-agreement' className='form-labels-on-top'>
                        <div className='form-title-row'>
                            <h1>Agreement</h1>
                        </div>
                        <img className='waiver-image' src='../img/forms/adult-comp-1.png' />
                        <img className='waiver-image' src='../img/forms/adult-comp-2.png' />
                        <img className='waiver-image' src='../img/forms/adult-comp-3.png' />
                        <img className='waiver-image' src='../img/forms/youth-comp-1.png' />
                        <img className='waiver-image' src='../img/forms/youth-comp-2.png' />
                        <img className='waiver-image' src='../img/forms/youth-comp-3.png' />
                        <p style={{fontSize: '12px', fontWeight: 'normal'}}> By signing below and clicking 'continue' you agree to notify us if you or anyone in your family has tested positive for COVID-19. You will also notify us if you have any of the following <a style={{color: '#C0282D'}} target='_blank' href='https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html'>symptoms</a> the week of the camp.</p>

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
        let numWeeks = 0
        if(this.props.data.athleteInfo.dates1){
            if(this.props.data.athleteInfo.member == "dcvault-member"){
                price = 25
            }else{
                price+=50
            }
            numWeeks+=1
          }
          if(this.props.data.athleteInfo.dates2){
            price+=350
            numWeeks+=1
          }
          if(this.props.data.athleteInfo.dates3){
            price+=350
            numWeeks+=1          }
          if(this.props.data.athleteInfo.dates4){
            price+=350
            numWeeks+=1          }
          if(this.props.data.athleteInfo.dates5){
            price+=350
            numWeeks+=1          }
          if(this.props.data.athleteInfo.dates6){
            price+=25          }
          if(this.props.data.athleteInfo.dates7){
            price+=25          }
          if(this.props.data.athleteInfo.dates8){
            price+=25          }
          if(this.props.data.athleteInfo.dates9){
            price+=25          }
          if(this.props.data.athleteInfo.dates10){
            price+=25          }
        let disc = 0
        if(numWeeks >= 4){
            disc = price * .10
            price = price - disc
        }
        this.state = {
            price: price,
            discount: disc,
            errorText: '',
        }
    }

    componentDidMount () {
        $('#event-payment').submit((e) => {
            e.preventDefault()
        })
        
        // Load PayPal SDK and render button
        this.loadPayPalButton()
    }

    loadPayPalButton() {
        loadPayPalSDK().then((paypal) => {
            paypal.Buttons({
                createOrder: this.createOrder.bind(this),
                onApprove: this.onApprove.bind(this),
                style: {
                    layout: "horizontal",
                    color: "silver",
                    shape: "rect",
                    label: "pay"
                }
            }).render('#paypal-button-container');
        }).catch((error) => {
            console.error('Failed to load PayPal SDK:', error);
            this.setState({
                errorText: 'Failed to load payment system. Please refresh the page and try again.'
            });
        });
    }

    createOrder(data, actions) {
        let amount = parseFloat(this.state.price * 1.03)
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
        var paymentDescription = 'Athlete Name: ' + this.props.data.athleteInfo.fname + ' ' + this.props.data.athleteInfo.lname + '\n State:' + this.props.data.athleteInfo.state + '\n Division: ' + this.props.data.athleteInfo.division +  '\nAthlete Email: ' + this.props.data.athleteInfo.email + 'Competitions: ' + dateLst

        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: amount.toFixed(2),
                        currency_code: "USD"
                    },
                    description: paymentDescription
                }
            ]
        })
    }

    onApprove(data, actions) {
        return actions.order.capture().then((details) => {
            this.continue({
                paymentID: details.id,
                payerID: details.payer.payer_id
            })
        })
    }

    continue (data) {
        this.props.advance('event-payment', {
            paymentId: data.paymentID,
            payerId: data.payerID
        })
    }



    // fillInfo() {
    //   this.props.advance('payment', {paymentId: 'paymentID==2348759012834570', payerId: 'payerID==9018245709284'})
    // }
    // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>

//this is for fly kids registration. It should be entered between line 747/748
//                                    <p className='price-text'>4+ Week Signup Discount: <span className='red-text'>-${currentDiscount}</span></p>

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
        let currentDiscount = (this.state.discount)
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
                        apiHelpers.sendEventConfirmationEmail(athleteEmail, this.props.data)
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

export default Competition
