import React from 'react';
import {render} from 'react-dom';
import apiHelpers from './api-helpers';
// import initPaypal from '../js/payment';

const parseFormValues = (array) => {
  let retVal = {}
  for (let i = 0; i < array.length; i++) {
    retVal[array[i].name] = array[i].value
  }

  return retVal;
}

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: '',
      pageNum: 0,
      data: {},
      showBar: false
    }
  }

  advance(page, info) {
    let updatedData = this.state.data;
    let newPageNum = this.state.pageNum + 1;
    updatedData[page] = info;
    this.setState({
      pageNum: newPageNum,
      data: updatedData
    });

    if (newPageNum === 2) {
      this.setState({
        currentPage: (<AthleteInfo advance={this.advance.bind(this)}/>)
      });
    } else if (newPageNum === 3) {
      this.setState({
        currentPage: (<Agreement advance={this.advance.bind(this)}/>)
      });
    } else if (newPageNum === 4) {
      this.setState({
        currentPage: (<Payment advance={this.advance.bind(this)} data={this.state.data}/>)
      });
    } else if (newPageNum === 5) {
      this.setState({
        currentPage: (<Confirmation advance={this.advance.bind(this)} data={this.state.data}/>)
      });
    }

    this.forceUpdate();

    console.log(this.state.data);
  }

  componentDidMount() {
    this.isLoggedIn();
  }

  isLoggedIn() {
    const loginDiv = document.getElementById('login');
    const loginButton = document.getElementById('login-button');
    apiHelpers.verifyToken().then((answer) => {
      if (answer) {
        loginButton.innerHTML = 'My Account';
        loginButton.onclick = () => {
          window.location.href = '/account';
        }
        this.setState({
          currentPage: (<SelectPackage advance={this.advance.bind(this)}/>),
          pageNum: 1,
          showBar: true
        });
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1;
          loginDiv.style.visibility = 'visible';
        };
        this.setState({
          currentPage: (
            <div className="row">
              <div className="col-xs-12" style={{textAlign: 'center'}}>
                <p className="subsection-header">You Must be Logged in to <span className="red-text">Register for Training</span></p>
                <a className="red-text center-content" onClick={() => {loginButton.click()}}>Login/Register</a>
              </div>
            </div>
          )
        });

        console.log(this.state.currentPage);
      }
    });
  }

  render() {
    window.scrollTo(0, 0);
    let progressBar = this.state.showBar ? (<ProgressBar pageNum={this.state.pageNum}/>) : '';
    return (
      <section id="register">
        <div className="containter">
          {this.state.currentPage}
          {progressBar}
        </div>
      </section>
    );
  }
}

class SelectPackage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      errorText: ''
    }
  }

  continue() {
    this.setState({
      errorText: ''
    });

    let output = {};

    output.quarter = $('input[name="quarter"]:checked').val();
    output.group = $('input[name="group"]:checked').val();
    output.facility = $('input[name="facility"]:checked').val();

    console.log(output);

    if (output.quarter === undefined || output.group === undefined || output.facility === undefined) {
      this.setState({
        errorText: 'Please fill in all required fields'
      });
    } else {
      this.props.advance('selectPackage', output);
    }
  }

  // fillInfo() {
  //   this.props.advance ('selectPackage', {quarter: 'fall', group: 'beginner', facility: 'dcv'});
  // }

  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>


  render() {
    let errorContainer;
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
          <div className='error-container'>
            <p>{this.state.errorText}</p>
          </div>

        </div>;
    }

    return (
      <div className="row">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
            <form id="select-package" className="form-labels-on-top">

              <div className="form-title-row">
                  <h1>Select Training Package</h1>
              </div>
              <div className="form-row">
                  <label><span className='required'>Quarter</span></label>
                  <div className="form-radio-buttons">
                      <div>
                          <label>
                              <input type="radio" name="quarter" value="fall"/>
                              <span>Fall</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="quarter" value="winter"/>
                              <span>Winter</span>
                          </label>
                      </div>
                  </div>
              </div>

              <div className="form-row">
                  <label><span className='required'>Training Group</span></label>
                  <div className="form-radio-buttons">
                      <div>
                          <label>
                              <input type="radio" name="group" value="beginner"/>
                              <span>Beginner (Level I)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="group" value="intermediate"/>
                              <span>Intermediate (Level II)</span>
                          </label>
                      </div>
                  </div>
              </div>

              <div className="form-row">
                  <label><span className='required'>Training Facility</span></label>
                  <div className="form-radio-buttons">
                      <div>
                          <label>
                              <input type="radio" name="facility" value="dcv"/>
                              <span>Washington, DC (DCV)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="facility" value="balt"/>
                              <span>Baltimore, MD (BALT)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="facility" value="pa"/>
                              <span>Mercersburg, PA (PA)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="facility" value="prep"/>
                              <span>North Bethesda, MD (PREP)</span>
                          </label>
                      </div>
                  </div>
              </div>

              {errorContainer}

              <div className="form-row">
                  <button type="button" onClick={this.continue.bind(this)}>Continue</button>
              </div>

          </form>
        </div>
      </div>
    );
  }
}

class AthleteInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorText: []
    };
  }

  formatDOB() {
    let dob = $('input[name=dob]').val();
    let dobFormatted = apiHelpers.formatDate(dob);
    $('input[name=dob]').val(dobFormatted);
  }

  formatPhone() {
    $('input[name=emergency-phone]').val(apiHelpers.formatPhone($('input[name=emergency-phone]').val()));
  }

  formatUSATF() {
    let usatf = $('input[name=usatf]').val().split('');
    let usatfFormatted = []
    for (let digit of usatf) {
      if (('0123456789').indexOf(digit) !== -1) {
        usatfFormatted.push(digit);
      }
    }
    $('input[name=usatf]').val(usatfFormatted.slice(0, 10).join(''));
  }

  continue() {
    this.setState({
      errorText: []
    });

    let required = ['fname', 'lname', 'email', 'dob', 'usatf', 'emergency-contact', 'emergency-phone', 'emergency-relation', 'gender', 'state', 'conditions'];
    let complete = true;

    let output = parseFormValues($('#athlete-info').serializeArray());

    if(output.email.length !== 0 && !apiHelpers.validateEmail(output.email)) {
      let errorText = this.state.errorText;
      errorText.push('Please provide a valid email address');
      this.setState({
        errorText: errorText
      });
      complete = false;
    }

    if(output.usatf.length !== 0 && output.usatf.length !== 10) {
      let errorText = this.state.errorText;
      errorText.push('Please provide a valid USATF membership number');
      this.setState({
        errorText: errorText
      });
      complete = false;
    }

    if(output.dob.length !== 0 && output.dob.length !== 10) {
      let errorText = this.state.errorText;
      errorText.push('Please provide a valid date of birth (MM/DD/YYYY)');
      this.setState({
        errorText: errorText
      });
      complete = false;
    }

    if(output['emergency-phone'].length !== 0 && output['emergency-phone'].length !== 12) {
      let errorText = this.state.errorText;
      errorText.push('Please provide a valid emergency contact phone number');
      this.setState({
        errorText: errorText
      });
      complete = false;
    }

    for (let field of required) {
      if (output[field].length === 0) {
        let errorText = this.state.errorText;
        errorText.push('Please fill in all required fields');
        this.setState({
          errorText: errorText
        });
        complete = false;
        break;
      }
    }

    if (complete) {
      this.props.advance('athleteInfo', output);
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


  render() {
    let errorContainer;
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
          <div className='error-container'>
            {this.state.errorText.map((error) => {
              return <p key={error}>{error}</p>
            })}
          </div>
        </div>;
    }

    return (
      <div className="row">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
            <form id="athlete-info" className="form-labels-on-top">

              <div className="form-title-row">
                  <h1>Athlete Information</h1>
              </div>

              <div className="row">
                <div className="col-xs-12 col-md-6">
                  <div className="form-row">
                    <label>
                      <span className='required'>Athlete First Name</span>
                      <input type="text" name="fname" style={{width: '100%'}}/>
                    </label>
                  </div>
                </div>

                <div className="col-xs-12 col-md-6">
                  <div className="form-row">
                    <label>
                      <span className='required'>Athlete Last Name</span>
                      <input type="text" name="lname" style={{width: '100%'}}/>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label>
                  <span className='required'>Athlete DOB (mm/dd/yyyy)</span>
                  <input type="text" name="dob" onChange={this.formatDOB.bind(this)}/>
                </label>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Athlete Email</span>
                      <input type="text" name="email"/>
                  </label>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Athlete USATF Number</span>
                      <input type="text" name="usatf" onChange={this.formatUSATF.bind(this)}/>
                  </label>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Emergency Contact Name</span>
                      <input type="text" name="emergency-contact"/>
                  </label>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Emergency Contact Relation</span>
                      <input type="text" name="emergency-relation"/>
                  </label>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Emergency Contact Phone</span>
                      <input type="text" name="emergency-phone" onChange={this.formatPhone.bind(this)}/>
                  </label>
              </div>

              <div className="form-row">
                <label>
                  <span className='required'>Athlete Gender</span>
                  <select name="gender">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other/Non-Binary</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span className='required'>State of Residence</span>
                  <select name="state">
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="DC">Dist of Columbia</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                  <label>
                      <span>Current School (optional)</span>
                      <input type="text" name="school"/>
                  </label>
              </div>

              <div className="form-row">
                <label>
                  <span className='required'>Medical Conditions</span>
                  <span style={{textSize: '75%', fontWeight: 'normal'}}> If none, write 'none' </span>
                  <textarea rows="6" cols="40" name="conditions"/>
                </label>
              </div>

              {errorContainer}

              <div className="form-row">
                  <button type="button" onClick={this.continue.bind(this)}>Continue</button>
              </div>

          </form>
        </div>
      </div>
    );
  }
}


