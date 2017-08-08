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

apiHelpers.validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export default apiHelpers;