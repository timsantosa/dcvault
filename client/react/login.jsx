import React from 'react';
import {render} from 'react-dom';

class Login extends React.Component {
  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className='fade-bg'>
        <div className='login-modal'>
          <div className='row'>
            <div className='col-xs-6' style={{textAlign: 'center', paddingTop: '10px'}}>
              <span>LOGIN</span>
            </div>
            <div className='col-xs-6' style={{textAlign: 'center', paddingTop: '10px'}}>
              <span>REGISTER</span>
            </div>
          </div>



          <div className="row">
            <div className='col-xs-12' style={{textAlign: 'center'}}>
              <a id='login-menu-close'>CANCEL</a>
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