'use strict'
const axios = window.axios

let apiHelpers = {}

const getToken = () => {
  return window.localStorage.getItem('token')
}

window.fillPoles = () => {
  let poles = [ '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":90,"feet":10,"inches":8,"note":"Tip Size: 18"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":100,"feet":10,"inches":8,"note":"Tip Size: 16"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":110,"feet":10,"inches":8,"note":"Tip Size: 18"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":120,"feet":10,"inches":8,"note":"Tip Size: 18"}',
    '{"brand":"UCS","needsTip":true,"missing":false,"broken":false,"weight":120,"feet":11,"inches":6,"note":"Tip Size: 18"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":130,"feet":11,"inches":6,"note":"Tip Size: 16"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":120,"feet":12,"inches":0,"note":"Tip Size: 18"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":130,"feet":12,"inches":0,"note":"Tip Size: 16"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":true,"weight":140,"feet":12,"inches":0,"note":"Tip Size: 15"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":150,"feet":12,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":130,"feet":13,"inches":0,"note":"Tip Size: 15"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":130,"feet":13,"inches":0,"note":"Tip Size: 15"}',
    '{"brand":"UCS","needsTip":true,"missing":false,"broken":false,"weight":135,"feet":13,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":140,"feet":13,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":145,"feet":13,"inches":0,"note":"Tip Size: 13"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":150,"feet":13,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":150,"feet":13,"inches":0,"note":"Tip Size: 12"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":155,"feet":13,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":155,"feet":13,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":160,"feet":13,"inches":0,"note":"Tip Size: 13"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":165,"feet":13,"inches":0,"note":"Tip Size: 12"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":165,"feet":13,"inches":0,"note":"Tip Size: 12"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":true,"weight":170,"feet":13,"inches":0,"note":"Tip Size: 11"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":175,"feet":13,"inches":0,"note":"Tip Size: 10"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":13,"inches":0,"note":"Tip Size: 9"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":140,"feet":13,"inches":7,"note":"Tip Size: 12"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":155,"feet":13,"inches":7,"note":"Tip Size: 12"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":160,"feet":13,"inches":7,"note":"Tip Size: 11"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":165,"feet":13,"inches":7,"note":"Tip Size: 10"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":13,"inches":7,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":140,"feet":14,"inches":0,"note":"Tip Size: 15"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":140,"feet":14,"inches":0,"note":"Tip Size: 15"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":140,"feet":14,"inches":0,"note":"Tip Size: 15"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":145,"feet":14,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":145,"feet":14,"inches":0,"note":"Tip Size: 14"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":150,"feet":14,"inches":0,"note":"Tip Size: 13"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":150,"feet":14,"inches":0,"note":"Tip Size: 13"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":155,"feet":14,"inches":0,"note":"Tip Size: 12"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":160,"feet":14,"inches":0,"note":"Tip Size: 11"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":160,"feet":14,"inches":0,"note":"Tip Size: 11"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":160,"feet":14,"inches":0,"note":"Tip Size: 11"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":true,"weight":165,"feet":14,"inches":0,"note":"Tip Size: 10"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":170,"feet":14,"inches":0,"note":"Tip Size: 9"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":175,"feet":14,"inches":0,"note":"Tip Size: 8"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":14,"inches":0,"note":"Tip Size: 7"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":160,"feet":14,"inches":7,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":true,"weight":165,"feet":14,"inches":7,"note":"Tip Size: 7"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":170,"feet":14,"inches":7,"note":"Tip Size: 8"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":175,"feet":14,"inches":7,"note":"Tip Size: 7"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":14,"inches":7,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":150,"feet":15,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":155,"feet":15,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":165,"feet":15,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":170,"feet":15,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":175,"feet":15,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":15,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":15,"inches":0,"note":"Tip Size: 9"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":185,"feet":15,"inches":0,"note":"Tip Size: 8"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":190,"feet":15,"inches":0,"note":"Tip Size: 7"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":170,"feet":15,"inches":7,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":180,"feet":15,"inches":7,"note":"Tip Size: 9"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":190,"feet":15,"inches":7,"note":"Tip Size: 7"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":185,"feet":16,"inches":0,"note":"Tip Size: 8"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":185,"feet":16,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":190,"feet":16,"inches":0,"note":"Tip Size: 6"}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":200,"feet":16,"inches":0,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":185,"feet":16,"inches":5,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":190,"feet":16,"inches":5,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":195,"feet":16,"inches":5,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":200,"feet":16,"inches":5,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":205,"feet":16,"inches":5,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":210,"feet":16,"inches":5,"note":""}',
    '{"brand":"UCS","needsTip":false,"missing":false,"broken":false,"weight":200,"feet":17,"inches":0,"note":""}' ]

  poles.forEach(pole => {
    apiHelpers.addPole(JSON.parse(pole))
  })
}

apiHelpers.parseFormValues = (array) => {
  let retVal = {}
  for (let i = 0; i < array.length; i++) {
    retVal[array[i].name] = array[i].value
  }

  return retVal
}

apiHelpers.getCurrentQuarter = () => {
  let month = (new Date()).getMonth() + 1
  if (month === 12 || month === 1 || month === 2) {
    return 'winter'
  } else if (month <= 5 && month >= 3) {
    return 'spring'
  } else if (month <= 8 && month >= 6) {
    return 'summer'
  } else {
    return 'fall'
  }
}

apiHelpers.isAdmin = () => {
  let token = getToken()
  return axios.post('/users/isadmin', {token})
  .then((response) => {
    return response.data.ok && response.data.isAdmin
  }).catch((error) => { //eslint-disable-line
    window.localStorage.removeItem('token')
    return false
  })
}

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
  let token = getToken()
  return axios.post('/discounts/delete', {token: token, discountId: id})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.deleteInvite = (id) => {
  let token = getToken()
  return axios.post('/invites/delete', {token: token, inviteId: id})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.verifyToken = () => {
  let token = getToken()
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
  let token = getToken()
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
  let token = getToken()
  return axios.post('/discounts/create', {description: description, amount: amount, token: token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.createInvite = (description, level) => {
  let token = getToken()
  return axios.post('/invites/create', {description: description, level: level, token: token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.getUserData = () => {
  let token = getToken()
  return axios.post('/users/info', {token: token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.finalizePayment = (purchaseInfo) => {
  let token = getToken()
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

apiHelpers.requestPole = (athleteId, period) => {
  let token = getToken()
  return axios.post('/rentals/request', {token, athleteId, period, quarter: apiHelpers.getCurrentQuarter()})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.getPoles = () => {
  let token = getToken()
  return axios.post('/poles/list', {token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.updatePole = (pole) => {
  let token = getToken()
  return axios.post('/poles/update', {token, updatedPole: JSON.stringify(pole)})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.addPole = (pole) => {
  let token = getToken()
  return axios.post('/poles/add', {token, newPole: JSON.stringify(pole)})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.deletePole = (poleId) => {
  let token = getToken()
  return axios.post('/poles/delete', {token, poleId})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.getRentals = () => {
  let token = getToken()
  return axios.post('/rentals/list', {token})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.endRental = (rentalId) => {
  let token = getToken()
  return axios.post('/rentals/end', {token, rentalId})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

apiHelpers.assignPole = (request, pole) => {
  let token = getToken()
  return axios.post('/rentals/fulfill', {token, rentalId: request.id, poleId: pole.id})
  .then((response) => {
    return response
  })
  .catch((error) => {
    return error.response
  })
}

export default apiHelpers
