import React from 'react';
import {render} from 'react-dom';
import apiHelpers from './api-helpers';

class Login extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRegister: false,
      errorText: '',
      statusText: window.location.hash.indexOf('justVerified=true') !== -1 ? 'Account Verified! Please log in' : ''
    };
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
      } else {
        loginButton.onclick = () => {
          loginDiv.style.opacity = 1;
          loginDiv.style.visibility = 'visible';
        };
      }
    });
    document.getElementById('login-menu-close').onclick = () => {
      loginDiv.style.opacity = 0;
      loginDiv.style.visibility = 'hidden';
    }
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
    this.setState({errorText: '', statusText: ''});
    if (!apiHelpers.validateEmail(email)) {
      this.setState({errorText: 'That is not a valid email address'});
    } else {
      if (this.state.isRegister) {
        let emailConf = this.refs.confirmEmailInput.value;
        let passwordConf = this.refs.confirmPasswordInput.value;
        // If the user is registering a new account
        if (email.length === 0 || password.length === 0 || emailConf.length === 0 || passwordConf.length === 0) {
          this.setState({errorText: 'You must fill all fields'});
        } else if (email !== emailConf && password !== passwordConf) {
          this.setState({errorText: 'Neither the email addresses nor the passwords match'})
        } else if (email !== emailConf) {
          this.setState({errorText: 'Email addresses do not match'});
        } else if (password !== passwordConf) {
          this.setState({errorText: 'Passwords do not match'});
        } else {
          apiHelpers.register(email, password)
          .then((response) => {
            let info = response.data;
            if (!info.ok) {
              if (info.message === 'user already exists') {
                this.setState({errorText: 'An account already exists with that email address'});
              } else {
                this.setState({errorText: 'An unknown error occurred. Please try again'});
              }
            } else {
              this.setState({statusText: 'Account Created! Check your email for a verification link. This may take several minutes, and you may have to check your spam folder'});
            }
          });
        }
      } else {
        if (email.length === 0 || password.length === 0) {
          this.setState({errorText: 'You must fill all fields'});
        } else {
          apiHelpers.login(email, password)
          .then((response) => {
            let info = response.data;
            if (!info.ok) {
              if (info.message === 'username or password incorrect') {
                this.setState({errorText: 'Incorrect Email or Password'});
              } else if (info.message === 'unverified') {
                this.setState({errorText: 'Your account has not been verified. Check your email'});
              } else {
                this.setState({errorText: 'An unknown error occurred. Please try again'});
              }
            } else {
              localStorage.setItem('token', info.token);
              this.setState({statusText: 'Logged In Successfully!'});
              window.location.hash = '';
              setTimeout(() => {
                document.getElementById('login-menu-close').click();
                window.location.reload();
              }, 500)
              // window.location.href = '/account'
            }
          });
        }
      }
    }
  }

  forgotPassword() {
    this.setState({errorText: '', statusText: ''});
    let email = this.refs.emailInput.value;
    if (email.length === 0 || !apiHelpers.validateEmail(email)) {
      this.setState({errorText: 'Please input the email address associated with your account'});
    } else {
      apiHelpers.forgotPassword(email)
      .then((response) => {
        let info = response.data;
        if (info.ok) {
          this.setState({statusText: 'A temporary password has been sent to your email'});
        } else {
          if (info.message === 'user does not exist') {
            this.setState({errorText: 'There is no account with that email address'});
          } else {
            this.setState({errorText: 'An unknown error has occurred. Please try again'});
          }
        }
      });
    }
  }

  resendCode() {
    let email = this.refs.emailInput.value;
    apiHelpers.resendVerification(email).then((response) => {
      if (!response.data || !response.data.ok) {
        document.getElementById('resend-link').innerHTML = 'An error occurred. Please reload and try again'
      } else {
        document.getElementById('resend-link').innerHTML = 'Code Resent.'
      }
    })
  }

  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    let confirmEmail = '';
    let confirmPassword = '';
    let forgotButton = '';

    let errorContainer = '';
    let resendConfirmation = '';
    let statusContainer = '';

    let resendCode = this.resendCode.bind(this);

    if (!(this.state.errorText.length === 0)) {

      if (this.state.errorText.indexOf('has not been verified') !== -1) {
        resendConfirmation = (<a id="resend-link" onClick={resendCode}>Resend Confirmation Email</a>);
      }

      errorContainer = <div className='row'>
          <div className='error-container'>
            <p>{this.state.errorText}</p>
            {resendConfirmation}
          </div>
        </div>;
    }

    if (!(this.state.statusText.length === 0)) {
      statusContainer = <div className='row'>
          <div className='status-container'>
            <p>{this.state.statusText}</p>
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
          <div className='row' style={{backgroundColor: '#BBB', margin: '0px', borderRadius: '2px 2px 0px 0px'}}>
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
          {statusContainer}
          {errorContainer}

          <div className='row'>
            <div className='red-button' onClick={this.submit.bind(this)} tabIndex='0'>
              <span className='button-text'>GO ></span>
            </div>
          </div>


          <div className="row">
            <div className='col-xs-12 login-modal-element'>
              <a id='login-menu-close' className='smaller-text' style={{marginTop: '25px'}}>CLOSE</a>
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