class Agreement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorText: ''
    };
  }

  formatDate() {
    let date = $('input[name=date]').val();
    let dateFormatted = apiHelpers.formatDate(date);
    $('input[name=date]').val(dateFormatted);
  }

  componentDidMount() {
    let today = new Date();
    let year = today.getFullYear();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }

    $('input[name=date]').val(month + '/' + day + '/' + year);
  }

  continue() {
    this.setState({
      errorText: ''
    });

    let output = parseFormValues($('#agreement').serializeArray());

    if (!output.hasOwnProperty('name') || !output.hasOwnProperty('date')) {
      this.setState({
        errorText: 'Please fill in all fields'
      });
    } else if (output.date.length !== 10) {
      this.setState({
        errorText: 'Please input a valid date'
      });
    } else {
      this.props.advance('agreement', output);
    }

  }

  // fillInfo() {
  //   this.props.advance('agreement', {name: 'Signatory Jones', date: '01/23/2562'});
  // }

  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>


  render() {

    let errorContainer;
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
          <div className='error-container'>
            <p>{this.state.errorText}</p>
          </div>
        </div>;
    }

    return (
      <div className="row">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
          <form id="agreement" className="form-labels-on-top">
              <div className="form-title-row">
                  <h1>Waiver Agreement</h1>
              </div>

              <img className="waiver-image" src="../img/forms/release-form-dcv.png"/>
              <img className="waiver-image" src="../img/forms/release-form-gtown.png"/>

              <p style={{fontSize: '12px', fontWeight: 'normal'}}> By signing below and clicking 'continue' you agree that you (the adult athlete or the athlete's legal guardian) agree with the above waivers. You may <a style={{color: '#C0282D'}} href='../files/release-form.pdf' target='_blank'>click here</a> to view the waivers as a PDF</p>

              <div className="row">
                <div className="col-xs-12 col-md-6">
                  <div className="form-row">
                    <label>
                      <span className='required'>Full Name</span>
                      <input type="text" name="name" style={{width: '100%'}}/>
                    </label>
                  </div>
                </div>

                <div className="col-xs-12 col-md-6">
                  <div className="form-row">
                    <label>
                      <span className='required'>Date (mm/dd/yyyy)</span>
                      <input type="text" name="date" style={{width: '100%'}} onChange={this.formatDate.bind(this)}/>
                    </label>
                  </div>
                </div>
              </div>

              {errorContainer}

              <div className="form-row">
                  <button type="button" onClick={this.continue.bind(this)}>Continue</button>
              </div>

          </form>
        </div>
      </div>
    );
  }
}



