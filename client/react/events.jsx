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

  /*
  Note: When adding events please
   */
  render () {
    let contents = [
      {
        date: new Date('July 17, 2021'),
        partial: (<div className='event-block' id='17JUL2021'>
        <p className='event-block-title'>National<span className='red-text'>Street Vault</span> 2021</p>
        <img src = "../img/logos/streetvault21.jpg" alt="Street Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>July 16th-17th 2021</span>
          <br></br>
          <span className='event-block-date'>Eastern Market, 777 C Street SE - Washington DC</span>
        </p>
        <p className='event-block-info'>
          
        </p>        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only</li>
          <li>Registration Closed</li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$60 Registration</li>
        </ul>
        <span className='event-block-details-header'>Venue / Address</span>
        <ul className='event-block-details'>
          <li>Eastern Market, 777 C street SE, Washington DC</li>
          <li>Event Setup on C street SE (between 7th street SE and 8th street SE)</li>
        </ul>
        <span className='event-block-details-header'>Arrival / Parking</span>
        <ul className='event-block-details'>
          <li>Parking is available on site at 777 C street SE in the trader Joes Parking Garage <a style={{color: '#C0282D'}} href='../files/emarket-map.pdf' target='_blank'>(see map here)</a></li>
          <li><u>NOTE:</u> Unload Poles BEFORE turning onto C street if parking in the garage</li>
          <li><u>Additional Parking Garage located 1 block away at 600 Pennsylvania Ave NE (Colonial Parking)</u></li>
          <li>Metered On-Street Parking is available on 8th street and Pennsylvania avenue</li>
          <li>Free On-Street Parking is available in the surrounding neighborhood (easier to find near East Capitol street)</li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>Friday July 16th</li>
          <ul>
            <li>5:00pm - 7:00pm - Open Runway</li>
          </ul>
          <li>Saturday July 17th (Note: rolling schedule - arrive early in case your time slot moves up!)</li>
          <li>Flight 1 </li>
          <ul>
            <li>8:00am - warmups</li>
            <li>9:00 am - competition</li>
          </ul>
          <li>Fly Kids</li>
          <ul>
            <li>11:00am - warmups</li>
            <li>11:30am - competition</li>
          </ul>
          <li>Flight 2</li>
          <ul>
            <li>12:30pm - warmups</li>
            <li>1:30pm - competition</li>
          </ul>
          <li>Flight 3</li>
          <ul>
            <li>3:30pm - warmups</li>
            <li>4:30pm - competition</li>
          </ul>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>

        </div>),
                full: (<div className='event-block' id='26JUN2021'>
        <p className='event-block-title'>National<span className='red-text'>Street Vault</span> 2021</p>
        <img src = "../img/logos/streetvault21.jpg" alt="Street Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>July 16th-17th 2021</span>
          <br></br>
          <span className='event-block-date'>Eastern Market, 777 C Street SE - Washington DC</span>
        </p>
        <p className='event-block-info'>
          
        </p>        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only</li>
          <li>Registration Closed</li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$60 Registration</li>
        </ul>
        <span className='event-block-details-header'>Venue / Address</span>
        <ul className='event-block-details'>
          <li>Eastern Market, 777 C street SE, Washington DC</li>
          <li>Event Setup on C street SE (between 7th street SE and 8th street SE)</li>
        </ul>
        <span className='event-block-details-header'>Arrival / Parking</span>
        <ul className='event-block-details'>
          <li>Parking is available on site at 777 C street SE in the trader Joes Parking Garage <a style={{color: '#C0282D'}} href='../files/emarket-map.pdf' target='_blank'>(see map here)</a></li>
          <li><u>NOTE:</u> Unload Poles BEFORE turning onto C street if parking in the garage</li>
          <li><u>Additional Parking Garage located 1 block away at 600 Pennsylvania Ave NE (Colonial Parking)</u></li>
          <li>Metered On-Street Parking is available on 8th street and Pennsylvania avenue</li>
          <li>Free On-Street Parking is available in the surrounding neighborhood (easier to find near East Capitol street)</li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>Friday July 16th</li>
          <ul>
            <li>5:00pm - 7:00pm - Open Runway</li>
          </ul>
          <li>Saturday July 17th (Note: rolling schedule - arrive early in case your time slot moves up!)</li>
          <li>Flight 1 </li>
          <ul>
            <li>8:00am - warmups</li>
            <li>9:00 am - competition</li>
          </ul>
          <li>Fly Kids</li>
          <ul>
            <li>11:00am - warmups</li>
            <li>11:30am - competition</li>
          </ul>
          <li>Flight 2</li>
          <ul>
            <li>12:30pm - warmups</li>
            <li>1:30pm - competition</li>
          </ul>
          <li>Flight 3</li>
          <ul>
            <li>3:30pm - warmups</li>
            <li>4:30pm - competition</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Pole Drop-off/Pick-up</span>
        <ul className='event-block-details'>
          <li>Poles can be dropped off on the East end of the C street vault setup <a style={{color: '#C0282D'}} href='../files/emarket-map.pdf' target='_blank'>(see map here)</a> </li>
          <li>Poles may be placed inside the event site in the designated pole location only! <a style={{color: '#C0282D'}} href='../files/emarket-map.pdf' target='_blank'>(see map here)</a></li>
          <li>If you need to store poles overnight, arrangements can be made for drop-off and pick-up</li>
        </ul>
        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li>$30 cash at check-in</li>
          <li>NOTE: You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li>
        </ul>

        <span className='event-block-details-header'>Awards/Results/Sanctioning</span>
        <ul className='event-block-details'>
          <li>Medals will be awarded in all flights for male and female competitors, 1st through 3rd places</li>
          <li>Athletes who take gold at all 3 DC Vault summer events will earn the limited-edition DC Vault white medal</li>
          <li>Scored Flights</li>
          <ul>
            <li>Fly-Kids (ages 5-9)</li>
            <li>Flight 1 (ages 11 and up - PR 0 – 9’11”)</li>
            <li>Flight 2 (ages 11 and up - PR 10’-13’11”)</li>
            <li>Flight 3 (ages 11 and up - PR 14’+)</li>
          </ul>
          <li>USATF Sanctioned</li>
          <li>Results/Performance marks will be published at <a href="https://milesplit.com">Milesplit.com</a> and at <a href="https://dcvault.com/events">DCVault.com/events</a></li>
        </ul>
        <span className='event-block-details-header'>Spectator Info</span>
        <ul className='event-block-details'>
          <li>Individual seats can be set up around the event</li>
          <li>Tents are NOT allowed</li>
          <li>Some on site seating will be available </li>
          <li>Bathroom Facilities and water fountains are located inside the Eastern Market building, located on 7th street</li>
        </ul>

      </div>)
      },
      {
        date: new Date('August 14, 2021'),
        partial: (<div className='event-block' id='14AUG2021'>
        <p className='event-block-title'>Moon<span className='red-text'>Vault</span></p>
        <img src = "../img/logos/moon-2021.jpg" alt="Moon Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>August 14th 2021</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <p className='event-block-info'>
          
        </p>        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only</li>
          <li>Registration and Event info Coming Soon</li>
        </ul>
        </div>)
      },
      {
        date: new Date('June 26, 2021'),
        partial: (<div className='event-block' id='26JUN2021'>
        <p className='event-block-title'>2021 DMV <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/logos/ucsdmv.JPG" alt="DMV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, June 26th 2021</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <p className='event-block-info'>
          
        </p><span className='event-block-details-header'>Results</span>
        <ul className='event-block-details'>
          <li><a href = "https://www.milesplit.com/meets/425493-dmv-pole-vault-championships-2021/results#.YOXDF8hKg2w">Milesplit Results found here</a></li>
          <li><a style={{color: '#C0282D'}} href='../files/dmvresults-2021.xlsx' target='_blank'>Download Final Results Here!</a> </li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches can watch from outside the fence free of charge if they prefer</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>
        </ul>
        <span className='event-block-details-header'>Facility Address</span>
        <ul className='event-block-details'>
          <li>2200 East Capitol street NE Washington DC </li>
          <li><u>NOTE:</u> Do not enter "North" Capitol street or "NW" into your gps! Manually enter the address above or "DC Vault"!</li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>Note: Rolling Schedule - arrive early in case your time slot moves up!</li>
          <li><a style={{color: '#C0282D'}} href='../files/dmvstartlist.xlsx' target='_blank'>See Start List and Event Schedule here!</a> </li>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='26JUN2021'>
        <p className='event-block-title'>2021 DMV <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/logos/ucsdmv.JPG" alt="DMV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, June 26th 2021</span></p>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
          <span className='event-block-details-header'>Results</span>
        <ul className='event-block-details'>
          <li><a href = "https://www.milesplit.com/meets/425493-dmv-pole-vault-championships-2021/results#.YOXDF8hKg2w">Milesplit Results found here</a></li>
          <li><a style={{color: '#C0282D'}} href='../files/dmvresults-2021.xlsx' target='_blank'>Download Final Results Here!</a> </li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches can watch from outside the fence free of charge if they prefer</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>
        </ul>
        <span className='event-block-details-header'>Facility Address</span>
        <ul className='event-block-details'>
          <li>2200 East Capitol street NE Washington DC </li>
          <li><u>NOTE:</u> Do not enter "North" Capitol street or "NW" into your gps! Manually enter the address above or "DC Vault"!</li>
        </ul>
        <span className='event-block-details-header'>Pole Drop-off/Pick-up</span>
        <ul className='event-block-details'>
          <li>If you need to store poles overnight, arrangements can be made for drop-off and pick-up</li>
        </ul>
        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li>$15 cash at check-in</li>
          <li>You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li>
        </ul>
        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>
          <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>
          <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
          <ul>
            <li>Recommended so you don’t waste time at the event trying to change spikes!</li>
          </ul>
          <li>Available for $5 per set at the event (bring your own spike wrench)</li>
          
        </ul>
        <span className='event-block-details-header'>Awards/Results/Sanctioning</span>
        <ul className='event-block-details'>
          <li>Medals will be awarded in all divisions, 1st through 3rd places</li>
          <li>Athletes who take gold at all 3 DC Vault summer events will earn the limited-edition DC Vault white medal</li>
          <li>Scored Divisions</li>
          <ul>
            <li>Elementary (ages 5-10)</li>
            <li>Middle School (ages 11-13)</li>
            <li>High School (ages 14-18)</li>
            <li>Collegiate/Open (ages 19+)</li>
          </ul>
          <li>USATF Sanctioned</li>
          <li>Results/Performance marks will be published at <a href="https://milesplit.com">Milesplit.com</a> and at <a href="https://dcvault.com/events">DCVault.com/events</a></li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
        <li>Note: Rolling Schedule - arrive early in case your time slot moves up!</li>
        <li><a style={{color: '#C0282D'}} href='../files/dmvstartlist.xlsx' target='_blank'>See Start List and Event Schedule here!</a> </li>
        </ul>
        <span className='event-block-details-header'>Event Features</span>
        <ul className='event-block-details'>
          <li>Free Grilled hotdogs and veggie dogs for competitors and spectators!</li>
          <li>Bring something special for yourself if you’d like to grill it up!</li>
        </ul>
        <span className='event-block-details-header'>Pets</span>
        <ul className='event-block-details'>
          <li>Dog friendly venue!</li>
          <li>Bring a leash and water for your critter</li>
        </ul>

      </div>)
      },
      {
        date: new Date('September 12, 2020'),
        partial: (<div className='event-block' id='12SEP2020'>
            <p className='event-block-title'><span className='red-text'>FLY-KIDS</span> at <span className='red-text'>EASTERN</span> MARKET!</p>
            <p className='event-block-info'><span className='event-block-date'>Saturday, September 12 2020</span>
                <span className='event-block-location'>Eastern Market - Corner of 7th and C st SE</span></p>
            <span className='event-block-details-header'>Event Info</span>
            <ul className='event-block-details'>
                <li>Four 30-minute Fly-Kids intro classes</li>
                <li>Limited to 6 participants per class</li>
                <li>Beginners welcome!</li>
                <li>Ages 6-10</li>
                <li>Kids will be shown very basic fundamentals of pole vaulting</li>
                <li>Participants will have a chance to jump over a (soft) bar into the Fly-Kids landing mat</li>
                <li>Location - corner of 7th and C st SE</li>
                <li>Check-in 10 minutes prior to your groups start-time</li>
                <li>Must arrive on time to participate!</li>
            </ul>
            <span className='event-block-details-header'>Schedule</span>
            <ul className='event-block-details'>
                <li>10-10:30am – DC Vault Fly-Kids Exhibition</li>
                <li>10:30-11am – Group 1</li>
                <li>11-11:30am – Group 2</li>
                <li>11:30-12pm – Group 3</li>
                <li>12-12:30pm – Group 4</li>
            </ul>
            <span className='event-block-details-header'>Registration</span>
            <ul className='event-block-details'>
                <li>Free to participate</li>
                <li>Pre-Registration Required</li>
                <li>To register email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> with your information and what time slot you would like to sign up for.</li>
            </ul>
        </div>)
        },
      {
        date: new Date('October 30, 2020'),
        partial: (<div className='event-block' id='30OCT2020'>
        <p className='event-block-title'>Halloween <span className='red-text'>Vault</span></p>
        <p className='event-block-info'>
          <span className='event-block-date'>Friday, October 30th 2020</span>
          <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only - Registration Open September 30th</li>
          <li>Registration Closed</li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches are able to watch from outside the fence free of charge if they prefer</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li>Athletes enter the facility from the E. Capitol street sidewalk gate</li>
        </ul>
        <span className='event-block-details-header'>Facility Address</span>
        <ul className='event-block-details'>
          <li>2200 East Capitol street NE Washington DC </li>
          <li>NOTE: Do not enter "North" Capitol street or "NW" into your gps! Manually enter the address above or "DC Vault"!</li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>5:30pm (gates open)</li>
          <li>5:45pm (Fly-Kids competition Ages 5-10)</li>
          <li>6:30pm (Men's and Women's runway opens for warmups)</li>
          <li>7:00pm (Men's and Women's competition begins)</li>
        </ul>
        </div>),
        full: (<div className='event-block' id='30OCT2020'>
                <p className='event-block-title'>Halloween <span className='red-text'>Vault</span></p>
        <p className='event-block-info'>
          <span className='event-block-date'>Friday, October 30th 2020</span>
          <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only - Registration Open September 30th</li>
          <li>Registration Closed</li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches are able to watch from outside the fence free of charge if they prefer</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li>Athletes enter the facility from the E. Capitol street sidewalk gate</li>
        </ul>
        <span className='event-block-details-header'>Facility Address</span>
        <ul className='event-block-details'>
          <li>2200 East Capitol street NE Washington DC </li>
          <li>NOTE: Do not enter "North" Capitol street or "NW" into your gps! Manually enter the address above or "DC Vault"!</li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>5:30pm (gates open)</li>
          <li>5:45pm (Fly-Kids competition Ages 5-10)</li>
          <li>6:30pm (Men's and Women's runway opens for warmups)</li>
          <li>7:00pm (Men's and Women's competition begins)</li>
        </ul>
      </div>)
      },
      {
        date: new Date('August 1, 2020'),
        partial: (<div className='event-block' id='1AUG2020'>
          <p className='event-block-title'>Moon Vault (EXPAND FOR RESULTS)</p>
          <p className='event-block-info'>
            <span className='event-block-date'>Saturday, August 1st 2020</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <b>Compete under the Full Moon in the Nation's Capital!</b> <br></br>
          <span className='event-block-details-header'>Event Features</span>
          <ul className='event-block-details'>
            <li>Glowing-Vaulters in Body-Glow paint</li>
            <li>Free glowing party favors for kids</li>
            <li>Glow-bling for spectators</li>
            <li>Free grilled hot-dogs and burgers</li>
            <li>Prizes for best glow-costume </li>
            <li>Best Glow-Pet costume competition (bring your puppy dogs!)</li>
            <li>Glowing FLY-KIDS competition (ages 5-10)</li>
            <li>Medals awarded for 1st-3rd place finishes in Fly-Kids, Men's and Women's competition</li>
          </ul>
          <span className='event-block-details-header'>Venue</span>
          <ul className='event-block-details'>
            <li>DC Vault Pole Vault Center</li>
            <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
            <li>Parking On-Site (Lot #3)</li>
            <li>Athletes enter the facility from the E. Capitol street sidewalk gate</li>
          </ul>
          <span className='event-block-details-header'>Entry Fee</span>
          <ul className='event-block-details'>
            <li>$25 - Competitors (register online)</li>
            <li>Spectator Entry Fee: $5 (cash at the gates)</li>
            <ul>
              <li>Spectators are welcome to sit outside the fence to watch free of charge</li>
            </ul>
            <li>$15 - Pole Rental (Free for DCV members)</li>
            <li>Registration Closed</li>
            <li>Spikes: 1/8" SPIKES ONLY at this venue (available for $5/set if you cannot bring your own)</li>
          </ul>
          <span className='event-block-details-header'>Schedule</span>
          <ul className='event-block-details'>
            <li>7:45pm (gates open)</li>
            <li>8pm-9pm (warmup)</li>
            <li>9pm-11pm (competition)</li>
          </ul>
          <img src = "../img/logos/moonvault.jpg" alt="Moon Vault" width = '350'></img>
        </div>),
        full: (<div className='event-block' id='1AUG2020'>
        <p className='event-block-title'>Moon Vault</p>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, August 1st 2020</span>
          <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
        <b>Compete under the Full Moon in the Nation's Capital!</b> <br></br>
        <span className='event-block-details-header'>Event Features</span>
        <ul className='event-block-details'>
          <li>Glowing-Vaulters in Body-Glow paint</li>
          <li>Free glowing party favors for kids</li>
          <li>Glow-bling for spectators</li>
          <li>Free grilled hot-dogs and burgers</li>
          <li>Prizes for best glow-costume </li>
          <li>Best Glow-Pet costume competition (bring your puppy dogs!)</li>
          <li>Glowing FLY-KIDS competition (ages 5-10)</li>
          <li>Medals awarded for 1st-3rd place finishes in Fly-Kids, Men's and Women's competition</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li>Athletes enter the facility from the E. Capitol street sidewalk gate</li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$25 - Competitors (register online)</li>
          <li>Spectator Entry Fee: $5 (cash at the gates)</li>
          <ul>
            <li>Spectators are welcome to sit outside the fence to watch free of charge</li>
          </ul>
          <li>$15 - Pole Rental (Free for DCV members)</li>
          <li>Registration Closed</li>
          <li>Spikes: 1/8" SPIKES ONLY at this venue (available for $5/set if you cannot bring your own)</li>
        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>7:45pm (gates open)</li>
          <li>8pm-9pm (warmup)</li>
          <li>9pm-11pm (competition)</li>
        </ul>
        <img src = "../img/logos/moonvault.jpg" alt="Moon Vault" width = '350'></img>
        <br></br>
        <span className='event-block-details-header'>Men's Results</span>
        <ol className='event-block-details'>
          <li>4.75 - Pete Geraghty - DC Vault</li>
          <li>4.60 - Frankie Amore - VaultWorX</li>
          <li>4.60 - Chris Spiess - DC Vault</li>
          <li>4.60 - Ryan Kochert - Unattached</li>
          <li>4.45 - Matt Bigelow - Flying Circus</li>
          <li>4.45 - Wyatt Stewart - Unattached</li>
          <li>4.15 - Ian Hoffman - DC Vault</li>
          <li>4.15 - Timothy Santosa - DC Vault</li>
          <li>4.15 - Alejandro Adorno - WareHouse Pole Vault</li>
          <li>4.00 - Robert Kalinowski - WareHouse Pole Vault</li>
          <li>4.00 - Kevin Munson - DC Vault</li>
          <li>3.70 - Jordan Figueroa - DC Vault</li>
          <li>3.70 - Richard Mangogna - Unattached</li>
          <li>3.20 - Matthew Lourenco - St Anthony's High</li>
          <li>3.20 - Jackson Schreher - Fauquier High</li>
          <li>2.90 - Liam Conrardy - Unattached</li>
          <li>NM - Chad Ackerman - DC Vault</li>
          <li>NM - Joseph Kurelowech - Unattached</li>
          <li>NM - Nicolas Laurenco - St Anthony's High</li>
          <li>NM - Elyas Shafiq - Unattached</li>
          <li>Scratch - Jason Cheung - DC Vault</li>
          <li>Scratch - Ashton McCullers - DC Vault</li>
        </ol>
        <span className='event-block-details-header'>Women's Results</span>
        <ol className='event-block-details'>
          <li>3.65 - Kallie Knott - Vertical Village</li>
          <li>3.65 - Katya Olsen - DC Vault</li>
          <li>2.60 - Aliyah Hilman - Sandstorm</li>
          <li>2.60 - Deeya Garg - DC Vault</li>
          <li>2.15 - Katie Kaneko - DC Vault</li>
          <li>1.85 - Kiran Saini - DC Vault</li>
          <li>NM - Marissa D'Angelo - Unattached</li>
          <li>NM - Naami Wagner - DC Vault</li>
          <li>NM - Sienna Jacobson - DC Vault</li>
          <li>NM - Megan Futty - Unattached</li>
          <li>NM - Elizabeth Fitzgerald - DC Vault</li>
          <li>NM - Caroline Waterson - DC Vault </li>
        </ol>
      </div>)
      },
      {
        date: new Date('May 6, 2020'),
        partial: (<div className='event-block' id='06MAY2020'>
            <p className='event-block-title'>Adult Pole Vault Experience - DC Fray</p>
            <p className='event-block-info'><span className='event-block-date'>Wednesday, May 6 2020</span>
                <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
            <ul className='event-block-details'>
                <li>Ever wanted to try pole vaulting? Join DC Fray and DC Vault for some fun and a private lesson with expert vaulters! This outdoor pole vaulting training center is used for training everything from entry-level through elite athletes– and now, you!</li>
                <li>This is an adult beginner pole vaulting lesson. You’ll be shown the basic fundamentals of pole vaulting while learning how to carry, run, and plant a vaulting pole, how to swing and turn using high rings and ropes, and finally, how to jump into a vault mat and clear a low bar. Starting at 5 feet and moving up from there, this event couldn’t get any better.</li>
                <li>DC Vault will grill hot dogs for staff and attendees at the end of the event!</li>
                <li>Participants should bring water and comfortable sports clothing appropriate for the weather</li>
                <li>Spots are limited. Cost: $25 per vaulter</li>
                <li>Must be 21+</li>
                <li>Adults Can register to participate in this special event at <a href="https://dcfray.com/events/pole-vaulting-4-8">here</a></li>
            </ul>
        </div>)
        },
      {
        date: new Date('July 4, 2020'),
        partial: (<div className='event-block' id='4JUL2020'>
          <p className='event-block-title'>Independence Day Pole Vault Championships 2020</p>
          <p className='event-block-info'>
            <span className='event-block-date'>Saturday, July 4th 2020</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <b>JOIN US FOR A DAY OF POLE VAULTING AND THE NATIONAL FIREWORKS CELEBRATION</b> <br></br>
          <span className='event-block-details-header'>Venue</span>
          <ul className='event-block-details'>
            <li>DC Vault Pole Vault Center</li>
            <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
            <li>Parking On-Site (Lot #3)</li>
            <li>Athletes enter the facility from the E. Capitol street sidewalk gate</li>
          </ul>
          <span className='event-block-details-header'>Entry Fee</span>
          <ul className='event-block-details'>
            <li>$25 - Competitiors</li>
            <li>$15 - Pole Rental (Free for DCV members)</li>
          </ul>
          <span className='event-block-details-header'>Schedule</span>
          <ul className='event-block-details'>
            <li>4pm-5pm (warmup) / 5pm-7pm (competition)</li>
          </ul>
          <span className='event-block-details-header'>Event Schedule</span>
          <ul className='event-block-details'>
            <li>Jul 4th - Independence Day PV Championships - 4pm-5pm (warmup) / 5pm-7pm (competition)</li>
          </ul>
          <span className='event-block-details-header'>Awards</span>
          <ul className='event-block-details'>
            <li>Medals will be awarded for 1st through 3rd places</li>
          </ul>
        </div>)
        },
      {
        date: new Date('August 19, 2020'),
        partial: (<div className='event-block'>
          <p className='event-block-title'>DC Vault - Summer Pole Vault Series 2020</p>
          <p className='event-block-info'>
            <span className='event-block-date'>June 20th - August 19th 2020</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <b>Compete in the Nation's Capital!</b> <br></br>
          <span className='event-block-details-header'>Venue</span>
          <ul className='event-block-details'>
            <li>DC Vault Pole Vault Center</li>
            <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
            <li>Parking On-Site (Lot #3)</li>
            <li>Athletes enter the facility from the E. Capitol street sidewalk gate</li>
          </ul>
          <span className='event-block-details-header'>Entry Fee</span>
          <ul className='event-block-details'>
            <li>$25 - Competitiors</li>
            <li>$15 - Pole Rental (Free for DCV members)</li>
            <li>Registration Closed!</li>
          </ul>
          <span className='event-block-details-header'>Dates</span>
          <ul className='event-block-details'>
            <li><span className="red-text">&#42;</span> Saturday June 20</li>
            <li>Wednesday June 24</li>
            <li><span className="red-text">&#42;&#42;&#42;</span> Saturday July 4th</li>
            <li><span className="red-text">&#42;</span> Wednesday July 8</li>
            <li><span className="red-text">&#42;&#42;&#42;</span> Saturday August 1</li>
            <li><span className="red-text">&#42;</span> Wednesday August 19</li>
          </ul>
          <span className='event-block-details-header'>Key</span>
          <ul className='event-block-details'>
            <li><span className="red-text">&#42;</span> Medals awarded at all starred events</li>
            <li><span className="red-text">&#42;&#42;&#42;</span> Special Event </li>
          </ul>
          <span className='event-block-details-header'>Schedule</span>
          <ul className='event-block-details'>
            <li>Wednesdays 6pm-7pm (warmup) / 7pm-9pm (competition)</li>
            <li>Saturdays 10am-11am (warmup) / 11am-1pm (competition)</li>
          </ul>
          <span className='event-block-details-header'>Special Event Schedule</span>
          <ul className='event-block-details'>
            <li>Jul 4th - Independence Day PV Championships - 4pm-5pm (warmup) / 5pm-7pm (competition)</li>
            <li>Aug 1st - MOON VAULT - 8pm-9pm (warmup) / 9pm-11pm (competition)</li>
          </ul>
          <span className='event-block-details-header'>Awards</span>
          <ul className='event-block-details'>
            <li>Medals will be awarded for 1st through 3rd places</li>
          </ul>
          <b>Athletes who take Gold at all medal events will earn the limited edition DC Vault White medal</b>
        </div>)
      },
      {
        date: new Date('May 16, 2020'),
        partial: (<div className='event-block' id='16MAY2020'>
          <p className='event-block-title'>DC Spring Fling - urself over a bar</p>
          <p className='event-block-info'>
            <span className='event-block-date'>Saturday, Apr 16 2020</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <span className='event-block-details-header'>Venue</span>
          <ul className='event-block-details'>
            <li>DC Vault</li>
            <li>Washington DC</li>
            <li>Exterior Lighting</li>
            <li>Parking On-Site (Lot #3)</li>
          </ul>
          <span className='event-block-details-header'>Entry Fee</span>
          <ul className='event-block-details'>
            <li>$5 - Spectators (includes food)</li>
            <li>$10 - DC Vault competitors (includes food)</li>
            <li>$20 - Open competitors (includes food) </li>
            <li>Free - Puppy dogs and toddlers</li>
          </ul>
          <span className='event-block-details-header'>Schedule</span>
          <ul className='event-block-details'>
            <li>Registration: 1:00pm - 1:45pm</li>
            <li>Warm-ups: 1:00-pm - 2:00pm</li>
            <li>Competition: 2:00pm - 5:00pm</li>
            <li>BBQ Grill: 2:30pm - 5:00pm</li>
          </ul>
          <span className='event-block-details-header'>Expand For Full Info and Schedule Below</span>
        </div>),
        full: (<div className='event-block'>
          <p className='event-block-title'>DC Spring Fling - urself over a bar</p>
          <p className='event-block-info'><span className='event-block-date'>Thursday, Apr 16 2020</span>
            <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
          <span className='event-block-details-header'>Venue</span>
          <ul className='event-block-details'>
            <li>DC Vault</li>
            <li>Washington DC</li>
            <li>Exterior Lighting</li>
            <li>Parking On-Site (Lot #3)</li>
          </ul>
          <span className='event-block-details-header'>Ages</span>
          <ul className='event-block-details'>
            <li>6 and up</li>
          </ul>
          <span className='event-block-details-header'>Opening Height</span>
          <ul className='event-block-details'>
            <li>TBD based on entry marks</li>
            <li>Bars can go as low as 5' </li>
            <li>Fly-Kids (ages 6-10) can compete as low as 4' </li>
          </ul>
          <span className='event-block-details-header'>Sanctioning</span>
          <ul className='event-block-details'>
            <li>This is not a sanctioned event </li>
            <li>"DC Vault sudden death rules" in effect - if you no-height, you get one attempt at the next bar to advance and stay in the fight!</li>
          </ul>
          <span className='event-block-details-header'>Registration</span>
          <ul className='event-block-details'>
            <li>On-site registration at the event. </li>
            <li>Please email us at Events@dcvault.org if you think you are coming so we can plan for approximate # of participants (not required to participate)</li>
          </ul>
          <span className='event-block-details-header'>Entry Fee</span>
          <ul className='event-block-details'>
            <li>$5 - Spectators (includes food)</li>
            <li>$10 - DC Vault competitors (includes food)</li>
            <li>$20 - Open competitors (includes food) </li>
            <li>Free - Puppy dogs and toddlers</li>
          </ul>
          <span className='event-block-details-header'>Schedule</span>
          <ul className='event-block-details'>
            <li>Registration: 1:00pm - 1:45pm</li>
            <li>Warm-ups: 1:00-pm - 2:00pm</li>
            <li>Competition: 2:00pm - 5:00pm</li>
            <li>BBQ Grill: 2:30pm - 5:00pm</li>
          </ul>
          <span className='event-block-details-header'>Food</span>
          <ul className='event-block-details'>
            <li>Free Grilled Hot Dogs for competitors and spectators (a few veggie dogs will be available)</li>
            <li>Grill is lit at 2:00pm</li>
            <li>Bottled water provided</li>
          </ul>
        </div>)
      },
      {
        date: new Date('May 6, 2020'),
        partial: (<div className='event-block' id='06MAY2020'>
            <p className='event-block-title'>Adult Pole Vault Experience - DC Fray</p>
            <p className='event-block-info'><span className='event-block-date'>Wednesday, May 6 2020</span>
                <span className='event-block-location'>2200 East Capitol street NE, Washington DC</span></p>
            <ul className='event-block-details'>
                <li>Ever wanted to try pole vaulting? Join DC Fray and DC Vault for some fun and a private lesson with expert vaulters! This outdoor pole vaulting training center is used for training everything from entry-level through elite athletes– and now, you!</li>
                <li>This is an adult beginner pole vaulting lesson. You’ll be shown the basic fundamentals of pole vaulting while learning how to carry, run, and plant a vaulting pole, how to swing and turn using high rings and ropes, and finally, how to jump into a vault mat and clear a low bar. Starting at 5 feet and moving up from there, this event couldn’t get any better.</li>
                <li>DC Vault will grill hot dogs for staff and attendees at the end of the event!</li>
                <li>Participants should bring water and comfortable sports clothing appropriate for the weather</li>
                <li>Spots are limited. Cost: $25 per vaulter</li>
                <li>Must be 21+</li>
                <li>Adults Can register to participate in this special event at <a href="https://dcfray.com/events/pole-vaulting-4-8">here</a></li>
            </ul>
        </div>)
    },
      {
        date: new Date('July 8, 2018'),
        partial: (<div className='event-block' id='08JUL2018'>
          <p className='event-block-title'>DC VAULT 10-YEAR ANNIVERSARY ​& TRAINING CENTER LAUNCH EVENT!​</p>
          <p className='event-block-info'><span className='event-block-date'>Sunday, Jul 8 2018</span>
            <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
          <ul className='event-block-details'>
            <li>Elite Competition: Featuring 2015 World Champion - SHAWN BARBER!</li>
            <li>Open Competition: All Ages - Free Entry!</li>
            <li>Grilled Food!</li>
            <li>Free EP (Explosive Performance)​ Training (optional)</li>
          </ul>
        </div>),
        full: (<div className='event-block'>
          <p className='event-block-title'>DC VAULT 10-YEAR ANNIVERSARY ​& TRAINING CENTER LAUNCH EVENT!​</p>
          <p className='event-block-info'><span className='event-block-date'>Sunday, Jul 8 2018</span>
            <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
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
            <li>2100 East Capitol street NE, Washington DC 20003 </li>
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
        date: new Date('July 12, 2018'),
        partial: (<div className='event-block' id='12JUL2018'>
          <p className='event-block-title'>Free Beginners Pole Vault Clinic</p>
          <p className='event-block-info'><span className='event-block-date'>Thursday, Jul 12 2018</span>
            <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
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
        date: new Date('July 14, 2018'),
        partial: (<div className='event-block' id='14JUL2018'>
          <p className='event-block-title'>Free Beginner + Intermediate Pole Vault Clinic</p>
          <p className='event-block-info'><span className='event-block-date'>Saturday, Jul 14 2018</span>
            <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
          <ul className='event-block-details'>
            <li>Open to participants of all ages</li>
            <li>Clinic runs from 10:30am to 12:30pm</li>
            <li><span className='red-text'>Limited Space</span> - Register ahead to guarantee a slot</li>
            <li>Advance Registration Closes: July 8th</li>
            <li>Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to register</li>
          </ul>
        </div>)
      },
      {
        date: new Date('March 10, 2019'),
        partial: (<div className='event-block' id='10MAR2019'>
          <p className='event-block-title'>Free Beginner + Intermediate Pole Vault Clinic</p>
          <p className='event-block-info'><span className='event-block-date'>Sunday, Mar 10 2019</span>
            <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
          <ul className='event-block-details'>
            <li>Open to participants of all ages</li>
            <li>Clinic runs from 12:00pm-2:00pm</li>
            <li><span className='red-text'>Limited Space</span> - Register early to guarantee a slot</li>
            <li>Registration Closes: March 3rd, 2019</li>
            <li>Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to register</li>
          </ul>
        </div>)
      },
        {
            date: new Date('May 5, 2019'),
            partial: (<div className='event-block' id='5MAY2019'>
                <p className='event-block-title'>Capitol Hill Pole Vault Clinic - Free!</p>
                <p className='event-block-info'><span className='event-block-date'>Sunday, May 5 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <ul className='event-block-details'>
                    <li>Open to <span className = 'red-text'>Capitol Hill</span> Residents! (1st street to RFK stadium + H street NE to L street SE)</li>
                    <li>Experience: No experience necessary</li>
                    <li>Ages: Youth through Adult groups, ages 6 and up</li>
                    <li>Time: <span className = 'red-text'>12:30pm-2:30pm</span> (arrive by 12:20pm)</li>
                    <li>Bring: Water, sunblock and comfortable sports clothing</li>
                    <li>Food: Free BBQ Hot Dogs for participants at end of clinic! </li>
                    <li>Dogs: Family dogs welcome! Bring a leash and water for your critter please. </li>
                    <li>Spectators: Friends and Family are welcome to watch.</li>
                    <li>Facility: DC Vault Pole Vault Training Facility</li>
                    <li>Address: 2100 East Capitol street NE Washington DC</li>
                    <li>Parking: Available in Lot #3 </li>
                    <li>Registration: Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to register. <span className = 'red-text'>Limited Space</span> - Register early to guarantee a slot! </li>
                </ul>
            </div>)
        },
        {
            date: new Date('April 17, 2019'),
            partial: (<div className='event-block' id='17APR2019'>
                <p className='event-block-title'>DC Fray Adult Pole Vault Class</p>
                <p className='event-block-info'><span className='event-block-date'>Wednesday, Apr 17 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <ul className='event-block-details'>
                    <li>DC Fray and DC Vault team up to host the Fray Life Adult Pole Vault Class!</li>
                    <li>Class runs from 6:30pm-8:00pm</li>
                    <li>NO EXPERIENCE NECESSARY!</li>
                    <li>Participants should bring water and comfortable sports clothing appropriate for the weather</li>
                    <li>Adult 21 and up</li>
                    <li><span className='red-text'>Limited Space</span> - Register early to guarantee a slot</li>
                    <li>Adults Can register to participate in this special event at <a href="https://dcfray.com/events/pole-vaulting-3/">here</a></li>
                </ul>
            </div>)
        },
        {
            date: new Date('April 28, 2019'),
            partial: (<div className='event-block' id='28APR2019'>
                <p className='event-block-title'>VA Highschool Clinic - Free!</p>
                <p className='event-block-info'><span className='event-block-date'>Sunday, Apr 28 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <ul className='event-block-details'>
                    <li>Time: <span className='red-text'>10am-12pm</span></li>

                    <li>Details: Free Beginner/Intermediate Pole Vault Clinic - Open to all <span className='red-text'>Virginia State High School athletes!</span></li>
                    <ul>
                      <li>Athletes will receive instruction for DC Vault coaching staff.</li>
                      <li>Beginners will be moved through the fundamentals of executing primary phases of the vault.</li>
                      <li>Intermediate athletes will work on improving their primary and secondary phases of the vault depending on individual technical needs.</li>
                    </ul>
                    <li>Waivers: All participants must sign waivers in advance.</li>
                    <ul>
                      <li>Minors must have a parent or guardian sign their waivers.</li>
                      <li>Waivers will be sent during registration and must be presented at the clinic.</li>
                    </ul>

                    <li>Spikes: Intermediate athletes may use 1/8" pyramid spikes ONLY! Standard 1/4" spikes will NOT be permitted on the runways - No Exceptions!</li>

                    <li>Bring: Comfortable athletic clothing and running shoes.</li>

                    <li>Parking:Available in <span className='red-text'>Lot #3</span></li>

                    <li>Registration/Deadline: Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> no later than <span className='red-text'>April 25th!</span></li>
                </ul>
            </div>)
        },
        {
            date: new Date('April 28, 2019'),
            partial: (<div className='event-block' id='28APR20192'>
                <p className='event-block-title'>Open Vault Day - Free!</p>
                <p className='event-block-info'><span className='event-block-date'>Sunday, Apr 28 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <ul className='event-block-details'>
                    <li>Time: <span className='red-text'>12pm-1:30pm</span></li>

                    <li>Coaches bring your vaulters and use all the equipment that the Pole Vault Training Center has to offer in order to fine tune your athletes for their upcoming Championship meets!</li>
                    <ul>
                        <li>Open to all experienced high school pole vaulters.</li>
                        <li>Athletes MUST be accompanied by their high school or club coach.</li>
                    </ul>
                    <li>Waivers: All participants must sign waivers in advance.</li>
                    <ul>
                        <li>Minors must have a parent or guardian sign their waivers.</li>
                        <li>Waivers will be sent during registration and must be presented at the clinic.</li>
                    </ul>

                    <li>Spikes: Intermediate athletes may use 1/8" pyramid spikes ONLY! Standard 1/4" spikes will NOT be permitted on the runways - No Exceptions!</li>

                    <li>SAFETY: Please Note - Athletes who are unable to safely execute a vault or who demonstrate unsafe actions will not be allowed to continue utilizing the facility.</li>
                    <ul>
                      <li>This opportunity is meant for experienced athletes who are preparing for their end of season championship meets. </li>
                      <li>Coaches, please do not bring beginners who lack the necessary skills to safely execute primary phases of the vault.</li>
                    </ul>
                    <li>Parking:Available in <span className='red-text'>Lot #3</span></li>

                    <li>Registration/Deadline: Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a> to guarantee a slot to participate. Coaches - each of your athletes will need to register individually not later than <span className='red-text'>April 25th!</span> </li>
                </ul>
            </div>)
        },
        {
            date: new Date('July 4, 2019'),
            partial: (<div className='event-block' id='04JUL2019'>
                <p className='event-block-title'>Independence Day - Pole Vault Championships</p>
                <p className='event-block-info'><span className='event-block-date'>Thursday, July 4th 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <span className='event-block-details-header'>Registration</span>
                <ul className='event-block-details'>
                    <li>Registration now closed - <a href='/files/flight.xlsx' download>CLICK HERE FOR FLIGHT AND GROUP INFO</a></li>
                </ul>
                <span className='event-block-details-header'>Expand For Full Info and Schedule Below</span>
            </div>),
            full: (<div className='event-block'>
                <p className='event-block-title'>Independence Day - Pole Vault Championships</p>
                <p className='event-block-info'><span className='event-block-date'>Thursday, July 4th 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <span className='event-block-details-header'>Registration</span>
                <ul className='event-block-details'>
                    <li>Registration now closed - <a href='/files/flight.xlsx' download>CLICK HERE FOR FLIGHT AND GROUP INFO</a></li>
                </ul>
                <span className='event-block-details-header'>Team Competition</span>
                <ul className='event-block-details'>
                    <li>Teams must enter 5 or more athletes to be scored (honor system – please, no ringers)</li>
                    <li>Teams will be scored against one another for 1st, 2nd 3rd place awards.</li>
                    <li>Unattached athletes or those participating on a team with fewer than 5 members will not be scored but will rank in individual flight placing.</li>
                </ul>
                <span className='event-block-details-header'>Team Awards</span>
                <ul className='event-block-details'>
                    <li><span className = 'red-text'>1st</span> place:  2 UCS Spirit Poles <span className = 'red-text'>+</span> 2 UCS Spirit Crossbars <span className = 'red-text'>+</span> 1 UCS Spirit Pole Bag</li>
                    <li><span className = 'red-text'>2nd</span> place:  1 UCS Spirit Pole <span className = 'red-text'>+</span> 1 UCS Spirit Crossbar <span className = 'red-text'>+</span> 1 UCS Spirit Pole Bag</li>
                    <li><span className = 'red-text'>3rd</span> place:  1 UCS Spirit Pole Bag</li>

                </ul>
                <span className='event-block-details-header'>Individual Awards</span>
                <ul className='event-block-details'>
                    <li>Medals will be given to 1st, 2nd, and 3rd place finishers in each age group.</li>
                </ul>
                <span className='event-block-details-header'>Venue</span>
                <ul className='event-block-details'>
                    <li>This event will be hosted at the DC Vault Pole Vault Center, located on East Capitol street - straight down the road from the US Capitol dome and the National Fireworks Celebration!</li>
                    <li>This ‘dog friendly’ facility features 3 Mondo Runways, 3 UCS Pits (1700, 1900, 2100), a complete series of UCS Spirit Vaulting Poles, a variety of training implements and of course... a BBQ Grill! As a bonus, participants have immediate access to the RFK Skate Park for those who want to bring their boards.</li>
                    <li>Location:</li>
                    <ul>
                        <li>2100 East Capitol street NE Washington DC 20002</li>
                        <li>Parking: Lot #3</li>
                        <li>Metro: Stadium/Armory metro station (Blue, Orange, and Silver lines)</li>
                    </ul>
                </ul>
                <span className='event-block-details-header'>National Fireworks</span>
                <ul className='event-block-details'>
                    <li>The National Fireworks Celebration in Washington DC is one of the most spectacular events to witness in the USA. Few things compare to viewing the fireworks above the US Capitol, Washington Monument, Lincoln Memorial, etc.</li>
                    <li>Fireworks begin at 9:09pm sharp.</li>
                    <ul>
                        <li>Competition is scheduled to wrap up at 7:30pm, leaving plenty of time to make it to the celebration.</li>
                    </ul>
                    <li>Directions from DC Vault - by foot:</li>
                    <ul>
                        <li>Leave your car at DC Vault and walk straight down East Capitol street through historic Capitol Hill neighborhood, towards the US Capitol dome. Walk left or right around the Capitol to the National Mall side of the grounds.</li>
                        <li>Access Points to the National Mall are located at Pennsylvania avenue and 3rd street NW or Constitution avenue and 3rd street SW. For additional access points and information, see <a href ="https://home.nps.gov/subjects/nationalmall4th">home.nps.gov/subjects/nationalmall4th</a></li>
                    </ul>
                    <li>Directions from DC Vault - by metro: </li>
                    <ul>
                        <li>Leave your car at DC Vault and walk right across the street from the DC Vault Facility to the Stadium/Armory metro station. Take the quick 12-minute ride directly to the Smithsonian metro stop by the Washington Monument.</li>
                        <li>On your return trip, consider using the L'Enfant or Federal Center SW metro stations to avoid the overcrowding that will occur at Smithsonian metro station.</li>
                    </ul>
                    <li>Complete information can be found at the National Parks Service Website: </li>
                    <ul>
                        <li><a href ="https://home.nps.gov/subjects/nationalmall4th">home.nps.gov/subjects/nationalmall4th</a></li>
                    </ul>
                </ul>
                <span className='event-block-details-header'>Event Schedule</span>
                <ul className = 'event-block-details'>
                    <li>Wednesday - July 3rd</li>
                    <ul>
                        <li>6:00 - 7:30 pm - Pole Drop-off and open runway practice</li>
                    </ul>
                    <li>Thursday - July 4th (Final Schedule)</li>
                    <ul>
                        <li><b>Flight 1 (0.0m - 3.19m):</b></li>
                        <li>12:30pm-1:30pm - check-in & pole pickup/drop-off</li>
                        <li>1:00pm-2:00pm - warmups</li>
                        <li>2:00pm - competition</li>

                        <li><b>Flight 2 (3.20m - 3.99m):</b></li>
                        <li>12:30pm-1:30pm - check-in & pole pickup/drop-off</li>
                        <li>1:00pm-2:00pm - warmups</li>
                        <li>2:00pm - competition</li>

                        <li><b>Flight 3 (4.0m +):</b></li>
                        <li>3:00pm-4:00pm - check-in & pole pickup/drop-off</li>
                        <li>3:30-4:30pm - warmups</li>
                        <li>4:30pm - competition</li>

                        <li><b>Additional:</b></li>
                        <li>2:00pm - Fire up the grill for Free BBQ</li>
                        <li>5:30pm - Pole drop-off for those attending the National Fireworks</li>
                        <li>9:00pm - National Fireworks!</li>
                        <li>11:00pm - Pole Pickup</li>
                    </ul>
                    <li>Friday - July 5th</li>
                    <ul>
                        <li>2:00pm-2:30pm - Pole Pickup</li>
                    </ul>
                    <li>Saturday - July 6th </li>
                    <ul>
                        <li>2:00pm-2:30pm - Pole Pickup</li>
                    </ul>
                    <li>Sunday - July 7th</li>
                    <ul>
                        <li>10:30am-12:30pm - Pole Pickup</li>
                    </ul>
                </ul>

                <span className='event-block-details-header'>Pole Pickup and Dropoff</span>
                <ul className = 'event-block-details'>
                    <li>Poles and pole bags can be dropped off Wednesday evening for those arriving ahead of time. As per the event schedule, pole pickup times will be available over the course of the entire weekend for those staying in DC to enjoy the capitol.</li>
                    <li>Poles or Pole Bags must be Tagged with complete name and contact info (we will NOT have tags for you). The name on the poles must match a photo ID to be reclaimed.</li>
                    <li>Poles will be secured in a locked storage conex but are not guaranteed against theft, lost poles, damage, etc. This is a convenience - If these conditions are not acceptable, secure your poles elsewhere.</li>
                </ul>

                <span className='event-block-details-header'>Scoring System</span>
                <ul className = 'event-block-details'>
                    <li>Athletes compete in performance-based flights however, athletes are scored based on age divisions.</li>
                    <li>Age divisions are broken into 5-year increments beginning with ages 5-9.</li>
                    <li>Points are awarded for 1st through 5th place in each age division as follows.</li>
                    <ul>
                        <li>1st = 10</li>
                        <li>2nd = 8</li>
                        <li>3rd = 6</li>
                        <li>4th = 4</li>
                        <li>5th = 2</li>
                    </ul>
                    <li>Unattached athletes may bump a team athlete out of a place, lowering the team score. If an unattached athlete takes 1st in their age division and a team athlete takes 2nd, the team is awarded 8 points for 2nd place.</li>
                    <li>No Jump-Offs!</li>
                    <ul>
                        <li>In the event of a tie, one of several fitness challenges will be proposed by the official who will set the rules (number of muscle ups, 20m sprint or number of Bubkas for example). If clubs cannot agree upon which fitness challenge, a coin will be flipped and called by the official.</li>
                        <li>Teams may choose any member who cleared a bar in the competition to represent the team for the challenge (show us what you've got!).</li>
                    </ul>
                </ul>
                <span className='event-block-details-header'>Spikes!!! - Spikes!!! - Spikes!!!</span>
                <ul className = 'event-block-details'>
                    <li>Please Note: Only 1/8" spikes are allowed at this facility! These are smaller than the standard 1/4" spikes allowed at most meets! Order and install your 1/8" Spikes ahead of time so you don't run into an issue at the event! A limited number of 1/8" spikes will be available for cash purchase at the event - bring your own spike wrench!</li>
                </ul>
                <span className='event-block-details-header'>Pole Rentals</span>
                <ul className = 'event-block-details'>
                    <li>Poles will be available for rent for $25 (cash only - exact change)</li>
                    <li>Your ID will be held in exchange for the pole</li>
                    <li>Note - you may be sharing your pole with another vaulter</li>
                    <li>If you break our pole, you will be required to pay the list price of the pole. Current prices can be found at UCSSpirit.com</li>
                    <ul>
                        <li>Available Poles:</li>
                        <ul>
                            <li>8'0"	40	ALTIUS (KIDS)</li>
                            <li>8'0"	50	ALTIUS (KIDS)</li>
                            <li>8'0"	60	ALTIUS (KIDS)</li>
                            <li>9'0"	60	ALTIUS (KIDS)</li>
                            <li>9'0"	70	ALTIUS (KIDS)</li>
                            <li>10'0"	70	ALTIUS (KIDS)</li>
                            <li>10'0"	80	ALTIUS (KIDS)</li>
                            <li>10'0"	90	ALTIUS (KIDS)</li>
                            <li>10'8"	90	UCS</li>
                            <li>10'8"	100	UCS</li>
                            <li>10'8"	110	UCS</li>
                            <li>10'8"	120	UCS</li>
                            <li>11'6"	120	UCS</li>
                            <li>11'6"	130	UCS</li>
                            <li>12'0"	120	UCS</li>
                            <li>12'0"	120	UCS</li>
                            <li>12'0"	130	UCS</li>
                            <li>12'0"	140	UCS</li>
                            <li>12'0"	150	UCS</li>
                            <li>13'0"	125	UCS</li>
                            <li>13'0"	125	UCS</li>
                            <li>13'0"	130	UCS</li>
                            <li>13'0"	130	UCS</li>
                            <li>13'0"	135	UCS</li>
                            <li>13'0"	140	UCS</li>
                            <li>13'0"	145	UCS</li>
                            <li>13'0"	150	UCS</li>
                            <li>13'0"	150	UCS</li>
                            <li>13'0"	155	UCS</li>
                            <li>13'0"	155	UCS</li>
                            <li>13'0"	160	UCS</li>
                            <li>13'0"	165	UCS</li>
                            <li>13'0"	165	UCS</li>
                            <li>13'0"	170	UCS</li>
                            <li>13'0"	175	UCS</li>
                            <li>13'0"	180	UCS</li>
                            <li>13'7"	140	UCS</li>
                            <li>13'7"	155	UCS</li>
                            <li>13'7"	160	UCS</li>
                            <li>13'7"	165	UCS</li>
                            <li>13'7"	180	UCS</li>
                            <li>14'0"	140	UCS</li>
                            <li>14'0"	140	UCS</li>
                            <li>14'0"	140	UCS</li>
                            <li>14'0"	145	UCS</li>
                            <li>14'0"	145	UCS</li>
                            <li>14'0"	150	UCS</li>
                            <li>14'0"	150	UCS</li>
                            <li>14'0"	155	UCS</li>
                            <li>14'0"	160	UCS</li>
                            <li>14'0"	160	UCS</li>
                            <li>14'0"	160	UCS</li>
                            <li>14'0"	165	UCS</li>
                            <li>14'0"	170	UCS</li>
                            <li>14'0"	175	UCS</li>
                            <li>14'0"	180	UCS</li>
                            <li>14'7"	160	UCS</li>
                            <li>14'7"	165	UCS</li>
                            <li>14'7"	170	UCS</li>
                            <li>14'7"	175	UCS</li>
                            <li>14'7"	180	UCS</li>
                            <li>15'0"	150	UCS</li>
                            <li>15'0"	155	UCS</li>
                            <li>15'0"	165	UCS</li>
                            <li>15'0"	175	UCS</li>
                            <li>15'0"	180	UCS</li>
                            <li>15'0"	180	UCS</li>
                            <li>15'0"	185	UCS</li>
                            <li>15'0"	190	UCS</li>
                            <li>15'0"	205	UCS</li>
                            <li>15'7"	170	UCS</li>
                            <li>15'7"	180	UCS</li>
                            <li>15'7"	190	UCS</li>
                            <li>15'7"	205	UCS</li>
                            <li>16'0"	185	UCS</li>
                            <li>16'0"	185	UCS</li>
                            <li>16'0"	190	UCS</li>
                            <li>16'0"	195	UCS</li>
                            <li>16'0"	200	UCS</li>
                            <li>16'0"	205	UCS</li>
                            <li>16'5"	185	UCS</li>
                            <li>16'5"	190	UCS</li>
                            <li>16'5"	195	UCS</li>
                            <li>16'5"	200	UCS</li>
                            <li>16'5"	205	UCS</li>
                            <li>17'0"	200	UCS</li>
                            <li>17'0"	205	UCS</li>
                        </ul>
                    </ul>
                </ul>

            </div>)
        },
        {
            date: new Date('July 14, 2019'),
            partial: (<div className='event-block' id='14JUL2019'>
                <p className='event-block-title'>Fly-Kids DC - Pole Vault Experience at Eastern Market!</p>
                <p className='event-block-info'><span className='event-block-date'>Sunday, July 14th 2019</span>
                    <span className='event-block-location'>Eastern Market - 225 7th St SE, Washington, District of Columbia 20003</span></p>
                <ul className='event-block-details'>
                    <li>Open <span className='red-text'>Pole Vault</span> Experience for kids ages 6-11.</li>
                    <li>No registration necessary. Come as you are and look for the FLY-KIDS DC pole vault pit!</li>
                    <li>Kids will have the chance to jump at a safety bar with the <span className = 'red-text'>DC Vault</span> staff while parents explore Eastern Market, shop at vendor booths, sip coffee at Peregrine, have breakfast at Bullfrog Bagels, or brunch at a variety of locations!</li>

                    <li>RSVP on Facebook <a href='https://www.facebook.com/events/500071877401666/'>here!</a> </li>
                    <li>Check out the <a href='https://www.facebook.com/EasternMarketDC/'>Venue!</a></li>
                </ul>
            </div>)
        },
        {
            date: new Date('August 14, 2019'),
            partial: (<div className='event-block' id='14AUG2019'>
                <p className='event-block-title'>DC Fray Adult Pole Vault Class</p>
                <p className='event-block-info'><span className='event-block-date'>Wednesday, Aug 14 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <ul className='event-block-details'>
                    <li>DC Fray and DC Vault team up to host the Fray Life Adult Pole Vault Class!</li>
                    <li>Class runs from 6:30pm-8:00pm</li>
                    <li>NO EXPERIENCE NECESSARY!</li>
                    <li>Participants should bring water and comfortable sports clothing appropriate for the weather</li>
                    <li>Adult 21 and up</li>
                    <li><span className='red-text'>Limited Space</span> - Register early to guarantee a slot</li>
                    <li>Adults Can register to participate in this special event at <a href="https://dcfray.com/events/pole-vaulting-3-2-2-2/">here</a></li>
                </ul>
            </div>)
        },
        {
            date: new Date('September 8, 2019'),
            partial: (<div className='event-block' id='8SEP2019'>
                <p className='event-block-title'>FLY-KIDS DC TRIAL CLASS</p>
                <p className='event-block-info'><span className='event-block-date'>Sunday, Sep 8 2019</span>
                    <span className='event-block-location'>2100 East Capitol street NE, Washington DC</span></p>
                <ul className='event-block-details'>
                    <li>Ages: 5-10</li>
                    <li>Time: 11:30am-12:30pm</li>
                    <li>Bring: Water</li>
                    <li>Spectators: Welcome</li>
                    <li>Dogs: Welcome (bring water and a leash!)</li>
                    <li>Facility: DC Vault Pole Vault Training Center</li>
                    <li>Parking: Lot #3</li>
                    <li>Cost: $20</li>
                    <li>Register (Trial Class): Email <a href='mailto:events@dcvault.org'>events@dcvault.org</a></li>
                    <li>Register (Fall Course): DCVault.com (Training Section)</li>
                </ul>
            </div>)
        }



    ]

    let contentDivs = {past: [], upcoming: []}
    let t1 = new Date(); /* Todays date */

    contents.forEach(item => {
      if (item.date < t1) {
        contentDivs.past.push(item)
      } else {
        contentDivs.upcoming.push(item)
      }
    })

    contentDivs.upcoming = contentDivs.upcoming.sort((a, b) =>
        a.date - b.date
    );

    contentDivs.past = contentDivs.past.sort((a, b) =>
       a.date - b.date
    );
    /* Debugging log to make sure that the objects get placed in the correct array*/
    console.log('past' + contentDivs.past);
    console.log('upcoming' + contentDivs.upcoming);


    return (
      <div className='event-description'>
        {contentDivs.upcoming.length ? (
          <div>
            <div className='row'>
              <div className='col-xs-12'>
                <p className='subsection-header'><span className='red-text'>Upcoming</span> Events</p>
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
            <p className='subsection-header' style={{marginTop: '10%'}}>Past Events</p>
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
