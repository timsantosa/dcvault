import React from 'react'
import apiHelpers from './api-helpers'

// Redesigned log in / create account card. Shared by the standalone /login/
// page (<LoginPage />) and the pop-up on redesigned pages (<LoginModal />).
//
// Props:
//   onLoggedIn()          called after the token is stored in localStorage
//   onModeChange(isReg)   optional, called when switching Log In / Create Account
//   initialStatus         optional status message to show on first render
//   autoFocus             focus the email field on mount
//   headerAction          optional node rendered at the right of the tab row (e.g. a close button)

class LoginForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isRegister: false,
      submitting: false,
      showResend: false,
      resendText: '',
      errorText: '',
      statusText: props.initialStatus || ''
    }
  }

  focus () {
    if (this.refs.emailInput) {
      this.refs.emailInput.focus()
    }
  }

  setMode (isRegister) {
    this.setState({isRegister, errorText: '', showResend: false, resendText: ''})
    if (this.props.onModeChange) {
      this.props.onModeChange(isRegister)
    }
  }

  submit (e) {
    e.preventDefault()
    if (this.state.submitting) {
      return
    }

    const email = this.refs.emailInput.value.trim()
    const password = this.refs.passwordInput.value
    this.setState({errorText: '', statusText: '', showResend: false, resendText: ''})

    if (!apiHelpers.validateEmail(email)) {
      this.setState({errorText: 'That is not a valid email address'})
      return
    }

    if (this.state.isRegister) {
      this.register(email, password)
    } else {
      this.login(email, password)
    }
  }

  login (email, password) {
    if (email.length === 0 || password.length === 0) {
      this.setState({errorText: 'You must fill all fields'})
      return
    }

    this.setState({submitting: true})
    apiHelpers.login(email, password)
    .then((response) => {
      const info = response.data
      if (!info.ok) {
        if (info.message === 'username or password incorrect') {
          this.setState({submitting: false, errorText: 'Incorrect email or password'})
        } else if (info.message === 'unverified') {
          this.setState({submitting: false, showResend: true, errorText: 'Your account has not been verified. Check your email'})
        } else {
          this.setState({submitting: false, errorText: 'An unknown error occurred. Please try again'})
        }
      } else {
        window.localStorage.setItem('token', info.token)
        this.setState({statusText: 'Logged in! One moment…'})
        this.props.onLoggedIn()
      }
    })
    .catch(() => {
      this.setState({submitting: false, errorText: 'An unknown error occurred. Please try again'})
    })
  }

  register (email, password) {
    const emailConf = this.refs.confirmEmailInput.value.trim()
    const passwordConf = this.refs.confirmPasswordInput.value

    if (email.length === 0 || password.length === 0 || emailConf.length === 0 || passwordConf.length === 0) {
      this.setState({errorText: 'You must fill all fields'})
    } else if (email !== emailConf && password !== passwordConf) {
      this.setState({errorText: 'Neither the email addresses nor the passwords match'})
    } else if (email !== emailConf) {
      this.setState({errorText: 'Email addresses do not match'})
    } else if (password !== passwordConf) {
      this.setState({errorText: 'Passwords do not match'})
    } else {
      this.setState({submitting: true})
      apiHelpers.register(email, password)
      .then((response) => {
        const info = response.data
        if (!info.ok) {
          if (info.message === 'user already exists') {
            this.setState({submitting: false, errorText: 'An account already exists with that email address'})
          } else {
            this.setState({submitting: false, errorText: 'An unknown error occurred. Please try again'})
          }
        } else {
          this.setMode(false)
          this.setState({
            submitting: false,
            statusText: 'Account created! Check your email for a verification link. This may take several minutes, and you may have to check your spam folder.'
          })
        }
      })
      .catch(() => {
        this.setState({submitting: false, errorText: 'An unknown error occurred. Please try again'})
      })
    }
  }

  forgotPassword () {
    this.setState({errorText: '', statusText: '', showResend: false})
    const email = this.refs.emailInput.value.trim()
    if (email.length === 0 || !apiHelpers.validateEmail(email)) {
      this.setState({errorText: 'Enter the email address associated with your account, then click "Forgot password?"'})
      return
    }
    apiHelpers.forgotPassword(email)
    .then((response) => {
      const info = response.data
      if (info.ok) {
        this.setState({statusText: 'A temporary password has been sent to your email'})
      } else if (info.message === 'user does not exist') {
        this.setState({errorText: 'There is no account with that email address'})
      } else {
        this.setState({errorText: 'An unknown error has occurred. Please try again'})
      }
    })
  }

  resendCode () {
    const email = this.refs.emailInput.value.trim()
    apiHelpers.resendVerification(email).then((response) => {
      if (!response.data || !response.data.ok) {
        this.setState({resendText: 'An error occurred. Please reload and try again'})
      } else {
        this.setState({resendText: 'Verification email resent.'})
      }
    })
  }

  render () {
    const {isRegister, submitting} = this.state

    return (
      <div className='acct-card login-card'>
        <div className='login-tabs' role='tablist'>
          <button type='button' role='tab' aria-selected={!isRegister}
            className={'login-tab' + (isRegister ? '' : ' login-tab--active')}
            onClick={() => this.setMode(false)}>Log In</button>
          <button type='button' role='tab' aria-selected={isRegister}
            className={'login-tab' + (isRegister ? ' login-tab--active' : '')}
            onClick={() => this.setMode(true)}>Create Account</button>
          {this.props.headerAction || null}
        </div>

        <form className='acct-card__body' onSubmit={this.submit.bind(this)} noValidate>
          <div className='reg-field'>
            <label htmlFor='login-email'>Email Address</label>
            <input id='login-email' className='reg-input' type='email' ref='emailInput' autoComplete='email' autoFocus={!!this.props.autoFocus} />
          </div>

          {isRegister ? (
            <div className='reg-field'>
              <label htmlFor='login-email-confirm'>Confirm Email</label>
              <input id='login-email-confirm' className='reg-input' type='email' ref='confirmEmailInput' autoComplete='email' />
            </div>
          ) : null}

          <div className='reg-field'>
            <div className='login-label-row'>
              <label htmlFor='login-password'>Password</label>
              {isRegister ? null : (
                <button type='button' className='login-link' onClick={this.forgotPassword.bind(this)}>Forgot password?</button>
              )}
            </div>
            <input id='login-password' className='reg-input' type='password' ref='passwordInput'
              autoComplete={isRegister ? 'new-password' : 'current-password'} />
          </div>

          {isRegister ? (
            <div className='reg-field'>
              <label htmlFor='login-password-confirm'>Confirm Password</label>
              <input id='login-password-confirm' className='reg-input' type='password' ref='confirmPasswordInput' autoComplete='new-password' />
            </div>
          ) : null}

          {this.state.statusText ? (
            <div className='acct-status' role='status'><p>{this.state.statusText}</p></div>
          ) : null}

          {this.state.errorText ? (
            <div className='reg-error' role='alert'>
              <p>{this.state.errorText}</p>
              {this.state.showResend ? (
                this.state.resendText
                  ? <p>{this.state.resendText}</p>
                  : <p><button type='button' className='login-link' onClick={this.resendCode.bind(this)}>Resend verification email</button></p>
              ) : null}
            </div>
          ) : null}

          <button type='submit' className='reg-btn reg-btn--block' disabled={submitting}>
            {submitting ? 'Please wait…' : (isRegister ? 'Create Account' : 'Log In')}
          </button>
        </form>
      </div>
    )
  }
}

export default LoginForm