class Payment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      price: 550,
      discount: 0,
      errorText: '',
      showDiscount: false,
      discountCode: '',
    }
  }

  componentDidMount() {
    this.calculatePrice();
    $('#payment').submit((e) => {
      e.preventDefault();
    });
  }

  calculatePrice() {
    let price = (this.state.price * (1 - this.state.discount)) * 1.03
    this.renderButton(price);
  }

  renderButton(amount) {

    amount = parseFloat(amount) < 10 ? 10 : amount

    var cont = this.continue.bind(this);
    var paymentDescription = 'Athlete Name: ' + this.props.data.athleteInfo.fname + ' ' + this.props.data.athleteInfo.lname + '\nAthlete Email: ' + this.props.data.athleteInfo.email;

    paypal.Button.render({
    env: 'production', // sandbox | production
    client: {
      sandbox:    window.configVariables.PAYPAL_CLIENT_ID,
      production: window.configVariables.PAYPAL_CLIENT_ID
    },
    commit: true,

    style: {
      size: 'responsive',
      shape: 'rect',
      color: 'silver',
      label: 'pay'
    },

    payment: function(data, actions) {
      return actions.payment.create({
        payment: {
          transactions: [
            {
              amount: { total: amount.toFixed(2), currency: 'USD' },
              note_to_payee: paymentDescription
            }
          ]
        }
      });
    },

    // onAuthorize() is called when the buyer approves the payment
    onAuthorize: function(data, actions) {
      return actions.payment.execute().then(function() {
        cont(data);
      });
    }

    }, '#paypal-button-container');
  }

  continue(data) {

    this.props.advance('payment', {
      paymentId: data.paymentID,
      payerId: data.payerID,
      discount: this.state.discountCode
    });
  }

  applyDiscount() {

    console.log('applying discount', this.refs.discountBox.value);

    this.setState({
      errorText: ''
    });
    let code = this.refs.discountBox.value;

    if (code.length === 0) {
      this.setState({
        errorText: 'You did not enter a code'
      });
    } else {
      apiHelpers.getDiscountAmount(code)
      .then((response) => {
        let info = response.data;
        if (!info || !info.ok) {
          this.setState({
            errorText: 'Invalid or Expired Code'
          })
        } else {
          let discountAmount = info.amount;
          this.setState({
            discount: discountAmount,
            discountCode: info.code
          });
          document.getElementById('paypal-button-container').innerHTML = '';
          this.calculatePrice();
        }
      })
    }
  }

  toggleDiscount() {
    this.setState({
      showDiscount: !(this.state.showDiscount)
    });
  }

  // fillInfo() {
  //   this.props.advance('payment', {paymentId: 'paymentID==2348759012834570', payerId: 'payerID==9018245709284'})
  // }
  // <a style={{color: '#C0282D', fontSize: '25px'}} onClick={this.fillInfo.bind(this)}>FILL INFO</a>

  render() {

    let errorContainer;
    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
          <div className='error-container'>
            <p>{this.state.errorText}</p>
          </div>
        </div>;
    }

    let currentPrice = (this.state.price * (1 - this.state.discount));
    currentPrice = currentPrice < 10 ? (10).toFixed(2) : currentPrice.toFixed(2);
    let currentProcessingFee = ((this.state.price * (1 - this.state.discount)) * .03).toFixed(2);


    return (
      <div className="row">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
          <form id="payment" className="form-labels-on-top">
              <div className="form-title-row">
                  <h1>Finalize Payment</h1>
              </div>


              <div className="form-row">
                <div className="row">
                  <div className="col-xs-12" style={{textAlign:'center'}}>
                      <p className="price-text">Registration Fee: <span className="red-text">${currentPrice}</span></p>
                      <p className="price-text">Online Processing Fee: <span className="red-text">${currentProcessingFee}</span></p>
                  </div>
                </div>
              </div>

              <a  style={{color: '#C0282D'}} onClick={this.toggleDiscount.bind(this)}> Have a Discount Code? </a>

              <div className="form-row" style={{visibility: this.state.showDiscount ? 'visible' : 'hidden'}}>
                <div className="row">
                  <div className="col-xs-8">
                      <label>
                      <span>Discount Code</span>
                      <input ref="discountBox" type="text" name="discount" style={{width: '100%'}}/>
                    </label>
                  </div>
                  <div className="col-xs-4">
                    <button type="button" onClick={this.applyDiscount.bind(this)}>Apply</button>
                  </div>
                </div>
                {errorContainer}
              </div>

              <p style={{fontSize: '14px', fontWeight: 'normal', marginTop: '20px'}}>Click the button to process your payment through PayPal</p>
              <div className="form-row" style={{textAlign: 'center'}}>
                <div id="paypal-button-container"></div>
              </div>
          </form>
        </div>
      </div>
    );
  }
}

