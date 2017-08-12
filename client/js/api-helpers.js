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

apiHelpers.validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// apiHelpers.getPaypalToken = () => {
//   return axios.get('/client_token')
//   .then((response) => {
//     return response.data;
//   })
// }

// apiHelpers.sendPaymentNonce = (nonce, amount) => {
//   return axios.post('/checkout', {nonce: nonce, amount: amount})
//   .then((response) => {
//     console.log(response)
//   });
// }

export default apiHelpers;