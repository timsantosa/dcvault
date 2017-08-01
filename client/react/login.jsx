import React from 'react';
import {render} from 'react-dom';

class Login extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className='fade-bg'>
        <div className='login-modal'>
          <div className='row'>
            <div className='col-xs-4'>
              LOGIN
            </div>
            <div className='col-xs-4'>
              REGISTER
            </div>
            <div className='col-xs-4'>
              <span class='glyphicon glyphicon-remove' id='login-menu-close'></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const loginDiv = document.getElementById('login');
document.getElementById('login-button').onclick = () => {
  loginDiv.style.opacity = 1;
  loginDiv.style.visibility = 'visible';
};

document.getElementById('login-menu-close').onclick = () => {
  loginDiv.style.opacity = 0;
  loginDiv.style.visibility = 'hidden';
}

export default Login;


// <div className="g-recaptcha" data-sitekey="6LfsVCsUAAAAAIKK71ZZ_o3PFAKW3OjVpTKHnS7F"></div>
// CAPTCHA CODE