class Confirmation extends React.Component {
  constructor(props) {
    super(props);

    let athleteEmail = this.props.data.athleteInfo.email;

    this.state = {
      title: 'Loading...',
      message: 'Please wait, your purchase is being processed'
    }

    apiHelpers.finalizePayment(this.props.data)
    .then((response) => {
      if (!response.data.ok) {
        console.log(response);
        this.setState({
          title: 'Uh-oh...',
          message: 'There was an error storing your payment information. Please email it@dcvault.com to verify that your payment went through, or fix the issue if not.'
        });
      } else {
        this.setState({
          title: 'Success!',
          message: 'Please check your email for Confirmation and Training information. Thank you!'
        });
        apiHelpers.getUserData()
        .then((response) => {
          if (response.data.ok) {
            if (response.data.user.email && apiHelpers.validateEmail(response.data.user.email)) {
              apiHelpers.sendConfirmationEmail(response.data.user.email);

              if (response.data.user.email !== athleteEmail) {
                apiHelpers.sendConfirmationEmail(athleteEmail);
              }
            }
          }
        });
      }
    })
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
          <form id="confirmation" className="form-labels-on-top">
              <div className="form-title-row">
                  <h1>{this.state.title}</h1>
              </div>
              <p style={{fontSize: '14px', fontWeight: 'normal'}}> {this.state.message} </p>
              <div className="form-row" style={{textAlign: 'center'}}>
                  <button type="button" onClick={() => {window.location.href = '/'}}>Home</button>
              </div>
          </form>
        </div>
      </div>
    );
  }
}


class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let offStyle = {width: '0px', height: '0px', padding: '5px', border: '1px solid black', borderRadius: '10px', backgroundColor: '#AAA', margin: '0 auto'};
    let onStyle = {width: '0px', height: '0px', padding: '5px', border: '1px solid black', borderRadius: '10px', backgroundColor: '#C0282D', margin: '0 auto'};

    return (
      <div className="container" style={{marginTop: '35px'}}>
        <div className="row">
          <div className="col-xs-2 col-xs-push-1" style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 1 ? onStyle : offStyle}></div>
            <p>Choose Training Options</p>
          </div>
          <div className="col-xs-2 col-xs-push-1" style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 2 ? onStyle : offStyle}></div>
            <p>Enter Athlete Information</p>
          </div>
          <div className="col-xs-2 col-xs-push-1" style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 3 ? onStyle : offStyle}></div>
            <p>Sign Waivers and Agreements</p>
          </div>
          <div className="col-xs-2 col-xs-push-1" style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 4 ? onStyle : offStyle}></div>
            <p>Process Payment</p>
          </div>
          <div className="col-xs-2 col-xs-push-1" style={{textAlign: 'center'}}>
            <div style={this.props.pageNum === 5 ? onStyle : offStyle}></div>
            <p>Done!</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;