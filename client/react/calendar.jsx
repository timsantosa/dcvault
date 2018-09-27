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
        height: 850,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        themeSystem: 'bootstrap3',
        googleCalendarApiKey: window.configVariables.GOOGLE_CALENDAR_API_KEY,
        events: {
          googleCalendarId: 'dcvaultt@gmail.com'
        }
      })
    })
  }

  render () {
    return (
      <div id='full-calendar' />
    )
  }
}

export default Calendar
