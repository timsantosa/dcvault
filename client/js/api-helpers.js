'use strict';

let apiHelpers = {};

apiHelpers.login = (email, password) => {
  return axios.post('/users/authenticate', {email: email, password: password})
  .then((response) => {
    return response;
  }).catch((error) => {
    return error.response;
  });
}

apiHelpers.register = (email, password) => {
  return axios.post('/users/create', {email: email, password: password})
  .then((response) => {
    return response;
  })
  .catch((error) => {
    return error.response;
  })
}

apiHelpers.verifyToken = () => {
  let token = localStorage.getItem('token');
  return axios.post('/users/token', {token: token})
  .then((response) => {
    return true;
  })
  .catch((error) => {
    return false;
  });
}

apiHelpers.forgotPassword = (email) => {
  return axios.post('/users/forgot', {email: email})
  .then((response) => {
    return response;
  })
  .catch((error) => {
    return error.response;
  })
}

apiHelpers.getUserData = () => {
  let token = localStorage.getItem('token');
  return axios.post('/users/info', {token: token})
  .then((response) => {
    return response;
  })
  .catch((error) => {
    return error.response;
  })
}

apiHelpers.finalizePayment = (purchaseInfo) => {
  let token = localStorage.getItem('token');
  return axios.post('/registration/finalize', {purchaseInfo: purchaseInfo, token: token})
  .then((response) => {
    return response;
  }).catch((error) => {
    return error.response;
  })
}

apiHelpers.validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

apiHelpers.formatDate = (date) => {
  let validDigits = '0123456789';
  date = date.split('');
  let newDate = [];
  for (let i = 0; i < date.length; i++) {
    if (newDate.length === 2 || newDate.length === 5) {
      newDate.push('/');
    }
    if (validDigits.includes(date[i])) {
      newDate.push(date[i]);
    }
  }

  return newDate.slice(0, 10).join('');
}

apiHelpers.formatPhone = (phone) => {
  let validDigits = '0123456789';
  phone = phone.split('');
  let newPhone = [];
  for (let i = 0; i < phone.length; i++) {
    if (newPhone.length === 3 || newPhone.length === 7) {
      newPhone.push('-');
    }
    if (validDigits.includes(phone[i])) {
      newPhone.push(phone[i]);
    }
  }

  return newPhone.slice(0, 12).join('');
}

apiHelpers.sendConfirmationEmail = (email) => {
  return axios.post('/registration/confirm', {email: email});
}

apiHelpers.getDiscountAmount = (code) => {
  return axios.post('/registration/discount', {code: code})
  .then((response) => {
    return response;
  })
  .catch((error) => {
    return error.response;
  })
}

export default apiHelpers;