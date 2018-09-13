import React from 'react'

class Events extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      expandedDiv: null
    }
  }

  expandDiv (idx) {
    console.log('expanding', idx)

    if (this.state.expandedDiv === idx) {
      this.setState({
        expandedDiv: null
      })
    } else {
      this.setState({
        expandedDiv: idx
      })
    }
  }

  render () {
    let contentDivs = {past: [
      {
        partial: (<div className='event-block' id='08JUL2018'>
          <p className='event-block-title'>DC VAULT 10-YEAR ANNIVERSARY ​& TRAINING CENTER LAUNCH EVENT!​</p>
          <p className='event-block-info'><span className='event-block-date'>Sunday, Jul 8</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <span className='event-block-details-header'>Details</span>
          <ul className='event-block-details'>
            <li>Elite Competition: Featuring 2015 World Champion - SHAWN BARBER!</li>
            <li>Open Competition: All Ages - Free Entry!</li>
            <li>Grilled Food!</li>
            <li>Free EP (Explosive Performance)​ Training (optional)</li>
          </ul>
        </div>),
        full: (<div className='event-block'>
          <p className='event-block-title'>DC VAULT 10-YEAR ANNIVERSARY ​& TRAINING CENTER LAUNCH EVENT!​</p>
          <p className='event-block-info'><span className='event-block-date'>Sunday, Jul 8</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <span className='event-block-details-header'>Events</span>
          <ul className='event-block-details'>
            <li>Elite Competition: Featuring 2015 World Champion - SHAWN BARBER!</li>
            <li>Open Competition: All Ages - Free Entry!</li>
            <li>Grilled Food!</li>
            <li>Free EP (Explosive Performance)​ Training (optional)</li>
            <ul>
              <li>Multi-dimensional R​ange of Motion Warmups and Cooldowns + Vault Specific Strength Training Techniques and Methods ​classes lead by EP Master Trainer Ray Graziano</li>
              <li>EP Warmup session begins at 2:30pm</li>
              <li>EP Cool-down sessions as athletes complete competition</li>
              <li>EP Vault Specific Strength Trainin​g​ Techniques and Methods​ classes @ various times during event</li>
            </ul>
          </ul>
          <span className='event-block-details-header'>Facility</span>
          <ul className='event-block-details'>
            <li>DC Vault Training Center</li>
            <li>2200 East Capitol street NE, Washington DC 20003 </li>
            <li>Facility Features </li>
            <ul>
              <li>3 Mondo Runways</li>
              <li>Elite Pit - 2100 UCS Vault System </li>
              <li>Intermediate Pit - 1900 UCS Vault System </li>
              <li>Youth Pit - 1700 UCS Vault System </li>
              <li>Sorinex Strength Training Rigs </li>
              <li>UCS Spirit Vaulting Poles (10'8" 80lbs - 17'1" 205lbs)</li>
              <li>Specialty Pole Vault Training Equipment </li>
            </ul>
          </ul>
          <span className='event-block-details-header'>Registration</span>
          <ul className='event-block-details'>
            <li>Registration Closes Jun 30</li>
            <li>Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to register</li>
          </ul>
          <span className='event-block-details-header'>Note</span>
          <ul className='event-block-details'>
            <li>1/8" Pyramid Spikes ONLY!!! <span className='red-text'>(NO EXCEPTIONS!)</span></li>
            <li>Liability waivers must be signed at Check-in by athletes or their legal guardians (if under 18)</li>
          </ul>
          <span className='event-block-details-header'>Open Competitions</span>
          <ul className='event-block-details'>
            <li>2:30pm EP Warmup (optional)</li>
            <li>2:30pm-3:30pm Competitor Check-in <span className='red-text'>(NO LATE CHECK-IN!)</span></li>
            <li>3:00pm Runways Open for Warmups</li>
          </ul>
          <span className='event-block-details-header'>Elite Competition</span>
          <ul className='event-block-details'>
            <li>Women's Entry Standard: 4.0 meters </li>
            <li>Men's Entry Standard: 5.0 meters</li>
            <li>5:00pm-6:00pm Check-in (NO LATE CHECK-IN!)</li>
            <li>5:30pm Runways Open for Warmups</li>
          </ul>
        </div>)
      },
      {
        partial: (<div className='event-block' id='12JUL2018'>
          <p className='event-block-title'>Free Beginners Pole Vault Clinic</p>
          <p className='event-block-info'><span className='event-block-date'>Thursday, Jul 12</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <span className='event-block-details-header'>Details</span>
          <ul className='event-block-details'>
            <li>Youth 6-14 / Adult 21 and up</li>
            <li>Clinic runs from 5:30pm to 7:00pm</li>
            <li><span className='red-text'>Limited Space</span> - Register ahead to guarantee a slot</li>
            <li>Advance Registration Closes: July 10th</li>
            <li>Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to register</li>
          </ul>
        </div>)
      },
      {
        partial: (<div className='event-block' id='14JUL2018'>
          <p className='event-block-title'>Free Beginner + Intermediate Pole Vault Clinic</p>
          <p className='event-block-info'><span className='event-block-date'>Saturday, Jul 14</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <span className='event-block-details-header'>Details</span>
          <ul className='event-block-details'>
            <li>Open to participants of all ages</li>
            <li>Clinic runs from 10:30am to 12:30pm</li>
            <li><span className='red-text'>Limited Space</span> - Register ahead to guarantee a slot</li>
            <li>Advance Registration Closes: July 8th</li>
            <li>Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to register</li>
          </ul>
        </div>)
      }
    ],
      upcoming: []
    }

    return (
      <div className='event-description'>
        {contentDivs.upcoming.length ? (
          <div>
            <div className='row'>
              <div className='col-xs-12'>
                <p className='subsection-header'>Upcoming Events</p>
              </div>
            </div>
            <div className='row'>
              <div className='col-xs-12'>
                <span className='horizontalDivider' style={{opacity: '.1'}} />
              </div>
            </div>
            {contentDivs.upcoming.map((div, idx) => {
              let content = this.state.expandedDiv === idx ? div.full : div.partial
              let button = this.state.expandedDiv === idx ? (<span className='glyphicon glyphicon-menu-up' />) : (<span className='glyphicon glyphicon-menu-down' />)

              return (
                <div className='container event-block-full' key={idx}>
                  {content}
                  <div onClick={() => { this.expandDiv(idx) }} className='event-expand-btn' style={{display: div.full ? 'block' : 'none'}}>
                    {button}
                  </div>
                  <span className='horizontalDivider' style={{opacity: '.1'}} />
                </div>
              )
            })
          }
          </div>) : (
            <div>
              <div className='row'>
                <div className='col-xs-12'>
                  <p className='subsection-header'>Check back soon for information on Upcoming Events!</p>
                </div>
              </div>
              <div className='row'>
                <div className='col-xs-12'>
                  <span className='horizontalDivider' style={{opacity: '.1'}} />
                </div>
              </div>
              <div style={{margin: '64px'}} />
            </div>
          )}
        <div className='row'>
          <div className='col-xs-12'>
            <p className='subsection-header'>Past Events</p>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <span className='horizontalDivider' style={{opacity: '.1'}} />
          </div>
        </div>

        {
          contentDivs.past.reverse().map((div, idx) => {
            let content = this.state.expandedDiv === idx ? div.full : div.partial
            let button = this.state.expandedDiv === idx ? (<span className='glyphicon glyphicon-menu-up' />) : (<span className='glyphicon glyphicon-menu-down' />)

            return (
              <div className='container event-block-full' key={idx}>
                {content}
                <div onClick={() => { this.expandDiv(idx) }} className='event-expand-btn' style={{display: div.full ? 'block' : 'none'}}>
                  {button}
                </div>
                <span className='horizontalDivider' style={{opacity: '.1'}} />
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Events
