import React from 'react';
import {render} from 'react-dom';

class Login extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className='fade-bg'>
        <div className='login-modal'>
          <div className='row'>
            <div className='col-xs-6'>
              LOGIN
            </div>
            <div className='col-xs-6'>
              REGISTER
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