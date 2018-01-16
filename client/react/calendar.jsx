import React from 'react'

class Calendar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showing: false
    }
  }

  toggleCalendar () {
    if (this.state.showing) {
      document.getElementById('google-embedded-calendar').style.display = 'none'
      document.getElementById('toggle-calendar-button-text').innerHTML = 'Show Calendar'
      this.setState({showing: false})
    } else {
      document.getElementById('google-embedded-calendar').style.display = 'block'
      document.getElementById('toggle-calendar-button-text').innerHTML = 'Hide Calendar'
      this.setState({showing: true})
    }
  }

  render () { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div>
        <div className='red-button' onClick={this.toggleCalendar.bind(this)}>
          <span id='toggle-calendar-button-text' className='button-text'>Show Calendar</span>
        </div>
        <iframe id='google-embedded-calendar' className='embed-responsive-item' src='https://calendar.google.com/calendar/embed?showTitle=0&amp;showNav=0&amp;showCalendars=0&amp;height=800&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=dcvaultt%40gmail.com&amp;color=%231B887A&amp;ctz=America%2FNew_York' style={{borderWidth: '0', display: 'none'}} width='100%' height='400px' frameBorder='0' scrolling='no' />
      </div>
    )
  }
}

export default Calendar
