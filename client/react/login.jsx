import React from 'react';
import {render} from 'react-dom';

class Login extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRegister: false,
      errorText: ''
    };
  }

  showRegister() {
    this.setState({isRegister: true});
  }

  hideRegister() {
    this.setState({isRegister: false});
  }

  submit() {
    let email = this.refs.emailInput.value;
    let password = this.refs.passwordInput.value;
    let emailConf = this.refs.confirmEmailInput;
    let passConf = this.refs.confirmPasswordInput;

    this.setState({errorText: ''});

    if (this.state.isRegister) {
      if (email.length === 0 || password.length === 0 || emailConf.length === 0 || passConf.length === 0) {
        this.setState({errorText: 'You must fill all fields'});
      } else if (email !== emailConf || password !== passConf) {
        this.setState({errorText: 'Emails and/or passwords do not match'});
      }
    }
  }

  forgotPassword() {

  }

  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    let confirmEmail = '';
    let confirmPassword = '';
    let forgotButton = '';

    let errorContainer = '';

    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
          <div className='error-container'>
            <p>{this.state.errorText}</p>
          </div>
        </div>;
    }

    if (this.state.isRegister) {
      confirmEmail = <div className='row confirm-element'>
            <div className='col-xs-5 login-modal-element'>
              Confirm Email:
            </div>
            <div className='col-xs-7 login-modal-element'>
              <input className='login-input' type='text' ref='confirmEmailInput'/>
            </div>
          </div>;

      confirmPassword = <div className='row confirm-element'>
            <div className='col-xs-5 login-modal-element'>
              Confirm Password:
            </div>
            <div className='col-xs-7 login-modal-element'>
              <input className='login-input' type='password' ref='confirmPasswordInput'/>
            </div>
          </div>;

    } else {
      forgotButton = <a className='forgot-button' onClick={this.forgotPassword.bind(this)}>Forgot?</a>;
    }

    return (
      <div className='fade-bg'>
        <div className='login-modal'>
          <div className='row' style={{backgroundColor: '#BBB', margin: '0px'}}>
            <div className='col-xs-6 login-modal-element'>
              <a onClick={this.hideRegister.bind(this)} style={this.state.isRegister ? {marginBottom: '25px'} : {marginBottom: '25px', color: '#C0282D'}}>LOGIN</a>
            </div>
            <div className='col-xs-6 login-modal-element'>
              <a onClick={this.showRegister.bind(this)} style={this.state.isRegister ? {marginBottom: '25px', color: '#C0282D'} : {marginBottom: '25px'}}>REGISTER</a>
            </div>
          </div>

          <div className='login-modal-container'>
            <div className='row'>
              <div className='col-xs-5 login-modal-element'>
                Email Address:
              </div>
              <div className='col-xs-7 login-modal-element'>
                <input className='login-input' type='text' ref='emailInput'/>
              </div>
            </div>

            {confirmEmail}

            <span className="horizontalDivider"></span>

            <div className='row'>
              <div className='col-xs-5 login-modal-element'>
                Password:
              </div>
              <div className='col-xs-7 login-modal-element'>
                <input className='login-input' type='password' ref='passwordInput'/>
                {forgotButton}
              </div>
            </div>

            {confirmPassword}

          </div>
          {errorContainer}

          <div className='row'>
            <div className='red-button' onClick={this.submit.bind(this)}>
              <span className='button-text'>GO ></span>
            </div>
          </div>


          <div className="row">
            <div className='col-xs-12 login-modal-element'>
              <a id='login-menu-close' className='smaller-text' style={{marginTop: '25px'}}>CANCEL</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;


// <div className="g-recaptcha" data-sitekey="6LfsVCsUAAAAAIKK71ZZ_o3PFAKW3OjVpTKHnS7F"></div>
// CAPTCHA CODE