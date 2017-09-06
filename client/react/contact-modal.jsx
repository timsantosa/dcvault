import React from 'react';
import {render} from 'react-dom';
import apiHelpers from './api-helpers';

class ContactModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorText: '',
      statusText: ''
    }
  }

  submit() {
    let name = this.refs.nameInput.value;
    let email = this.refs.emailInput.value;
    let subject = this.state.inquiryType.value;
    let body = this.state.emailBodyInput.value;
    if (!apiHelpers.validateEmail(email)) {
      this.setState({errorText: 'That is not a valid email address'});
    } else if (name.length === 0 || email.length === 0 || subject.length === 0 || body.length === 0) {
      this.setState({errorText: 'Please fill in all fields'});
    }
  }

  render() {
    let errorContainer = '';
    let statusContainer = '';

    if (!(this.state.errorText.length === 0)) {
      errorContainer = <div className='row'>
          <div className='error-container'>
            <p>{this.state.errorText}</p>
            {resendConfirmation}
          </div>
        </div>;
    }

    if (!(this.state.statusText.length === 0)) {
      statusContainer = <div className='row'>
          <div className='status-container'>
            <p>{this.state.statusText}</p>
          </div>
        </div>;
    }

    return (
      <div className='fade-bg'>
        <div className='login-modal'>
          <div className='row' style={{backgroundColor: '#BBB', margin: '0px', borderRadius: '2px 2px 0px 0px'}}>
            <div className='col-xs-12 login-modal-element'>
              <span className="red-text"> Contact DC Vault </span>
            </div>
          </div>

          <form id='contact-form' onSubmit={this.submit.bind(this)}>
            <div className='row'>
              <div className='col-xs-5 login-modal-element required'>
                Full Name:
              </div>
              <div className='col-xs-7 login-modal-element'>
                <input className='login-input' type='text' ref='nameInput'/>
              </div>
            </div>

            <div className='row'>
              <div className='col-xs-5 login-modal-element required'>
                Email Address:
              </div>
              <div className='col-xs-7 login-modal-element'>
                <input className='login-input' type='text' ref='emailInput'/>
              </div>
            </div>

            <div className='row'>
              <div className='col-xs-5 login-modal-element required'>
                Type of inquiry:
              </div>
              <div className='col-xs-7 login-modal-element'>
                <select name='inquiry' ref='inquiryType'>
                  <option value=''>Select...</option>
                  <option value='techincal'>Technical Issue</option>
                  <option value='discount'>Discount Code</option>
                  <option value='invite'>Training Group Invitation</option>
                  <option value='general'>General Inquiry</option>
                </select>
              </div>
            </div>

            <div className='row'>
              <div className='col-xs-12 login-modal-element required'>
                Please describe your inquiry with as much information as you can:
              </div>
              <div className='col-xs-12 login-modal-element'>
                <textarea rows='10' className='login-input' ref='emailBodyInput'/>
              </div>
            </div>

            <div className='row'>
              <div className='red-button' onClick={this.submit.bind(this)} tabIndex='0'>
                <span className='button-text'>Submit</span>
              </div>
            </div>
          </form>


          <div className="row">
            <div className='col-xs-12 login-modal-element'>
              <a id='contact-menu-close' className='smaller-text' style={{marginTop: '25px'}}>CLOSE</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContactModal;
