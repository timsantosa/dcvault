'use strict'
const axios = window.axios

let apiHelpers = {}

apiHelpers.login = (email, password) => {
  return axios.post('/users/authenticate', {email: email, password: password})
  .then((response) => {
    return response
  }).catch((error) => {
    return error.response
  })
}

apiHelpers.register = (email, password) => {
  return axios.post('/users/create', {email: email, password: password})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.deleteDiscount = (id) => {
  let token = window.localStorage.getItem('token')
  return axios.post('/discounts/delete', {token: token, discountId: id})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.deleteInvite = (id) => {
  let token = window.localStorage.getItem('token')
  return axios.post('/invites/delete', {token: token, inviteId: id})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.verifyToken = () => {
  let token = window.localStorage.getItem('token')
  return axios.post('/users/token', {token: token})
  .then((response) => {
    return true
  })
  .catch((error) => { // eslint-disable-line
    window.localStorage.removeItem('token')
    return false
  })
}

apiHelpers.editUserInfo = (name, password) => {
  let newInfo = {}
  let token = window.localStorage.getItem('token')
  if (name) {
    newInfo.name = name
  }
  if (password) {
    newInfo.password = password
  }
  return axios.post('/users/update', {token: token, newInfo: newInfo})
  .then((response) => {
    return response
  }).catch((error) => {
    return error.response
  })
}

apiHelpers.forgotPassword = (email) => {
  return axios.post('/users/forgot', {email: email})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.createDiscount = (description, amount) => {
  let token = window.localStorage.getItem('token')
  return axios.post('/discounts/create', {description: description, amount: amount, token: token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.createInvite = (description, level) => {
  let token = window.localStorage.getItem('token')
  return axios.post('/invites/create', {description: description, level: level, token: token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.getUserData = () => {
  let token = window.localStorage.getItem('token')
  return axios.post('/users/info', {token: token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.finalizePayment = (purchaseInfo) => {
  let token = window.localStorage.getItem('token')
  return axios.post('/registration/finalize', {purchaseInfo: purchaseInfo, token: token})
  .then((response) => {
    return response
  }).catch((error) => {
    return error.response
  })
}

apiHelpers.validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // eslint-disable-line
  return re.test(email)
}

apiHelpers.formatDate = (date) => {
  let validDigits = '0123456789'
  date = date.split('')
  let newDate = []
  for (let i = 0; i < date.length; i++) {
    if (newDate.length === 2 || newDate.length === 5) {
      newDate.push('/')
    }
    if (validDigits.indexOf(date[i]) !== -1) {
      newDate.push(date[i])
    }
  }

  return newDate.slice(0, 10).join('')
}

apiHelpers.formatPhone = (phone) => {
  let validDigits = '0123456789'
  phone = phone.split('')
  let newPhone = []
  for (let i = 0; i < phone.length; i++) {
    if (newPhone.length === 3 || newPhone.length === 7) {
      newPhone.push('-')
    }
    if (validDigits.indexOf(phone[i]) !== -1) {
      newPhone.push(phone[i])
    }
  }

  return newPhone.slice(0, 12).join('')
}

apiHelpers.resendVerification = (email) => {
  return axios.post('/users/resend', {email: email})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.sendConfirmationEmail = (email) => {
  return axios.post('/registration/confirm', {email: email})
}

apiHelpers.getDiscountAmount = (code) => {
  return axios.post('/registration/discount', {code: code})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.applyInvite = (code) => {
  return axios.post('/registration/invite', {code: code})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.contactForm = (name, from, to, subject, text) => {
  return axios.post('/contact', {name: name, from: from, to: to, subject: subject, text: text})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

export default apiHelpers
