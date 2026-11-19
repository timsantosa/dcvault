import React from 'react'
import apiHelpers from './api-helpers'
import LoginForm from './login-form.jsx'

// Standalone login / create-account page served at /login/. Logged-out
// visitors to /home and /admin are sent here.
//
// Supports ?next=/some/path to return the user somewhere after logging in
// (only same-site paths are honoured). Defaults to /home/.

const DEFAULT_NEXT = '/home/'

const getNextPath = () => {
  const match = window.location.search.match(/[?&]next=([^&]*)/)
  if (!match) {
    return DEFAULT_NEXT
  }
  let next
  try {
    next = decodeURIComponent(match[1])
  } catch (e) {
    return DEFAULT_NEXT
  }
  // Only allow relative, same-origin paths ("/admin/"), never "//evil.com" or "https://…"
  if (next.charAt(0) !== '/' || next.charAt(1) === '/' || next.charAt(1) === '\\') {
    return DEFAULT_NEXT
  }
  return next
}

const initialStatus = () => {
  const hash = window.location.hash
  if (hash.indexOf('justVerified=true') !== -1) {
    return 'Account verified! Please log in.'
  }
  if (hash.indexOf('alreadyVerified=true') !== -1) {
    return 'Your account is already verified. Please log in.'
  }
  return ''
}

class LoginPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      checking: true,
      isRegister: false
    }
  }

  componentDidMount () {
    // Already logged in? Skip the form.
    apiHelpers.verifyToken().then((loggedIn) => {
      if (loggedIn) {
        window.location.replace(getNextPath())
      } else {
        this.setState({checking: false})
      }
    })
  }

  render () {
    const {checking, isRegister} = this.state

    if (checking) {
      return <section className='acct-redesign login-redesign' />
    }

    return (
      <section className='acct-redesign login-redesign'>
        <header className='acct-hero'>
          <div className='container acct-hero__inner'>
            <div>
              <p className='acct-hero__eyebrow'>DC Vault Account</p>
              <h1 className='acct-hero__title'>{isRegister ? 'Create Account' : 'Log In'}</h1>
              <p className='acct-hero__sub'>
                {isRegister
                  ? 'Create an account to register athletes and manage your training.'
                  : 'Log in to register athletes, view purchases and manage your account.'}
              </p>
            </div>
          </div>
        </header>

        <div className='container login-body'>
          <LoginForm
            autoFocus
            initialStatus={initialStatus()}
            onModeChange={(reg) => this.setState({isRegister: reg})}
            onLoggedIn={() => { window.location.href = getNextPath() }} />
        </div>
      </section>
    )
  }
}

export default LoginPage
