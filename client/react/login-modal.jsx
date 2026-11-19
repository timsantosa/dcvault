import React from 'react'
import apiHelpers from './api-helpers'
import LoginForm from './login-form.jsx'

// Redesigned pop-up login for redesigned pages (the registration landing page).
// Drop-in replacement for the legacy <Login /> modal: it renders into
// <div id="login">, and is shown/hidden the same way (opacity/visibility on
// that div, see #login in extras.css), so existing callers such as
// register.jsx's isLoggedIn() keep working unchanged.

const getContainer = () => document.getElementById('login')

export const openLoginModal = () => {
  const div = getContainer()
  if (div) {
    div.style.opacity = 1
    div.style.visibility = 'visible'
  }
}

export const closeLoginModal = () => {
  const div = getContainer()
  if (div) {
    div.style.opacity = 0
    div.style.visibility = 'hidden'
  }
}

class LoginModal extends React.Component {
  constructor (props) {
    super(props)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  componentDidMount () {
    const loginButton = document.getElementById('login-button')
    apiHelpers.verifyToken().then((loggedIn) => {
      if (!loginButton) {
        return
      }
      if (loggedIn) {
        loginButton.onclick = (e) => {
          e.preventDefault()
          window.location.href = '/home/'
        }
      } else {
        loginButton.onclick = (e) => {
          e.preventDefault()
          openLoginModal()
          setTimeout(() => this.refs.form && this.refs.form.focus(), 50)
        }
      }
    })
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown (e) {
    const div = getContainer()
    if ((e.key === 'Escape' || e.keyCode === 27) && div && div.style.visibility === 'visible') {
      closeLoginModal()
    }
  }

  onBackdropClick (e) {
    // Only close when clicking the dimmed backdrop itself, not the card
    if (e.target === e.currentTarget) {
      closeLoginModal()
    }
  }

  render () {
    const closeButton = (
      <button type='button' id='login-menu-close' className='login-close' aria-label='Close' onClick={closeLoginModal}>
        <i className='fa fa-times' />
      </button>
    )

    return (
      <div className='login-overlay' role='dialog' aria-modal='true' aria-label='Log in'
        onClick={this.onBackdropClick.bind(this)}>
        <div className='login-overlay__dialog'>
          <LoginForm
            ref='form'
            headerAction={closeButton}
            onLoggedIn={() => {
              // Stay on the current page (e.g. mid-registration), now logged in
              window.location.hash = ''
              window.location.reload()
            }} />
        </div>
      </div>
    )
  }
}

export default LoginModal
