import React from 'react'
import 'fullcalendar'
import $ from 'jquery'
import '../../node_modules/fullcalendar/dist/gcal.min.js'

class Calendar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showing: false
    }
  }

  componentDidMount () {
    var containerEl = $('#full-calendar')
    $(function () {
      containerEl.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listWeek'
        },
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        themeSystem: 'bootstrap3',
        googleCalendarApiKey: 'AIzaSyDRAKA16wpzSNIB6hOACMyYWHFWe2bT0x0',
        events: {
          googleCalendarId: 'dcvaultt@gmail.com'
        }
      })
    })
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
        // <iframe id='google-embedded-calendar' className='embed-responsive-item' src='https://calendar.google.com/calendar/embed?showTitle=0&amp;showNav=0&amp;showCalendars=0&amp;height=800&amp;wkst=1&amp;bgcolor=%23ffffff&amp;src=dcvaultt%40gmail.com&amp;color=%231B887A&amp;ctz=America%2FNew_York' style={{borderWidth: '0', display: 'none'}} width='100%' height='400px' frameBorder='0' scrolling='no' />

  render () { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div id='full-calendar' />
    )
  }
}

export default Calendar
