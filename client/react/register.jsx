import React from 'react';
import {render} from 'react-dom';
import apiHelpers from '../js/api-helpers';
// import initPaypal from '../js/payment';

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: '',
      pageNum: 0,
      data: {}
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

    console.log('THE CURRENT PAGE NUM IS', newPageNum);

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
        currentPage: (<Payment advance={this.advance.bind(this)}/>)
      });
    } else if (newPageNum === 5) {
      this.setState({
        currentPage: (<Confirmation advance={this.advance.bind(this)} data={this.state.data}/>)
      });
    }

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
        loginButton.innerHTML = 'Account';
        loginButton.onclick = () => {
          window.location.href = '/account';
        }
        this.setState({
          currentPage: (<SelectPackage advance={this.advance.bind(this)}/>),
          pageNum: 1
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
                <a className="red-text center-content" href='/'>Return to Home Page</a>
              </div>
            </div>
          )
        });

        console.log(this.state.currentPage);
      }
    });
  }

  render() {
    console.log(this.state.currentPage)
    return (
      <section id="register">
        <div className="containter">
          {this.state.currentPage}
          <ProgressBar pageNum={this.state.pageNum}/>
        </div>
        <div id="paypal-button"></div>
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

    let output = $('#select-package').serializeArray();
    if (output.length !== 3) {
      this.setState({
        errorText: 'Please make a selection for all fields'
      });
    } else {
      this.props.advance('select-package', output);
    }
  }

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
                              <input type="radio" name="quarter"/>
                              <span>Fall</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="quarter"/>
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
                              <input type="radio" name="group"/>
                              <span>Beginner (Level I)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="group"/>
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
                              <input type="radio" name="facility"/>
                              <span>Washington, DC (DCV)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="facility"/>
                              <span>Baltimore, MD (BALT)</span>
                          </label>
                      </div>
                      <div>
                          <label>
                              <input type="radio" name="facility"/>
                              <span>Mercersburg, PA (PA)</span>
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
      errorText: ''
    };
  }

  continue() {
    this.setState({
      errorText: ''
    });

    let required = ['name', 'dob', 'usatf', 'emergency-contact', 'emergency-phone', 'emergency-relation', 'gender', 'state', 'conditions'];
    let complete = true;

    let output = $('#athlete-info').serializeArray();
    console.log(output);

    for (let field of output) {
      if (required.includes(field.name) && field.value.length === 0) {
        this.setState({
          errorText: 'Please fill in all required fields'
        });
        complete = false;
        break;
      }
    }

    if (complete) {
      this.props.advance('athlete-info', output);
    }

  }

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
            <form id="athlete-info" className="form-labels-on-top">

              <div className="form-title-row">
                  <h1>Athlete Information</h1>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Athlete Full Name</span>
                      <input type="text" name="name"/>
                  </label>
              </div>

              <div className="form-row">
                <label>
                  <span className='required'>Athlete DOB (mm/dd/yyyy)</span>
                  <input type="text" name="dob" style={{width: '100%'}}/>
                </label>
              </div>

              <div className="form-row">
                  <label>
                      <span>Athlete Email (optional)</span>
                      <input type="text" name="email"/>
                  </label>
              </div>

              <div className="form-row">
                  <label>
                      <span className='required'>Athlete USATF Number</span>
                      <input type="text" name="usatf"/>
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
                      <span className='required'>Emergency Contact Phone</span>
                      <input type="text" name="emergency-phone"/>
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
                      <input type="text" name="email"/>
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

  continue() {
    this.setState({
      errorText: ''
    });

    let required = ['name', 'date'];
    let complete = true;

    let output = $('#agreement').serializeArray();
    console.log(output);

    for (let field of output) {
      if (required.includes(field.name) && field.value.length === 0) {
        this.setState({
          errorText: 'Please fill in all required fields'
        });
        complete = false;
        break;
      }
    }

    if (complete) {
      this.props.advance('agreement', output);
    }

  }

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

              <p style={{fontSize: '12px', fontWeight: 'normal'}}> By signing below and clicking 'continue' you agree that you (the adult athlete or the athlete's adult guardian) agree with the above waivers. You may <a style={{color: '#C0282D'}} href='../files/release-form.pdf' target='_blank'>click here</a> to view the waivers as a PDF</p>

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
                      <input type="text" name="date" style={{width: '100%'}}/>
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
    }
  }

  componentDidMount() {
    this.calculatePrice();
  }

  calculatePrice() {
    let price = (this.state.price * (1 - this.state.discount)) * 1.03
    this.renderButton(price);
  }

  renderButton(amount) {

    let cont = this.continue.bind(this);

    paypal.Button.render({
    env: 'sandbox', // sandbox | production
    client: {
      sandbox:    window.configVariables.PAYPAL_CLIENT_ID,
      production: '<insert production client id>'
    },
    commit: true,
    payment: function(data, actions) {
      return actions.payment.create({
        payment: {
          transactions: [
            {
              amount: { total: amount, currency: 'USD' }
            }
          ]
        }
      });
    },

    // onAuthorize() is called when the buyer approves the payment
    onAuthorize: function(data, actions) {
      return actions.payment.execute().then(function() {
        cont();
      });
    }

    }, '#paypal-button-container');
  }

  continue() {
    this.props.advance('payment', null)
  }

  applyDiscount() {

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
            discount: discountAmount
          });
          this.calculatePrice();
        }
      })
    }
  }

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
                  <h1>Finalize Payment</h1>
              </div>
              <div className="form-row">
                <div className="row">
                  <div className="col-xs-8">
                      <label>
                      <span>Discount Code</span>
                      <input type="text" name="discount" style={{width: '100%'}}/>
                    </label>
                  </div>
                  <div className="col-xs-4">
                    <button ref="discountBox" type="button" onClick={this.applyDiscount.bind(this)}>Apply</button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="row">
                  <div className="col-xs-12" style={{textAlign:'center'}}>
                      <p style={{fontSize: '14px', fontWeight: 'normal', marginTop: '20px'}}>Registration Fee: ${this.state.price * (1 - this.state.discount)}</p>
                  </div>
                </div>
              </div>

              {errorContainer}

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

    apiHelpers.getUserData()
    .then((response) => {
      if (response.data.ok) {
        if (response.data.user.email && apiHelpers.validateEmail(response.data.user.email)) {
          apiHelpers.sendConfirmationEmail(response.data.user.email);
        }
      }
    });

    for (let element of this.props.data['athlete-info']) {
      if (element.name === 'email' && element.value.length !== 0 && apiHelpers.validateEmail(element.value)) {
        apiHelpers.sendConfirmationEmail(element.value);
      }
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
          <form id="agreement" className="form-labels-on-top">
              <div className="form-title-row">
                  <h1>Success!</h1>
              </div>
              <p style={{fontSize: '14px', fontWeight: 'normal'}}>Check your email for Confirmation and Training Information</p>
              <div className="form-row">
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
    return (
      <div className="progress-bar">
        {this.props.pageNum}
      </div>
    );
  }
}

export default Register;