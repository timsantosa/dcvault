import React from 'react'

class GenericModal extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    return (
      <div className='fade-bg'>
        <div className='generic-modal'>
          <div className='row generic-modal__title__container'>
            <div className='col-xs-12 generic-modal__title'>
              <p>{this.props.title}</p>
              <i className='glyphicon glyphicon-remove generic-modal__close-btn' onClick={this.props.onClose ? this.props.onClose() : () => {}} />
            </div>
          </div>
          <div className='row generic-modal__content__container'>
            <div className='col-xs-10 col-xs-push-1 generic-modal__content'>
              {this.props.childComponent ? this.props.childComponent : 'THIS MODAL HAS NO CONTENT'}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default GenericModal
