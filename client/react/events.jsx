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
        date: new Date('August 09, 2025'),
        partial: (<div className='event-block' id='08AUG2025'>
        <p className='event-block-title'>2025 FLY-KIDS <span className='red-text'>SUMMER</span> CAMPS</p>
        <img src = "../img/events/kidscamp25_1.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Pole Vaulting, Fitness and Games!</span>
          <br></br>
          <span className='event-block-date'>July 21st through August 8th</span>
          <br></br>
          <span className='event-block-date'>DC Vault: 2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates</span>
        <ul className='event-block-details'>
          <span className='event-block-date'>July 21st - July 25th, 2025 *Week 1 Registration open soon!</span>
          <br></br>
          <span className='event-block-date'>July 28th - August 1st, 2025 *Registration will only open if week 1 fills up</span>
          <br></br>
          <span className='event-block-date'>August 4th - August 8th, 2025 *Registration will only open if week 2 fills up</span>
          <br></br>
        </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-12</li>
          <li>Beginners through Advanced Pole Vaulters</li>
          <li>2 weeks to choose from</li>
          <li>Monday thru Friday 8:45am – 3:15pm</li>
          <li>Dropoff window 8:45am-9:00am</li>
          <li>Pickup window 3:00-3:15pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more</li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>Tuesday &amp; Thursday includes an Ice Cream stop during lunch break</li>
        </ul>
        
        <span className='event-block-details-header'>Included with Registration</span>
        <ul className='event-block-details'>
          <li>All equipment for use during camp</li>
          <li>Ice Cream trips on Tuesday and Thursday</li>
          <li>DC Vault t-shirt (youth sizes only)</li>
          <li>Healthy Snacks</li>
        </ul>
        
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='08AUG2025'>
          <p className='event-block-title'>2025 FLY-KIDS <span className='red-text'>SUMMER</span> CAMPS</p>
          <img src = "../img/events/kidscamp25_1.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
          <p className='event-block-info'>
            <span className='event-block-date'>Pole Vaulting, Fitness and Games!</span>
            <br></br>
            <span className='event-block-date'>July 21st through August 8th</span>
            <br></br>
            <span className='event-block-date'>DC Vault: 2200 East Capitol street NE, Washington DC</span>
          </p>
          <span className='event-block-details-header'>Dates</span>
          <ul className='event-block-details'>
            <span className='event-block-date'>July 21st - July 25th, 2025 *Week 1 Registration open soon!</span>
            <br></br>
            <span className='event-block-date'>July 28th - August 1st, 2025 *Registration will only open if week 1 fills up</span>
            <br></br>
            <span className='event-block-date'>August 4th - August 8th, 2025 *Registration will only open if week 2 fills up</span>
            <br></br>
          </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-12</li>
          <li>Beginners through Advanced Pole Vaulters</li>
          <li>2 weeks to choose from</li>
          <li>Monday thru Friday 8:45am – 3:15pm</li>
          <li>Dropoff window 8:45am-9:00am</li>
          <li>Pickup window 3:00-3:15pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more</li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>Tuesday &amp; Thursday includes an Ice Cream stop during lunch break</li>
        </ul>
        
        <span className='event-block-details-header'>Included with Registration</span>
        <ul className='event-block-details'>
          <li>All equipment for use during camp</li>
          <li>Ice Cream trips on Tuesday and Thursday</li>
          <li>DC Vault t-shirt (youth sizes only)</li>
          <li>Healthy Snacks</li>
        </ul>
        <span className='event-block-details-header'>Daily Schedule</span>
        <ul className='event-block-details'>
          <li>8:45-9:00am </li>
          <ul>
            <li>drop-off window + games</li>
          </ul>
          <li>9:00-9:30am </li>
          <ul>
            <li>warm-ups + strength</li>
          </ul>
          <li>9:30-10:30am  </li>
          <ul>
            <li>drills</li>
          </ul>
          <li>10:30am-11am  </li>
          <ul>
            <li>break + snacks + games</li>
          </ul>
          <li>11-12pm </li>
          <ul>
            <li>vault</li>
          </ul>
          <li>12-12:30pm  </li>
          <ul>
            <li>walk to Lincoln Park</li>
          </ul>
          <li>12:30-1pm  </li>
          <ul>
            <li>lunch @ Lincoln Park (+ Ice Cream @ E. Market on Tue & Thu)</li>
          </ul>
          <li>1:00-1:30pm</li>
          <ul>
            <li>drills @ Lincoln Park</li>
          </ul>
          <li>1:30-2:00pm</li>
          <ul>
            <li>walk to DCV</li>
          </ul>
          <li>2:00pm-3:00pm</li>
          <ul>
            <li>vault</li>
          </ul>
          <li>3:00-3:15pm </li>
          <ul>
            <li>Pickup window + games</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Daily Technical Focus</span>
        <ul className='event-block-details'>
          <li>M - run / takeoff</li>
          <ul>
            <li>learn to carry and run with the pole and how to take-off</li>
          </ul>
          <li>T - swing</li>
          <ul>
            <li>learn to begin to swing upside down on the pole with rings, ropes and hanging drills</li>
          </ul>
          <li>W - extension </li>
          <ul>
            <li>learn how to pull yourself up the pole towards the bar with ropes, platforms and partner drills</li>
          </ul>
          <li>R - turn</li>
          <ul>
            <li>learn to turn over the bar with rings, ropes, platforms and ground drills</li>
          </ul>
          <li>F - height / competition </li>
          <ul>
            <li>Putting all of the technical work together, campers will have a competition to go over heights!</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Games</span>
        <ul className='event-block-details'>
          <li>Water Balloon Fight</li>
          <li>Face Painting</li>
          <li>Sumo Ball Wrestling Match</li>
          <li>Nerf Games</li>
          <li>Relay Races</li>
          <li>and more!</li>
        </ul>
        <span className='event-block-details-header'>What to Bring</span>
        <ul className='event-block-details'>
          <li>Water Bottle</li>
          <li>Sunblock</li>
          <li>Bug Spray</li>
          <li>Bag Lunch (ice chest available at DCV)</li>
          <li>Running shoes</li>
          <li>Athletic active wear clothing</li>
        </ul>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>$450 per week</li>
          <li><a style={{color: '#C0282D'}} href='https://dcvault.com/compete'>Register HERE!</a></li>
        </ul>
        
        <center><span className='red-text'>Click Arrow to Collapse Info</span></center>
        </div>)
      },
      {
        date: new Date('May 9, 2025'),
        partial: (<div className='event-block' id='09MAY2025'>
          <p className='event-block-title'>CAPITOL HILL <span className='red-text'>FLY-KIDS</span> OPEN HOUSE</p>
          <img src = "../img/events/flykids-oh.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
          <p className='event-block-info'>
            <span className='event-block-date'>Friday, May 9th 6:30pm-7:45pm</span>
            <br></br>
            <span className='event-block-date'>DC Vault: 2200 East Capitol street NE, Washington DC</span>
          </p>
          <span className='event-block-details-header'>Generaal Info</span>
          <ul className='event-block-details'>
            <span className='event-block-date'>Open to any child ages 7-10 attending a Capitol Hill elementary or combined school. Hill kids will have the chance to try pole vaulting and experience high flying fun at DC Vault, the premier pole vault training center on the East Coast!</span>
            <br></br>
            <span className='event-block-date'>Friday, 6:30pm-7:45pm</span>
            <br></br>
            <span className='event-block-date'>No cost to register.</span>
            <br></br>
            <span className='event-block-date'>Limited space! </span>
            <br></br>
            <span className='event-block-date'>Must RSVP in advance (no exceptions): events@dcvault.org  </span>
            <br></br>
          </ul>
      
        </div>),
        full: (<div className='event-block' id='09MAY2025'>
          <p className='event-block-title'>CAPITOL HILL <span className='red-text'>FLY-KIDS</span> OPEN HOUSE</p>
          <img src = "../img/events/flykids-oh.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
          <p className='event-block-info'>
            <span className='event-block-date'>Friday, May 9th 6:30pm-7:45pm</span>
            <br></br>
            <span className='event-block-date'>DC Vault: 2200 East Capitol street NE, Washington DC</span>
          </p>
          <span className='event-block-details-header'>Generaal Info</span>
          <ul className='event-block-details'>
            <span className='event-block-date'>Open to any child ages 7-10 attending a Capitol Hill elementary or combined school. Hill kids will have the chance to try pole vaulting and experience high flying fun at DC Vault, the premier pole vault training center on the East Coast!</span>
            <br></br>
            <span className='event-block-date'>Friday, 6:30pm-7:45pm</span>
            <br></br>
            <span className='event-block-date'>No cost to register.</span>
            <br></br>
            <span className='event-block-date'>Limited space! </span>
            <br></br>
            <span className='event-block-date'>Must RSVP in advance (no exceptions): events@dcvault.org  </span>
            <br></br>
          </ul>
        </div>)
      },      
      {
        date: new Date('June 28, 2025'),
        partial: (          <div className='event-block' id='28JUN2025'>
          <p className='event-block-title'>2025 <span className='red-text'>Pole Vault</span> Championships</p>
          <img src = "../img/events/pvchamps25.jpg" alt="champs" width = '350' class = "center"></img>
          <p className='event-block-info'>
            <span className='event-block-date'>Washington DC</span><br></br>
            <span className='event-block-date'>Friday + Saturday, June 27th-28th 2025</span><br></br>
            <span className='event-block-date'>2200 East Capitol Street NE</span>
          </p>
          <p className='event-block-info'>Hosted by: DC Vault and the National Pole Vault Association</p>
      
          <p className='event-block-info'>
            <span className='event-block-date'>DIVISION INFORMATION</span><br></br>
            <br></br>
            <span className='event-block-date'>FRIDAY – Jun 27th</span><br></br>
            <span className='event-block-date'><span className='red-text'>STATE CHAMPIONS</span> DIVISION</span><br></br>
            <span className='event-block-date'><span className='red-text'>HIGH SCHOOL</span> STATE CHAMPIONS <span className='red-text'>ONLY!</span></span><br></br>
          </p>

          <ul className='event-block-details'>
            <li>Open only to athletes who placed 1st at a 2025 indoor or outdoor High School State Championship (all divisions - verification required).</li>
            <li>The State Champions Division is an opportunity for the best of the best to compete head-to-head!</li>
            <li><em>Athletes who compete in the State Champions Division on Friday, June 27th may also register to compete in High School Divisions or Emerging Elite Divisions on Saturday, June 28th. Register online separately for each division.</em></li>
          </ul>
          <span className='event-block-details-header'>Boy’s State Champions Division</span>
          <ul className='event-block-details'>
            <li>Any male athlete who placed 1st at an indoor or outdoor High School State Championship in 2025</li>
            <li>Must submit online source to verify results</li>
            <li>4.00m (13’1.5”) starting height</li>
            <li>15cm progressions</li>
          </ul>
          <span className='event-block-details-header'>Girl’s State Champions Division</span>
          <ul className='event-block-details'>
            <li>Any female athlete who placed 1st at an indoor or outdoor High School State Championship in 2025</li>
            <li>Must submit online source to verify results</li>
            <li>3.00m (9’11”) starting height</li>
            <li>15cm progressions</li>
          </ul>
          <span className='event-block-details-header'><em>NOTE:</em> Starting heights may be adjusted down or up based on entry marks of competitors. Final decision will be made after registration has closed.</span>

          <p className='event-block-info'>
            <br></br>
            <span className='event-block-date'>SATURDAY – Jun 28th</span><br></br>
            <span className='event-block-date'><span className='red-text'>OPEN</span> DIVISION INFORMATION</span><br></br>
            <span className='event-block-date'><span className='red-text'>ELEMENTARY</span> + <span className='red-text'>MIDDLE SCHOOL</span> + <span className='red-text'>HIGH SCHOOL</span> + <span className='red-text'>OPEN-ADULT</span> + <span className='red-text'>EMERGING ELITE</span></span><br></br>
          </p>
          <span className='event-block-details-header'>Elementary School Division</span>
          <ul className='event-block-details'>
            <li>Any athlete age 7-11 who attended 5th grade and under during Spring of 2025</li>
            <li>1.55m starting height (5’1”)</li>
            <li>Combined Division (boys and girls scored separately)</li>
          </ul>
          <span className='event-block-details-header'>Middle School Division</span>
          <ul className='event-block-details'>
            <li>Any athlete age 11-14 who attended grades 6-8 during Spring of 2025</li>
            <li>1.55m starting height (5’1”)</li>
            <li>Combined Division (boys and girls scored separately)</li>
          </ul>
          <span className='event-block-details-header'>High School Division</span>
          <ul className='event-block-details'>
            <li>Any athlete age 14-18 who attended grades 9-12 in Spring of 2025</li>
            <li>1.85m (6’1”) starting height for girls</li>
            <li>2.45m (8’) starting height for boys Division II (PR under 12’6”)</li>
            <li>3.35m (11’) starting height for boys Division I (PR 12’6”+)</li>
          </ul>
          <span className='event-block-details-header'>Open Adult Division (combined)</span>
          <ul className='event-block-details'>
            <li>Any athlete age 18 and up who graduated high school prior to 2025 with a PR less than 15’</li>
            <li>1.85m (6’1”) starting height for women</li>
            <li>2.45m (8’) starting height for men</li>
            <li>Combined Division (men and women scored separately)</li>
          </ul>
          <span className='event-block-details-header'>Men’s Emerging Elite Division</span>
          <ul className='event-block-details'>
            <li>Any athlete with a PR of 4.57m (15’1”) or higher (verifiable)</li>
            <li>4.30m (14’1”) starting height</li>
          </ul>
          <span className='event-block-details-header'><em>NOTE:</em> Male and female competitors in combined divisions are scored separately. 15cm progressions will be used for Open Divisions.</span>

          <p className='event-block-info'>
            <br></br>
            <span className='event-block-date'><span className='red-text'>ELITE INVITE</span> DIVISION INFORMATION</span><br></br>
          </p>
          <span className='event-block-details-header'>Entry Standards</span>
          <ul className='event-block-details'>
            <li>Elite Men
              <ul>
                <li><span className='red-text'>Event + Facility Record: 5.82m / 19’1.25” (Austin Miller - 2024)</span></li>
                <li>5.5m (A) standard - automatic qualifying</li>
                <li>5.2m (B) standard - waitlist</li>
                <li>accepted B-standard entries posted by June 13th</li>
                <li>alternates compete in the Men’s Emerging Elite Division</li>
                <li>5m starting height</li>
                <li>Progressions:
                  <ul>
                    <li>5.00+15 (16’5”)</li>
                    <li>5.15 (16’11”)</li>
                    <li>5.30 (17’5”)</li>
                    <li>5.45+10 (17’11”)</li>
                    <li>5.55 (18’3”)</li>
                    <li>5.65 (18’6”)</li>
                    <li>5.75+5 (18’10”)</li>
                    <li>5.80 (19’)</li>
                    <li>5.85 (19’2.75”) Event Record</li>
                    <li>5.90 (19’4”)</li>
                    <li>5.95 (19’6”)</li>
                    <li>6.00 (19’8”)</li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>Elite Women
              <ul>
                <li><span className='red-text'>Event + Facility Record: 4.73m / 15’6.25” (Bridget Williams - 2024)</span></li>
                <li>4.3m (A) standard - automatic qualifying</li>
                <li>4.0m (B) standard - waitlist</li>
                <li>accepted B-standard entries posted by June 13th</li>
                <li>alternates compete in the Men + Women Open Division or Girls High School division</li>
                <li>4m starting height</li>
                <li>Progressions:
                  <ul>
                    <li>4.00+15 (13’1”)</li>
                    <li>4.15 (13’7”)</li>
                    <li>4.30+10 (14’1”)</li>
                    <li>4.40 (14’5”)</li>
                    <li>4.50 (14’9”)</li>
                    <li>4.60+5 (15’)</li>
                    <li>4.65 (15’3”)</li>
                    <li>4.70 (15’5”)</li>
                    <li>4.75 (15’7”) Event Record</li>
                    <li>4.80 (15’9”)</li>
                    <li>4.85 (15’11”)</li>
                    <li>4.90 (16’1”)</li>
                    <li>4.95 (16’3”)</li>
                    <li>5.00 (16’5”)</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <span className='event-block-details-header'>Elite Entries: Contact <span className='red-text'>Events@DCVault.org</span></span>
          <p className='event-block-info'>
            <br></br>
            <span className='event-block-date'><span className='red-text'>FLY KIDS</span> TRIAL CLASS INFORMATION</span><br></br>
          </p>
          <span className='event-block-details-header'>Class Schedule and Registration</span>
          <ul className='event-block-details'>
            <li>Four 15-minute Fly-Kids Trial Classes will be offered free of charge during the event at the following times
              <ul>
                <li>2:30pm</li>
                <li>2:45pm</li>
                <li>3:00pm</li>
                <li>3:15pm</li>
              </ul>
            </li>
            <li>6 participants per class</li>
            <li>Ages 6-10 ONLY (strictly enforced)</li>
            <li>Registration is first come first serve at the front gate</li>
            <li>A parent must be present to sign the participant up for a time slot</li>
            <li>After paying admission to the facility, coordinate with the front gate staff to choose a time slot (children under age 11 enter free)</li>
            <li>Time slots are available to reserve in listed order only. Once each class fills up, the next time slot will become available for reserving.</li>
          </ul>
          </div>),
        full: (
          <div className='event-block' id='28JUN2025'>
            <p className='event-block-title'>2025 <span className='red-text'>Pole Vault</span> Championships</p>
            <img src = "../img/events/pvchamps25.jpg" alt="champs" width = '350' class = "center"></img>
            <p className='event-block-info'>
              <span className='event-block-date'>Washington DC</span><br></br>
              <span className='event-block-date'>Friday + Saturday, June 27th-28th 2025</span><br></br>
              <span className='event-block-date'>2200 East Capitol Street NE</span>
            </p>
            <p className='event-block-info'>Hosted by: DC Vault and the National Pole Vault Association</p>
        
            <p className='event-block-info'>
              <span className='event-block-date'>DIVISION INFORMATION</span><br></br>
              <br></br>
              <span className='event-block-date'>FRIDAY – Jun 27th</span><br></br>
              <span className='event-block-date'><span className='red-text'>STATE CHAMPIONS</span> DIVISION</span><br></br>
              <span className='event-block-date'><span className='red-text'>HIGH SCHOOL</span> STATE CHAMPIONS <span className='red-text'>ONLY!</span></span><br></br>
            </p>

            <ul className='event-block-details'>
              <li>Open only to athletes who placed 1st at a 2025 indoor or outdoor High School State Championship (all divisions - verification required).</li>
              <li>The State Champions Division is an opportunity for the best of the best to compete head-to-head!</li>
              <li><em>Athletes who compete in the State Champions Division on Friday, June 27th may also register to compete in High School Divisions or Emerging Elite Divisions on Saturday, June 28th. Register online separately for each division.</em></li>
            </ul>
            <span className='event-block-details-header'>Boy’s State Champions Division</span>
            <ul className='event-block-details'>
              <li>Any male athlete who placed 1st at an indoor or outdoor High School State Championship in 2025</li>
              <li>Must submit online source to verify results</li>
              <li>4.00m (13’1.5”) starting height</li>
              <li>15cm progressions</li>
            </ul>
            <span className='event-block-details-header'>Girl’s State Champions Division</span>
            <ul className='event-block-details'>
              <li>Any female athlete who placed 1st at an indoor or outdoor High School State Championship in 2025</li>
              <li>Must submit online source to verify results</li>
              <li>3.00m (9’11”) starting height</li>
              <li>15cm progressions</li>
            </ul>
            <span className='event-block-details-header'><em>NOTE:</em> Starting heights may be adjusted down or up based on entry marks of competitors. Final decision will be made after registration has closed.</span>

            <p className='event-block-info'>
              <br></br>
              <span className='event-block-date'>SATURDAY – Jun 28th</span><br></br>
              <span className='event-block-date'><span className='red-text'>OPEN</span> DIVISION INFORMATION</span><br></br>
              <span className='event-block-date'><span className='red-text'>ELEMENTARY</span> + <span className='red-text'>MIDDLE SCHOOL</span> + <span className='red-text'>HIGH SCHOOL</span> + <span className='red-text'>OPEN-ADULT</span> + <span className='red-text'>EMERGING ELITE</span></span><br></br>
            </p>
            <span className='event-block-details-header'>Elementary School Division</span>
            <ul className='event-block-details'>
              <li>Any athlete age 7-11 who attended 5th grade and under during Spring of 2025</li>
              <li>1.55m starting height (5’1”)</li>
              <li>Combined Division (boys and girls scored separately)</li>
            </ul>
            <span className='event-block-details-header'>Middle School Division</span>
            <ul className='event-block-details'>
              <li>Any athlete age 11-14 who attended grades 6-8 during Spring of 2025</li>
              <li>1.55m starting height (5’1”)</li>
              <li>Combined Division (boys and girls scored separately)</li>
            </ul>
            <span className='event-block-details-header'>High School Division</span>
            <ul className='event-block-details'>
              <li>Any athlete age 14-18 who attended grades 9-12 in Spring of 2025</li>
              <li>1.85m (6’1”) starting height for girls</li>
              <li>2.45m (8’) starting height for boys Division II (PR under 12’6”)</li>
              <li>3.35m (11’) starting height for boys Division I (PR 12’6”+)</li>
            </ul>
            <span className='event-block-details-header'>Open Adult Division (combined)</span>
            <ul className='event-block-details'>
              <li>Any athlete age 18 and up who graduated high school prior to 2025 with a PR less than 15’</li>
              <li>1.85m (6’1”) starting height for women</li>
              <li>2.45m (8’) starting height for men</li>
              <li>Combined Division (men and women scored separately)</li>
            </ul>
            <span className='event-block-details-header'>Men’s Emerging Elite Division</span>
            <ul className='event-block-details'>
              <li>Any athlete with a PR of 4.57m (15’1”) or higher (verifiable)</li>
              <li>4.30m (14’1”) starting height</li>
            </ul>
            <span className='event-block-details-header'><em>NOTE:</em> Male and female competitors in combined divisions are scored separately. 15cm progressions will be used for Open Divisions.</span>

            <p className='event-block-info'>
              <br></br>
              <span className='event-block-date'><span className='red-text'>ELITE INVITE</span> DIVISION INFORMATION</span><br></br>
            </p>
            <span className='event-block-details-header'>Entry Standards</span>
            <ul className='event-block-details'>
              <li>Elite Men
                <ul>
                  <li><span className='red-text'>Event + Facility Record: 5.82m / 19’1.25” (Austin Miller - 2024)</span></li>
                  <li>5.5m (A) standard - automatic qualifying</li>
                  <li>5.2m (B) standard - waitlist</li>
                  <li>accepted B-standard entries posted by June 13th</li>
                  <li>alternates compete in the Men’s Emerging Elite Division</li>
                  <li>5m starting height</li>
                  <li>Progressions:
                    <ul>
                      <li>5.00+15 (16’5”)</li>
                      <li>5.15 (16’11”)</li>
                      <li>5.30 (17’5”)</li>
                      <li>5.45+10 (17’11”)</li>
                      <li>5.55 (18’3”)</li>
                      <li>5.65 (18’6”)</li>
                      <li>5.75+5 (18’10”)</li>
                      <li>5.80 (19’)</li>
                      <li>5.85 (19’2.75”) Event Record</li>
                      <li>5.90 (19’4”)</li>
                      <li>5.95 (19’6”)</li>
                      <li>6.00 (19’8”)</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>Elite Women
                <ul>
                  <li><span className='red-text'>Event + Facility Record: 4.73m / 15’6.25” (Bridget Williams - 2024)</span></li>
                  <li>4.3m (A) standard - automatic qualifying</li>
                  <li>4.0m (B) standard - waitlist</li>
                  <li>accepted B-standard entries posted by June 13th</li>
                  <li>alternates compete in the Men + Women Open Division or Girls High School division</li>
                  <li>4m starting height</li>
                  <li>Progressions:
                    <ul>
                      <li>4.00+15 (13’1”)</li>
                      <li>4.15 (13’7”)</li>
                      <li>4.30+10 (14’1”)</li>
                      <li>4.40 (14’5”)</li>
                      <li>4.50 (14’9”)</li>
                      <li>4.60+5 (15’)</li>
                      <li>4.65 (15’3”)</li>
                      <li>4.70 (15’5”)</li>
                      <li>4.75 (15’7”) Event Record</li>
                      <li>4.80 (15’9”)</li>
                      <li>4.85 (15’11”)</li>
                      <li>4.90 (16’1”)</li>
                      <li>4.95 (16’3”)</li>
                      <li>5.00 (16’5”)</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
            <span className='event-block-details-header'>Elite Entries: Contact <span className='red-text'>Events@DCVault.org</span></span>
            <p className='event-block-info'>
              <br></br>
              <span className='event-block-date'><span className='red-text'>FLY KIDS</span> TRIAL CLASS INFORMATION</span><br></br>
            </p>
            <span className='event-block-details-header'>Class Schedule and Registration</span>
            <ul className='event-block-details'>
              <li>Four 15-minute Fly-Kids Trial Classes will be offered free of charge during the event at the following times
                <ul>
                  <li>2:30pm</li>
                  <li>2:45pm</li>
                  <li>3:00pm</li>
                  <li>3:15pm</li>
                </ul>
              </li>
              <li>6 participants per class</li>
              <li>Ages 6-10 ONLY (strictly enforced)</li>
              <li>Registration is first come first serve at the front gate</li>
              <li>A parent must be present to sign the participant up for a time slot</li>
              <li>After paying admission to the facility, coordinate with the front gate staff to choose a time slot (children under age 11 enter free)</li>
              <li>Time slots are available to reserve in listed order only. Once each class fills up, the next time slot will become available for reserving.</li>
            </ul>
        
            <p className='event-block-info'>GENERAL EVENT INFORMATION</p>
            <span className='event-block-details-header'>Spikes</span>
            <ul className='event-block-details'>
              <li><span className='red-text'>1/8" SPIKES ONLY</span> at this facility (not standard 1/4" spikes!)</li>
              <ul>
                <li><strong>ELITE DIVISION</strong> athletes may wear 1/4" spikes</li>
              </ul>
              <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition</li>
              <li><span className='red-text'>1/8” spikes</span> can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
              <ul>
                <li><em>Strongly Recommended</em> so you don't waste time at the event trying to change spikes!</li>
              </ul>
              <li>Available for $5 per set at the event (bring your own spike wrench)</li>
            </ul>
            <span className='event-block-details-header'>Schedule</span>
            <ul className='event-block-details'>
              <li><strong>Fri, June 27th</strong></li>
              <ul>
                <li>12:00pm Staff Arrive</li>
                <li>12:45pm Gates Open</li>
                <li>1:00pm Girl’s State Champions Division – warmups (black pit)</li>
                <li>2:00pm Girl’s State Champions Division – competition (black pit)</li>
                <li>3:00pm (or 1-hr after completion of girl’s division) Boy’s State Champions Division – warmups (black pit)</li>
                <li>4:00pm Boy’s State Champions Division – competition (black pit)</li>
              </ul>
              <li><strong>Sat, June 28th</strong> <em>(Note: <span className='red-text'>Rolling Schedule</span> – arrive early in case your time slot moves up!)</em></li>
              <ul>
                <li>07:30am Staff Arrive</li>
                <li>08:30am Gates Open</li>
                <li>08:30am Men’s Emerging Elite – warmups (black pit)</li>
                <li>08:30am Open Adult Division – warmups (red pit)</li>
                <li>09:30am Men’s Emerging Elite – competition (black pit)</li>
                <li>09:30am Open Adult Division – competition (red pit)</li>
                <li>11:00am Girls High School Division – warmups (red pit)</li>
                <li>12:00pm Girls High School Division – competition (red pit)</li>
                <li>12:00pm ELITE Division Women – warmups (black pit)</li>
                <li>1:00pm ELITE Division Women – competition (black pit)</li>
                <li>2:00pm Middle School Boys + Girls – warmups (red pit)</li>
                <li>2:30pm Middle School Boys + Girls – competition (red pit)</li>
                <li>2:30pm ELITE Division Men – warmups (black pit)</li>
                <li>2:30pm Fly-Kids Trial Class 1 – (Fly-Kids pit)</li>
                <li>2:45pm Fly-Kids Trial Class 2 – (Fly-Kids pit)</li>
                <li>3:00pm Elementary School Boys + Girls – warmups (red pit)</li>
                <li>3:00pm Fly-Kids Trial Class 3 – (Fly-Kids pit)</li>
                <li>3:15pm Fly-Kids Trial Class 4 – (Fly-Kids pit)</li>
                <li>3:30pm ELITE Division Men – competition (black pit)</li>
                <li>3:30pm Elementary School Boys + Girls – competition (red pit)</li>
                <li>5:00pm High School Boys Division I – warmups (black pit)</li>
                <li>5:00pm High School Boys Division II – warmups (red pit)</li>
                <li>6:00pm High School Boys Division I – competition (black pit)</li>
                <li>6:00pm High School Boys Division II – competition (red pit)</li>
              </ul>
            </ul>
            <span className='event-block-details-header'>Registration</span>
            <ul className='event-block-details'>
              <li>The 2025 Pole Vault Championships are open to all athletes ages 7 and up</li>
              <li>Advanced Registration Only</li>
              <li>Registration Closes @ Midnight on Jun 20th</li>
              <li>$50 for competitors – <a style={{color: '#C0282D'}} href='https://dcvault.com/pvchamps'>Register HERE!</a></li>
            </ul>
            <span className='event-block-details-header'>Start List/Results</span>
            <ul className='event-block-details'>
              <li>Download Start List <a style={{color: '#C0282D'}} href='#' target='_blank'>HERE!</a> (Available June 23rd)</li>
              <li>Download Final Results <a style={{color: '#C0282D'}} href='#' target='_blank'>HERE!</a> (Available July 2nd)</li>
            </ul>
            <span className='event-block-details-header'>Awards/Sanctioning</span>
            <ul className='event-block-details'>
              <li>Medals will be awarded in all divisions, 1st through 3rd place</li>
              <li>Jiffy Car Rack Pole Carrier for 1st place finishers!</li>
              <li>Special Limited-Edition Medals Awarded for facility records and State Champions Division (boys + girls)</li>
              <li>USATF + World Athletics Sanctioned</li>
              <li>Elite Division Results will be published to WorldAthletics.org</li>
              <li>Open Division Results will be published to Milesplit.com and DCVault.com/events</li>
            </ul>
            <span className='event-block-details-header'>Venue/Spectators/Coaches</span>
            <ul className='event-block-details'>
              <li>DC Vault Pole Vault Center – 2200 East Capitol Street NE, Washington DC</li>
              <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
              <li>Parking On-Site (Lot #3), download SITE MAP <a style={{color: '#C0282D'}} href='../files/DCV Site Map.pdf'>HERE</a> to view parking and team tent areas</li>
              <li>Athletes, Spectators and Coaches enter the facility from the E. Capitol Street sidewalk gate. Park in Lot #3, exit the lot onto the sidewalk and head to the double gate facing the street next to the DC VAULT storage shed</li>
              <li>$10 Admission for all non-competitors entering the facility (CASH ONLY)</li>
              <li>Children Under age 11 enter FREE</li>
              <li>Spectators and coaches may also watch from outside the fenced area free-of-charge</li>
              <li><span className='red-text'>TENTS and CANOPIES are NOT allowed inside the venue</span>. Spectators wishing to use personal shade canopies or pop-up tent canopies may do so OUTSIDE of the fenced area and enter/exit the venue as needed after paying admission. Download SITE MAP <a style={{color: '#C0282D'}} href='../files/DCV Site Map.pdf'>HERE</a> to view parking and team tent areas.</li>
              <li>Coaches who have paid admission may enter the facility and assist athletes in the designated coach’s box</li>
              <li><strong><span className='red-text'>PLEASE</span></strong> be professional and immediately move to the back of the coaching box after your athlete jumps before talking to your athlete so that the next competitor’s coach has a clear view of the runway and pit!</li>
            </ul>
            <span className='event-block-details-header'>Pole Storage</span>
            <ul className='event-block-details'>
              <li>Overnight pole storage can be arranged. For drop-off and pick-up, email <span className='red-text'>Events@dcvault.org</span> by June 20th</li>
            </ul>
            <span className='event-block-details-header'>Pole Rentals</span>
            <ul className='event-block-details'>
              <li>UCS Spirit Poles Available for Rent (inquire)</li>
              <li>$30 cash at check-in</li>
              <li>You may be sharing your rental pole</li>
              <li>ID will be held until the pole is returned</li>
            </ul>
            <span className='event-block-details-header'>Event Features / Food</span>
            <ul className='event-block-details'>
              <li>Free Grilled hotdogs and veggie dogs for competitors and spectators while they last!</li>
              <li>Bring something special for yourself if you’d like to grill it up!</li>
            </ul>
            <span className='event-block-details-header'>Pets</span>
            <ul className='event-block-details'>
              <li>Dog friendly venue!</li>
              <li>Bring a leash and water for your critter</li>
            </ul>
            <span className='event-block-details-header'>General Info</span>
            <ul className='event-block-details'>
              <li>For additional information, email <span className='red-text'>Events@dcvault.org</span></li>
            </ul>
          </div>
        )
      },
      { //2024 Events
        date: new Date('August 09, 2024'),
        partial: (<div className='event-block' id='09AUG2024'>
        <p className='event-block-title'>2024 FLY-KIDS <span className='red-text'>SUMMER</span> CAMP</p>
        <img src = "../img/events/fly-kids24.png" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>2 WEEKS of Pole Vaulting and Games!</span>
          <br></br>
          <span className='event-block-date'>July 29th through August 9th</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol Street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates</span>
        <ul className='event-block-details'>
          <li>Jul 29th - Aug 2nd</li>
          <li>Aug 5th - Aug 9th</li>
        </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-11</li>
          <li>Beginners through Advanced Pole Vaulters</li>
          <li>2 weeks to choose from</li>
          <li>Monday thru Friday 8:45am – 3:15pm</li>
          <li>Dropoff window 8:45am-9:00am</li>
          <li>Pickup window 3:00-3:15pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more</li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>Tuesday &amp; Thursday includes an Ice Cream stop during lunch break</li>
        </ul>
        
        <span className='event-block-details-header'>Included with Registration</span>
        <ul className='event-block-details'>
          <li>All equipment for use during camp</li>
          <li>Ice Cream trips on Tuesday and Thursday</li>
          <li>DC Vault t-shirt (youth sizes only)</li>
          <li>Healthy Snacks</li>
        </ul>
        
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='09AUG2024'>
        <p className='event-block-title'>2024 FLY-KIDS <span className='red-text'>SUMMER</span> CAMP</p>
        <img src = "../img/events/fly-kids24.png" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>2 WEEKS of Pole Vaulting and Games!</span>
          <br></br>
          <span className='event-block-date'>July 29th through August 9th</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol Street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates</span>
        <ul className='event-block-details'>
          <li>Jul 29th - Aug 2nd</li>
          <li>Aug 5th - Aug 9th</li>
        </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-11</li>
          <li>Beginners through Advanced Pole Vaulters</li>
          <li>2 weeks to choose from</li>
          <li>Monday thru Friday 8:45am – 3:15pm</li>
          <li>Dropoff window 8:45am-9:00am</li>
          <li>Pickup window 3:00-3:15pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more</li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>Tuesday &amp; Thursday includes an Ice Cream stop during lunch break</li>
        </ul>
        
        <span className='event-block-details-header'>Included with Registration</span>
        <ul className='event-block-details'>
          <li>All equipment for use during camp</li>
          <li>Ice Cream trips on Tuesday and Thursday</li>
          <li>DC Vault t-shirt (youth sizes only)</li>
          <li>Healthy Snacks</li>
        </ul>
        <span className='event-block-details-header'>Daily Schedule</span>
        <ul className='event-block-details'>
          <li>8:45-9:00am </li>
          <ul>
            <li>drop-off window + games</li>
          </ul>
          <li>9:00-9:30am </li>
          <ul>
            <li>warm-ups + strength</li>
          </ul>
          <li>9:30-10:30am  </li>
          <ul>
            <li>drills</li>
          </ul>
          <li>10:30am-11am  </li>
          <ul>
            <li>break + snacks + games</li>
          </ul>
          <li>11-12pm </li>
          <ul>
            <li>vault</li>
          </ul>
          <li>12-12:30pm  </li>
          <ul>
            <li>walk to Lincoln Park</li>
          </ul>
          <li>12:30-1pm  </li>
          <ul>
            <li>lunch @ Lincoln Park (+ Ice Cream @ E. Market on Tue & Thu)</li>
          </ul>
          <li>1:00-1:30pm</li>
          <ul>
            <li>drills @ Lincoln Park</li>
          </ul>
          <li>1:30-2:00pm</li>
          <ul>
            <li>walk to DCV</li>
          </ul>
          <li>2:00pm-3:00pm</li>
          <ul>
            <li>vault</li>
          </ul>
          <li>3:00-3:15pm </li>
          <ul>
            <li>Pickup window + games</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Daily Technical Focus</span>
        <ul className='event-block-details'>
          <li>M - run / takeoff</li>
          <ul>
            <li>learn to carry and run with the pole and how to take-off</li>
          </ul>
          <li>T - swing</li>
          <ul>
            <li>learn to begin to swing upside down on the pole with rings, ropes and hanging drills</li>
          </ul>
          <li>W - extension </li>
          <ul>
            <li>learn how to pull yourself up the pole towards the bar with ropes, platforms and partner drills</li>
          </ul>
          <li>R - turn</li>
          <ul>
            <li>learn to turn over the bar with rings, ropes, platforms and ground drills</li>
          </ul>
          <li>F - height / competition </li>
          <ul>
            <li>Putting all of the technical work together, campers will have a competition to go over heights!</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Games</span>
        <ul className='event-block-details'>
          <li>Water Balloon Fight</li>
          <li>Face Painting</li>
          <li>Sumo Ball Wrestling Match</li>
          <li>Nerf Games</li>
          <li>Relay Races</li>
          <li>and more!</li>
        </ul>
        <span className='event-block-details-header'>What to Bring</span>
        <ul className='event-block-details'>
          <li>Water Bottle</li>
          <li>Sunblock</li>
          <li>Bug Spray</li>
          <li>Bag Lunch (ice chest available at DCV)</li>
          <li>Running shoes</li>
          <li>Athletic active wear clothing</li>
        </ul>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>$400 - 1 week</li>
          <li>$750 - 2 weeks</li>
          <li>10% Discount when registering at the 2024 Pole Vault Championships on June 8th. Ask for the event discount code!</li>
          <li><a href = "http://dcvault.com/compete/">Register Here</a>  </li>
        </ul>
        
        <center><span className='red-text'>Click Arrow to Collapse Info</span></center>
        </div>)
      },
      {
        date: new Date('June 8, 2024'),
        partial: (<div className='event-block' id='8JUN2024'>
        <p className='event-block-title'>2024 <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/events/2024 PV Champs.jpg" alt="PV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
            <span className='event-block-date'>Saturday, June 8th 2024</span><br></br>
            <span className='event-block-date'>2200 East Capitol Street NE, Washington DC</span>
        </p>
        <p className='event-block-title'><span className='red-text'>ELITE INVITE </span>DIVISION INFORMATION</p>
        <span className='event-block-details-header'>Entry Standards</span>
        <ul className='event-block-details'>
            <li>Elite Men</li>
            <ul>
                <li><span className='red-text'>Event + Facility Record: 5.72m / 18’9” (Zachary Bradford - 2023)</span></li>
                <li>5.5m (A) standard - automatic qualifying</li>
                <li>5.2m (B) standard - waitlist</li>
                <ul>
                    <li>accepted B-standard entries posted by June 1st</li>
                    <li>alternates compete in the Men’s Emerging Elite Division</li>
                </ul>
                <li>4.85m starting height</li>
                <li>Progressions:</li>
                <ul>
                    <li>4.85+15 (15’11”)</li>
                    <li>5.10 (16’9”)</li>
                    <li>5.25 (17’3”)</li>
                    <li>5.40+8 (17’8”) Olympic Trials B-Standard</li>
                    <li>5.48 (18’)</li>
                    <li>5.56 (18’3”)</li>
                    <li>5.64 (18’6”)</li>
                    <li>5.72 (18’9”) Olympic Trials A-Standard</li>
                    <li>5.80+4 (19’) Facility Record <span className='red-text'>= $1,000 for 1st place finisher + $250 for 2nd place finisher</span></li>
                    <li>5.84 (19’2”)</li>
                    <li>5.88 (19’3.5”)</li>
                    <li>5.92+2 (19’5”)</li>
                    <li>5.94 (19’6”) <span className='red-text'>+$500 bonus for 1st place finisher + $250 bonus for 2nd place finisher</span></li>
                    <li>5.96 (19’6.5”)</li>
                    <li>5.98 (19’7”)</li>
                    <li>6.00 (19’8”) <span className='red-text'>+$1,000 bonus for 1st place finisher + $500 bonus for 2nd place finisher</span></li>
                </ul>

            </ul>
            <li>Elite Women</li>
            <ul>
                <li><span className='red-text'>Event + Facility Record: 4.65m / 15’3” (Anicka Newell - 2021)</span></li>
                <li>4.3m (A) standard - automatic qualifying</li>
                <li>4.0m (B) standard - waitlist</li>
                <ul>
                    <li>accepted B-standard entries posted by June 1st</li>
                    <li>alternates compete in the Men + Women Open Division or Girls High School division</li>
                </ul>
                <li>3.75m starting height</li>
                <li>Progressions:</li>
                <ul>
                    <li>3.75+15 (12’4”)</li>
                    <li>3.90 (12’9”)</li>
                    <li>4.05 (13’3”)</li>
                    <li>4.20+10 (13’9”)</li>
                    <li>4.30 (14’1”) Olympic Trials B-Standard</li>
                    <li>4.40 (14’5”)</li>
                    <li>4.50 (14’9”)</li>
                    <li>4.60+5 (15’) Olympic Trials A-Standard</li>
                    <li>4.65 (15’3”) Current Facility Record</li>
                    <li>4.70 (15’5”) Facility Record <span className='red-text'>= $1,000 for 1st place finisher + $250 for 2nd place finisher</span></li>
                    <li>4.75 (15’7”)</li>
                    <li>4.80 (15’9”)</li>
                    <li>4.85 (15’11”)</li>
                    <li>4.90 (16’1”) <span className='red-text'>+$500 bonus for 1st place finisher + $250 bonus for 2nd place finisher</span></li>
                    <li>4.95 (16’3”)</li>
                    <li>5.00 (16’5”) <span className='red-text'>+$1,000 bonus for 1st place finisher + $500 bonus for 2nd place finisher</span></li>
                </ul>

            </ul>
            <li>Elite Entries: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Elite Division Awards!</span></span>
        <ul className='event-block-details'>
            <li>$7,000 in total prize money!</li>
            <li>Elite Men: 
                <ul>
                    <li>First place finisher with a new facility record is awarded up to $2,500!</li>
                    <li>Second place finisher with a new facility record is awarded up to $1,000!</li>
                </ul>
            </li>
            <li>Elite Women: 
                <ul>
                    <li>First place finisher with a new facility record is awarded $2,500!</li>
                    <li>Second place finisher with a new facility record is awarded up to $1,000!</li>
                </ul>
            </li>
        </ul>
        <span className='event-block-details-header'><br></br><span className='red-text'>ELITE Entries</span> (as of 04/15/2024)</span>
        <span className='event-block-details-header'><br></br>ELITE MEN</span>
        <ul className='event-block-details'>
            <li>Austin Miller - 5.90m (19' 4.25")</li>
            <ul>
                <li>2023 Pole Vault Championships Silver Medalist (2022 Gold Medalist)</li>
                <li>Vault House / Team Essex</li>
                <li>Olympic Trials Finalist / USA Bronze Medalist / Millrose Games Bronze Medalist</li>
                <li><a href="https://instagram.com/a_milli29">instagram.com/a_milli29</a></li>
                <li>DMV Native!</li>
            </ul>
            <li>Matt Ludwig – 5.90m (19’ 4.25”)
                <ul>
                    <li>2023 Pan American Games Champion / 2021 Olympian / 2020 USA National Champion</li>
                    <li><a href="https://instagram.com/mattludwig_23">instagram.com/mattludwig_23</a></li>
                    <li>Ohio</li>
                </ul>
            </li>
            <li>Scott Houston – PR 5.83m (19’ 1.5”) / 2024: 5.65 (18’6.5”)
                <ul>
                    <li>Vaulthouse</li>
                    <li>2018 USA National Champion / 2018 NACAC Champion</li>
                    <li><a href="https://instagram.com/scottyhous">instagram.com/scottyhous</a></li>
                    <li>North Carolina</li>
                </ul>
            </li>
            <li>Zach Ferrara - 5.49m (18’ 0”)</li>
            <ul>
                <li>Vault Vision LLC</li>
                <li>2013 NCAA D3 National Champion / 3x All-American</li>
                <li><a href="https://instagram.com/fly1n4marshmallow">instagram.com/fly1n4marshmallow</a></li>
                <li>New York</li>
            </ul>
        </ul>
        <span className='event-block-details-header'><br></br>ELITE MEN -<span className='red-text'> B standard wait list</span></span>
        <ul className='event-block-details'>
          <li>Matthew Keim 5.34m (17' 6.25")</li>
          <ul>
            <li>Industrial Vault Club</li>
            <li>2x NCAA All American</li>
            <li><a href="https://instagram.com/matt_keim_pv">instagram.com/matt_keim_pv</a></li>
            <li>Ohio</li>
          </ul>
          <li>Christian DiNicolantonio 5.20m (17' 0.75")</li>
          <ul>
            <li>DC Vault</li>
            <li>NCAA All American / Catholic University Record Holder</li>
            <li><a href="https://instagram.com/c.dinic">instagram.com/c.dinic</a></li>
            <li>Washington, DC</li>
          </ul>
        </ul>

        <span className='event-block-details-header'><br></br>ELITE WOMEN</span>
        <ul className='event-block-details'>
        <li>Bridget Williams 4.83m (15’10.25”)
            <ul>
                <li>TeamESSX</li>
                <li>Team USA World Championships Finalist / Pan Am Games Gold Medalist</li>
                <li><a href="https://instagram.com/bridgieeee">instagram.com/bridgieeee</a></li>
                <li>Virginia</li>
            </ul>
        </li>
        <li>Anicka Newell 4.70m (15’5”)
            <ul>
                <li>Team Canada</li>
                <li>2x Olympian / 3x World Championships Qualifier / 1x National Champion</li>
                <li><a href="https://instagram.com/flygirl93">instagram.com/flygirl93</a></li>
                <li>Texas</li>
            </ul>
        </li>
        <li>Rachel Baxter 4.62m (15’1.75”)
            <ul>
                <li>TeamESSX</li>
                <li>Olympic Trials Finalist / USA Championships Top 10 / NCAA National Champion</li>
                <li><a href="https://instagram.com/_rachel_baxter_">instagram.com/_rachel_baxter_</a></li>
                <li>Virginia</li>
            </ul>
        </li>
        <li>Sydney Horn 4.51m (14’ 9.5”)
            <ul>
                <li>High Point University</li>
                <li>7x NCAA All-American / Team USA / NACAC U23 record holder</li>
                <li><a href="https://instagram.com/sydney_horn_">instagram.com/sydney_horn_</a></li>
                <li>Pennsylvania</li>
            </ul>
        </li>
        <li>Kaitlyn Dermen 4.27m (14’ 0”)
            <ul>
                <li>Philly Jumps Club</li>
                <li>NCAA DIII All American, 4x NJAC Conference champion</li>
                <li><a href="https://instagram.com/kaitlynders_">instagram.com/kaitlynders_</a></li>
                <li>New Jersey</li>
            </ul>
        </li>

        </ul>
        <span className='event-block-details-header'><br></br>ELITE WOMEN -<span className='red-text'> B standard wait list</span></span>
        <ul className='event-block-details'>
        <li>Madeline OConnell – 4.10m (13’5.5")
            <ul>
                <li>Industrial Vault Club</li>
                <li>NCAA D-III National Champion / 8x All American</li>
                <li><a href="https://instagram.com/madeline.track.adventures">instagram.com/madeline.track.adventures</a></li>
                <li>Ohio</li>
            </ul>
        </li>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
    </div>
    ),
        full: (<div className='event-block' id='8JUN2024'>
        <p className='event-block-title'>2024 <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/events/2024 PV Champs.jpg" alt="PV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
            <span className='event-block-date'>Saturday, June 8th 2024</span><br></br>
            <span className='event-block-date'>2200 East Capitol Street NE, Washington DC</span>
        </p>
        <p className='event-block-title'><span className='red-text'>ELITE INVITE </span>DIVISION INFORMATION</p>
        <span className='event-block-details-header'>Entry Standards</span>
        <ul className='event-block-details'>
            <li>Elite Men</li>
            <ul>
                <li><span className='red-text'>Event + Facility Record: 5.72m / 18’9” (Zachary Bradford - 2023)</span></li>
                <li>5.5m (A) standard - automatic qualifying</li>
                <li>5.2m (B) standard - waitlist</li>
                <ul>
                    <li>accepted B-standard entries posted by June 1st</li>
                    <li>alternates compete in the Men’s Emerging Elite Division</li>
                </ul>
                <li>4.85m starting height</li>
                <li>Progressions:</li>
                <ul>
                    <li>4.85+15 (15’11”)</li>
                    <li>5.10 (16’9”)</li>
                    <li>5.25 (17’3”)</li>
                    <li>5.40+8 (17’8”) Olympic Trials B-Standard</li>
                    <li>5.48 (18’)</li>
                    <li>5.56 (18’3”)</li>
                    <li>5.64 (18’6”)</li>
                    <li>5.72 (18’9”) Olympic Trials A-Standard</li>
                    <li>5.80+4 (19’) Facility Record <span className='red-text'>= $1,000 for 1st place finisher + $250 for 2nd place finisher</span></li>
                    <li>5.84 (19’2”)</li>
                    <li>5.88 (19’3.5”)</li>
                    <li>5.92+2 (19’5”)</li>
                    <li>5.94 (19’6”) <span className='red-text'>+$500 bonus for 1st place finisher + $250 bonus for 2nd place finisher</span></li>
                    <li>5.96 (19’6.5”)</li>
                    <li>5.98 (19’7”)</li>
                    <li>6.00 (19’8”) <span className='red-text'>+$1,000 bonus for 1st place finisher + $500 bonus for 2nd place finisher</span></li>
                </ul>

            </ul>
            <li>Elite Women</li>
            <ul>
                <li><span className='red-text'>Event + Facility Record: 4.65m / 15’3” (Anicka Newell - 2021)</span></li>
                <li>4.3m (A) standard - automatic qualifying</li>
                <li>4.0m (B) standard - waitlist</li>
                <ul>
                    <li>accepted B-standard entries posted by June 1st</li>
                    <li>alternates compete in the Men + Women Open Division or Girls High School division</li>
                </ul>
                <li>3.75m starting height</li>
                <li>Progressions:</li>
                <ul>
                    <li>3.75+15 (12’4”)</li>
                    <li>3.90 (12’9”)</li>
                    <li>4.05 (13’3”)</li>
                    <li>4.20+10 (13’9”)</li>
                    <li>4.30 (14’1”) Olympic Trials B-Standard</li>
                    <li>4.40 (14’5”)</li>
                    <li>4.50 (14’9”)</li>
                    <li>4.60+5 (15’) Olympic Trials A-Standard</li>
                    <li>4.65 (15’3”) Current Facility Record</li>
                    <li>4.70 (15’5”) Facility Record <span className='red-text'>= $1,000 for 1st place finisher + $250 for 2nd place finisher</span></li>
                    <li>4.75 (15’7”)</li>
                    <li>4.80 (15’9”)</li>
                    <li>4.85 (15’11”)</li>
                    <li>4.90 (16’1”) <span className='red-text'>+$500 bonus for 1st place finisher + $250 bonus for 2nd place finisher</span></li>
                    <li>4.95 (16’3”)</li>
                    <li>5.00 (16’5”) <span className='red-text'>+$1,000 bonus for 1st place finisher + $500 bonus for 2nd place finisher</span></li>
                </ul>

            </ul>
            <li>Elite Entries: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Elite Division Awards!</span></span>
        <ul className='event-block-details'>
            <li>$7,000 in total prize money!</li>
            <li>Elite Men: 
                <ul>
                    <li>First place finisher with a new facility record is awarded up to $2,500!</li>
                    <li>Second place finisher with a new facility record is awarded up to $1,000!</li>
                </ul>
            </li>
            <li>Elite Women: 
                <ul>
                    <li>First place finisher with a new facility record is awarded $2,500!</li>
                    <li>Second place finisher with a new facility record is awarded up to $1,000!</li>
                </ul>
            </li>
        </ul>
        <span className='event-block-details-header'><br></br><span className='red-text'>ELITE Entries</span> (as of 04/15/2024)</span>
        <span className='event-block-details-header'><br></br>ELITE MEN</span>
        <ul className='event-block-details'>
            <li>Austin Miller - 5.90m (19' 4.25")</li>
            <ul>
                <li>2023 Pole Vault Championships Silver Medalist (2022 Gold Medalist)</li>
                <li>Vault House / Team Essex</li>
                <li>Olympic Trials Finalist / USA Bronze Medalist / Millrose Games Bronze Medalist</li>
                <li><a href="https://instagram.com/a_milli29">instagram.com/a_milli29</a></li>
                <li>DMV Native!</li>
            </ul>
            <li>Matt Ludwig – 5.90m (19’ 4.25”)
                <ul>
                    <li>2023 Pan American Games Champion / 2021 Olympian / 2020 USA National Champion</li>
                    <li><a href="https://instagram.com/mattludwig_23">instagram.com/mattludwig_23</a></li>
                    <li>Ohio</li>
                </ul>
            </li>
            <li>Scott Houston – PR 5.83m (19’ 1.5”) / 2024: 5.65 (18’6.5”)
                <ul>
                    <li>Vaulthouse</li>
                    <li>2018 USA National Champion / 2018 NACAC Champion</li>
                    <li><a href="https://instagram.com/scottyhous">instagram.com/scottyhous</a></li>
                    <li>North Carolina</li>
                </ul>
            </li>
            <li>Zach Ferrara - 5.49m (18’ 0”)</li>
            <ul>
                <li>Vault Vision LLC</li>
                <li>2013 NCAA D3 National Champion / 3x All-American</li>
                <li><a href="https://instagram.com/fly1n4marshmallow">instagram.com/fly1n4marshmallow</a></li>
                <li>New York</li>
            </ul>
        </ul>
        <span className='event-block-details-header'><br></br>ELITE MEN -<span className='red-text'> B standard wait list</span></span>
        <ul className='event-block-details'>
          <li>Matthew Keim 5.34m (17' 6.25")</li>
          <ul>
            <li>Industrial Vault Club</li>
            <li>2x NCAA All American</li>
            <li><a href="https://instagram.com/matt_keim_pv">instagram.com/matt_keim_pv</a></li>
            <li>Ohio</li>
          </ul>
          <li>Christian DiNicolantonio 5.20m (17' 0.75")</li>
          <ul>
            <li>DC Vault</li>
            <li>NCAA All American / Catholic University Record Holder</li>
            <li><a href="https://instagram.com/c.dinic">instagram.com/c.dinic</a></li>
            <li>Washington, DC</li>
          </ul>
        </ul>

        <span className='event-block-details-header'><br></br>ELITE WOMEN</span>
        <ul className='event-block-details'>
        <li>Bridget Williams 4.83m (15’10.25”)
            <ul>
                <li>TeamESSX</li>
                <li>Team USA World Championships Finalist / Pan Am Games Gold Medalist</li>
                <li><a href="https://instagram.com/bridgieeee">instagram.com/bridgieeee</a></li>
                <li>Virginia</li>
            </ul>
        </li>
        <li>Anicka Newell 4.70m (15’5”)
            <ul>
                <li>Team Canada</li>
                <li>2x Olympian / 3x World Championships Qualifier / 1x National Champion</li>
                <li><a href="https://instagram.com/flygirl93">instagram.com/flygirl93</a></li>
                <li>Texas</li>
            </ul>
        </li>
        <li>Rachel Baxter 4.62m (15’1.75”)
            <ul>
                <li>TeamESSX</li>
                <li>Olympic Trials Finalist / USA Championships Top 10 / NCAA National Champion</li>
                <li><a href="https://instagram.com/_rachel_baxter_">instagram.com/_rachel_baxter_</a></li>
                <li>Virginia</li>
            </ul>
        </li>
        <li>Sydney Horn 4.51m (14’ 9.5”)
            <ul>
                <li>High Point University</li>
                <li>7x NCAA All-American / Team USA / NACAC U23 record holder</li>
                <li><a href="https://instagram.com/sydney_horn_">instagram.com/sydney_horn_</a></li>
                <li>Pennsylvania</li>
            </ul>
        </li>
        <li>Kaitlyn Dermen 4.27m (14’ 0”)
            <ul>
                <li>Philly Jumps Club</li>
                <li>NCAA DIII All American, 4x NJAC Conference champion</li>
                <li><a href="https://instagram.com/kaitlynders_">instagram.com/kaitlynders_</a></li>
                <li>New Jersey</li>
            </ul>
        </li>

        </ul>
        <span className='event-block-details-header'><br></br>ELITE WOMEN -<span className='red-text'> B standard wait list</span></span>
        <ul className='event-block-details'>
        <li>Madeline OConnell – 4.10m (13’5.5")
            <ul>
                <li>Industrial Vault Club</li>
                <li>NCAA D-III National Champion / 8x All American</li>
                <li><a href="https://instagram.com/madeline.track.adventures">instagram.com/madeline.track.adventures</a></li>
                <li>Ohio</li>
            </ul>
        </li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Open</span> Division Information</span>
        <ul className='event-block-details'>
          <li>ELEMENTARY + MIDDLE SCHOOL + HIGH SCHOOL + OPEN ADULT + EMERGING ELITE</li>
          <ul>
            <li>Elementary School Division</li>
            <ul>
              <li>Any athlete ages 7-11 who attended 5th grade and under during Spring of 2024</li>
              <li>1.55m starting height (5’1”)</li>
              <li>Combined Division (boys and girls scored separately)</li>
            </ul>
            <li>Middle School Division</li>
            <ul>
              <li>Any athlete ages 11-14 who attended grades 6-8 during Spring of 2024</li>
              <li>1.55m starting height (5’1”)</li>
              <li>Combined Division (boys and girls scored separately)</li>
            </ul>
            <li>High School Division</li>
            <ul>
              <li>Any athlete ages 14-18 who attended grades 9-12 in Spring of 2024</li>
              <li>1.85m (6’1”) starting height for girls</li>
              <li>2.45m (8’) starting height for boys Division II (PR under 12’6”)</li>
              <li>3.35m (11’) starting height for boys Division I (PR 12’6”+)</li>
            </ul>
            <li>Open Adult Division (combined)</li>
            <ul>
              <li>Any athlete age 18 and up who graduated high school prior to 2024 with a PR less than 15’</li>
              <li>1.85m (6’1”) starting height for women</li>
              <li>2.45m (8’) starting height for men</li>
              <li>Combined Division (men and women scored separately)</li>
            </ul>
            <li>Men’s Emerging Elite Division</li>
            <ul>
              <li>Any athlete with a PR of 4.57m (15’1”) or higher (verifiable)</li>
              <li>4.30m (14’1”) starting height</li>
            </ul>
            <li><strong>NOTE:</strong> Male and female competitors in combined divisions are scored separately. 15cm progressions will be used for Open Divisions.</li>
          </ul>
        </ul>

        <span className='event-block-details-header'><span className='red-text'>Spikes</span></span>
        <ul className='event-block-details'>
          <li><span className='red-text'>1/8" spikes ONLY</span> at this facility (not standard 1/4" spikes!)</li>
          <ul>
            <li>ELITE DIVISION athletes may wear 1/4" spikes</li>
            <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition</li>
            <li>1/8” spikes can be purchased online at Amazon.com</li>
            <ul>
              <li>Recommended so you don't waste time at the event trying to change spikes!</li>
              <li>Available for $5 per set at the event (bring your own spike wrench)</li>
            </ul>
          </ul>
        </ul>

        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>Note: <span className='red-text'>Rolling Schedule</span> - arrive early in case your time slot moves up!</li>
          <ul>
            <li>07:30am</li>
            <ul>
              <li>Staff Arrive</li>
            </ul>
            <li>08:30am</li>
            <ul>
              <li>Gates Open</li>
              <li>Men’s Emerging Elite - warmups (black pit)</li>
              <li>Open Adult Division - warmups (red pit)</li>
            </ul>
            <li>09:30am</li>
            <ul>
              <li>Men’s Emerging Elite - competition (black pit)</li>
              <li>Open Adult Division - competition (red pit)</li>
            </ul>
            <li>11:00am</li>
            <ul>
              <li>Girls High School Division - warmups (red pit)</li>
            </ul>
            <li>12:00pm</li>
            <ul>
              <li>Girls High School Division - competition (red pit)</li>
              <li>ELITE Division Women - warmups (black pit)</li>
            </ul>
            <li>1:00pm</li>
            <ul>
              <li>ELITE Division Women - competition (black pit)</li>
            </ul>
            <li>2:00pm</li>
            <ul>
              <li>Middle School Boys + Girls - warmups (red pit)</li>
            </ul>
            <li>2:30pm</li>
            <ul>
              <li>Middle School Boys + Girls - competition (red pit)</li>
              <li>ELITE Division Men - warmups (black pit)</li>
              <li>Fly-Kids Trial Class 1 (Fly-Kids pit)</li>
            </ul>
            <li>2:45pm</li>
            <ul>
              <li>Fly-Kids Trial Class 2 (Fly-Kids pit)</li>
            </ul>
            <li>3:00pm</li>
            <ul>
              <li>Elementary School Boys + Girls - warmups (red pit)</li>
              <li>Fly-Kids Trial Class 3 (Fly-Kids pit)</li>
            </ul>
            <li>3:15pm</li>
            <ul>
              <li>Fly-Kids Trial Class 4 (Fly-Kids pit)</li>
            </ul>
            <li>3:30pm</li>
            <ul>
              <li>ELITE Division Men - competition (black pit)</li>
              <li>Elementary School Boys + Girls - competition (red pit)</li>
            </ul>
            <li>5:00pm</li>
            <ul>
              <li>High School Boys Division I - warmups (black pit)</li>
              <li>High School Boys Division II - warmups (red pit)</li>
            </ul>
            <li>6:00pm</li>
            <ul>
              <li>High School Boys Division I – competition (black pit)</li>
              <li>High School Boys Division II - competition (red pit)</li>
            </ul>
          </ul>
        </ul>

        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>The 2024 Pole Vault Championships are open to all athletes ages 7 and up</li>
          <li>Advanced Registration Only</li>
          <li>Registration Now Closed</li>
        </ul>

        <span className='event-block-details-header'>Start List/Results</span>
        <ul className='event-block-details'>
          <li>Download Start List <a style={{color: '#C0282D'}} href='../files/pvchamps24-start.pdf' target='_blank'>here!</a> </li>
          <li>Download Final Results <a style={{color: '#C0282D'}} href='../files/pvchamps24_results.pdf' target='_blank'>here!</a></li>
        </ul>

        <span className='event-block-details-header'>Awards/Sanctioning</span>
        <ul className='event-block-details'>
          <li>Medals will be awarded in all divisions, 1st through 3rd place</li>
          <li>Special Limited-Edition Medals Awarded for facility records</li>
          <li>USATF + World Athletics Sanctioned</li>
          <li>Elite Division Results will be published to WorldAthletics.org</li>
          <li>Open Division Results will be published to Milesplit.com and DCVault.com/events</li>
        </ul>

        <span className='event-block-details-header'>FLY-KIDS Trial Class</span>
        <ul className='event-block-details'>
          <li>Four 15-minute Fly-Kids Trial Classes will be offered free of charge during the event at the following times</li>
          <ul>
            <li>2:30pm</li>
            <li>2:45pm</li>
            <li>3:00pm</li>
            <li>3:15pm</li>
          </ul>
          <li>6 participants per class</li>
          <li>Ages 6-10 ONLY (strictly enforced)</li>
          <li>Registration is first come first serve at the front gate</li>
          <ul>
            <li>A parent must be present to sign the participant up for a time slot</li>
            <li>After paying admission to the facility, coordinate with the front gate staff to choose a time slot (children under age 11 enter free)</li>
            <li>Time slots are available to reserve in listed order only. Once each class fills up, the next time slot will become available for reserving.</li>
          </ul>
        </ul>

        <span className='event-block-details-header'>Venue/Spectators/Coaches</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center - 2200 East Capitol Street NE, Washington DC</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3), download SITE MAP <a href="../files/DCV Site Map.pdf">HERE</a> to view parking and team tent areas</li>
          <li>Athletes, Spectators and Coaches enter the facility from the E. Capitol Street sidewalk gate. Park in Lot #3, exit the lot onto the sidewalk and head to the double gate facing the street next to the DC VAULT storage shed</li>
          <li>$10 Admission for all non-competitors entering the facility (CASH ONLY)</li>
          <ul>
            <li>FREE ENTRY for Children Under age 11</li>
            <li>FREE ENTRY for DC Residents w/ID</li>
            <li>FREE ENTRY for each team coach w/5 or more competitors</li>
            <li>Spectators and coaches may also watch from outside the fenced area free-of-charge</li>
          </ul>
          <li><span className='red-text'>TENTS and CANOPIES are NOT allowed inside the venue.</span> Spectators wishing to use personal shade canopies or pop-up tent canopies may do so OUTSIDE of the fenced area and enter/exit the venue as needed after paying admission. Download SITE MAP <a href="../files/DCV Site Map.pdf">HERE</a> to view parking and team tent areas.</li>
          <li>Coaches who have paid admission may enter the facility and assist athletes in the designated coach’s box</li>
          <ul>
            <li><span className='red-text'>PLEASE</span> be professional and immediately move to the back of the coaching box after your athlete jumps before talking to your athlete so that the next competitor’s coach has a clear view of the runway and pit!</li>
          </ul>
        </ul>

        <span className='event-block-details-header'>Pole Storage</span>
        <ul className='event-block-details'>
          <li>Overnight pole storage can be arranged. For drop-off and pick-up, email Events@dcvault.org by June 1st</li>
        </ul>

        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li>UCS Spirit Poles Available for Rent (inquire)</li>
          <li>$30 cash at check-in</li>
          <li>You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li>
        </ul>

        <span className='event-block-details-header'>Event Features / Food</span>
        <ul className='event-block-details'>
          <li>Free Grilled hotdogs and veggie dogs for competitors and spectators while they last!</li>
          <li>Bring something special for yourself if you’d like to grill it up!</li>
        </ul>

        <span className='event-block-details-header'>Pets</span>
        <ul className='event-block-details'>
          <li>Dog friendly venue!</li>
          <li>Bring a leash and water for your critter</li>
        </ul>

        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>For additional information, email Events@dcvault.org</li>
        </ul>


      </div>)
      },
      {
        date: new Date('June 24, 2023'),
        partial: (<div className='event-block' id='24JUN2023'>
       <p className='event-block-title'>2023 <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/events/dmvchamps23.PNG" alt="DMV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, June 24th 2023</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <p className='event-block-title'> <a style={{color: '#C0282D'}} href='../files/2023 POLE VAULT CHAMPIONSHIPS - START LIST.pdf' target='_blank'>See Start List here!</a> </p>
        <p className='event-block-title'><span className='red-text'>ELITE INVITE </span> DIVISION INFORMATION</p>
        <span className='event-block-details-header'>Entry Standards</span>
        <ul className='event-block-details'>
          <li>Elite Men</li>
          <ul>
            <li>5.35m (A) standard - automatic</li>
            <li>5.00m (B) standard</li>
            <li>4.81m starting height</li>
          </ul>
          <li>Elite Women</li>
          <ul>
            <li>4.3m (A) standard - automatic</li>
            <li>4.0m (B) standard</li>
            <li>3.71m starting height</li>
          </ul>
          <li>ELITE ENTRIES: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>$5,000 in Prize Money</span> (Elite Division)</span>
        <ul className='event-block-details'>
          <li>Elite Men: Awarded $$$ w/clearance of 5.56m (18’3&quot;) or more as follows:</li>
          <ul>
            <li>1st place = $1,250</li>
            <li>2nd place = $750</li>
            <li>3rd place = $500</li>
          </ul>
          <li>Elite Women: Awarded $$$ w/clearance of 4.46m (14&#39;8&quot;) or more as follows:</li>
          <ul>
            <li>1st place = $1,250</li>
            <li>2nd place = $750</li>
            <li>3rd place = $500</li>
          </ul>
          <li><i><u>NOTE:</u> Collegiate/High School athletes 'wishing to' maintain NCAA eligibility may not be awarded $ in accordance with NCAA requirements and will forfeit prize money.</i></li>
          <li>ELITE ENTRIES: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Elite Entries</span> (as of 06/09/2023)</span>
        <span className='event-block-details-header'><br></br>ELITE MEN</span>
        <ul className='event-block-details'>
        <ul>
          <li>Zachery Bradford - 5.91 (19' 4.5")</li>
          <ul>
            <li>Unattached / Texas Tech</li>
            <li>U20 World Championships Silver Medalist / 5-time Big 12 Champion / NCAA D-I Silver Medalist</li>
            <li><a href="https://instagram.com/bradfordpv">instagram.com/bradfordpv</a></li>
            <li>Texas</li>
          </ul>
          
          <li>Scott Houston - 5.83m (19’ 1.5”)</li>
          <ul>
            <li>Vaulthouse</li>
            <li>2018 USA National Champion / 2018 NACAC Champion</li>
            <li><a href="https://instagram.com/scottyhous">instagram.com/scottyhous</a></li>
            <li>North Carolina</li>
          </ul>
          
          <li>Cole Walsh - 5.83m (19' 1.5")</li>
          <ul>
            <li>RISEN Performance</li>
            <li>2019 World Championships Finalist / 2014 USA Junior National Champion</li>
            <li><a href="https://instagram.com/cole.vault">instagram.com/cole.vault</a></li>
            <li>Arizona</li>
          </ul>
          
          <li>Austin Miller - 5.81m (19' 0.75")</li>
          <ul>
            <li>Defending 2022 Event Champion</li>
            <li><span class="red-text">DC Vault Facility Record Holder</span> (5.63m - 18'6")</li>
            <li>Vaulthouse / Team Pacer</li>
            <li>Olympic Trials Finalist</li>
            <li><a href="https://instagram.com/a_milli29">instagram.com/a_milli29</a></li>
            <li>DMV Native!</li>
            <li>North Carolina</li>
          </ul>
          
          <li>Tray Oates - 5.74m (18’ 10”)</li>
          <ul>
            <li>Arizona Pole Vault Academy</li>
            <li>Olympic Trials 4th Place / USA National Championships 4th Place</li>
            <li><a href="https://instagram.com/olen_iii_oates">instagram.com/olen_iii_oates</a></li>
            <li>Arizona</li>
          </ul>
          
          <li>Hunter Garretson - 5.71m (18' 9")</li>
          <ul>
            <li>Unattached / University of Akron</li>
            <li>1st Team All American / 4 time NCAA National Championships Qualifier</li>
            <li><a href="https://instagram.com/polevaulthunter">instagram.com/polevaulthunter</a></li>
            <li>Ohio</li>
          </ul>
          
          <li>Jorge Luna-Estes - 5.62m (18' 5.25")</li>
          <ul>
            <li>RISEN Performance</li>
            <li>Mexican National Champion</li>
            <li><a href="https://instagram.com/iamlunaestes">instagram.com/iamlunaestes</a></li>
            <li>Mexico</li>
          </ul>
          
          <li>Keon Howe - 5.59m (18’ 4.5")</li>
          <ul>
            <li>Team Pacer</li>
            <li>2 time UNC Charlotte MVP</li>
            <li><a href="https://instagram.com/kreeceman">instagram.com/kreeceman</a></li>
            <li>North Carolina</li>
          </ul>
          
          <li>Reagan Ulrich - 5.51m (18'1")</li>
          <ul>
            <li>Unattached / University of Central Missouri</li>
            <li>5 time NCAA D-II All American</li>
            <li><a href="https://instagram.com/reaganulrichpv">instagram.com/reaganulrichpv</a></li>
            <li>Missouri</li>
          </ul>
          
          <li>Elijah Cole - 5.41m (17’ 9”)</li>
          <ul>
            <li>San Jose Track Club</li>
            <li>2023 Philippines National Champion / 2X NCAA Finals Qualifier</li>
            <li><a href="https://instagram.com/fly_with_eli">instagram.com/fly_with_eli</a></li>
            <li>Philippines</li>
          </ul>
          
          <li>Sam Young - 5.38m (17' 7.75")</li>
          <ul>
            <li>Philadelphia Jumps Club</li>
            <li>UVA University Record Holder / NCAA D-I National Championships Finalist</li>
            <li><a href="https://instagram.com/sam.phillyjumps">instagram.com/sam.phillyjumps</a></li>
            <li>Delaware</li>
          </ul>
          
          <li>Nate Hiett - 5.37m (17' 7.5")</li>
          <ul>
            <li>Arizona Pole Vault Academy</li>
            <li>3 time American East Champ</li>
            <li><a href="https://instagram.com/hiettskyvaulter">instagram.com/hiettskyvaulter</a></li>
            <li>Arizona</li>
          </ul>
          
          <li>Matthew Keim - 5.35m (17' 6.5")</li>
          <ul>
            <li>Industrial Vault Club</li>
            <li>2x NCAA All American</li>
            <li><a href="https://instagram.com/matt_keim_pv">instagram.com/matt_keim_pv</a></li>
            <li>Ohio</li>
          </ul>
          
          <li>Jacob Davis - 5.27 (17' 3.5")</li>
          <ul>
            <li>NCPVC</li>
            <li>6 time CUSA Team Champion</li>
            <li><a href="https://instagram.com/jacobtriestofly">instagram.com/jacobtriestofly</a></li>
            <li>North Carolina</li>
          </ul>
          
          <li>Joshuah Alcon - 5.2m (17’ 1”)</li>
          <ul>
            <li>DC Vault / Dominican Republic</li>
            <li>Dominican Republic National Record Holder</li>
            <li>NACAC U23 Bronze Medalist</li>
            <li><a href="https://instagram.com/joshuahalcon">instagram.com/joshuahalcon</a></li>
            <li>District of Columbia</li>
          </ul>
          
          <li>Christian Di Nicolantonio - 5.12m (16' 9.5”)</li>
          <ul>
            <li>DC Vault / Catholic University of America</li>
            <li>NCAA National Championships Qualifier / CUA Record Holder</li>
            <li><a href="https://instagram.com/c.dinic">instagram.com/c.dinic</a></li>
            <li>District of Columbia</li>
          </ul>
          
          <li>Nico Morales - 5.12m (16 '9.5")</li>
          <ul>
            <li>Vault Factory / Rutgers</li>
            <li>2023 Penn Relays Silver Medalist</li>
            <li><a href="https://instagram.com/nico.f.morales">instagram.com/nico.f.morales</a></li>
            <li>New Jersey</li>
          </ul>
        </ul>



        </ul>
        <span className='event-block-details-header'><br></br>ELITE WOMEN</span>
        <ul className='event-block-details'>
          <li>Anicka Newell - 4.70m (15’5”)</li>
          <ul>
            <li>2021 Event Champion</li>
            <li><span className='red-text'>DC Vault Facility Record Holder</span> (4.65m - 15'3")</li>
            <li>Two Time Olympian</li>
            <li><a href="https://instagram.com/flygirl93">instagram.com/flygirl93</a></li>
            <li>Texas</li>
          </ul>

          <li>Kristen Brown - 4.70m (15' 5")</li>
          <ul>
            <li>Vaulthouse / Team Pacer</li>
            <li>Two time Olympic trials finalist</li>
            <li><a href="https://instagram.com/kayybeebby">instagram.com/kayybeebby</a></li>
            <li>DMV Native!</li>
          </ul>

          <li>Kristen Leland - 4.65m (15' 3")</li>
          <ul>
            <li>Unattached</li>
            <li>2x Olympic trials qualifier / NCAA Division II National Record Holder</li>
            <li><a href="https://instagram.com/kristen_lelandpv">instagram.com/kristen_lelandpv</a></li>
            <li>Michigan</li>
          </ul>

          <li>Kortney Oates - 4.63m (15' 2")</li>
          <ul>
            <li>Risen Performance / Team Pacer</li>
            <li>7 time USA nationals Qualifier</li>
            <li><a href="https://instagram.com/kortneyoates">instagram.com/kortneyoates</a></li>
            <li>Arizona</li>
          </ul>

          <li>Gabriela Leon - 4.61m (15' 1.5')</li>
          <ul>
            <li>Puma / Team USA</li>
            <li>2022 World Championships Finalist / NCAA Division I National Champion</li>
            <li><a href="https://instagram.com/gabiileonn_">instagram.com/gabiileonn_</a></li>
            <li>Michigan</li>
          </ul>

          <ul>
            <li>
              Chloe Timberg - 4.53m (14' 10.25")
              <ul>
                <li>Unattached</li>
                <li>3 time Big Ten Conference Champion / 3 time NCAA D-I National Championships Finalist</li>
                <li><a href="https://instagram.com/chloe.timberg">instagram.com/chloe.timberg</a></li>
                <li>Pennsylvania</li>
              </ul>
            </li>
          </ul>


          <li>Sydney Horn - 4.50m (14' 9")</li>
          <ul>
            <li>VaultWorx / High Point University</li>
            <li>2022 NCAA Silver Medalist</li>
            <li>4 time NCAA All American</li>
            <li><a href="https://instagram.com/sydney_horn_">instagram.com/sydney_horn_</a></li>
            <li>Pennsylvania</li>
          </ul>

          <li>Riley Felts - 4.42m (14' 6")</li>
          <ul>
            <li>Unattached / UNC Charlotte</li>
            <li>5 time C-USA Champion / 2023 NCAA National Qualifier</li>
            <li><a href="https://instagram.com/riley.felts">instagram.com/riley.felts</a></li>
            <li>North Carolina</li>
          </ul>

          <li>Megan Houston - 4.41m (14' 5.5")</li>
          <ul>
            <li>Vaulthouse</li>
            <li>7th @ 2019 USA Indoor Championships / NCAA All American</li>
            <li><a href="https://instagram.com/zim">instagram.com/zim</a></li>
            <li>Kentucky</li>
          </ul>

          <li>Karlee Fowler - 4.25m (14')</li>
          <ul>
            <li>AZPVA</li>
            <li>Atlantic 10 conference record holder</li>
            <li><a href="https://instagram.com/kauli_flower">instagram.com/kauli_flower</a></li>
            <li>Arizona</li>
          </ul>

        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='24JUN2023'>
                <p className='event-block-title'>2023 <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/events/dmvchamps23.PNG" alt="DMV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, June 24th 2023</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <p className='event-block-title'> <a style={{color: '#C0282D'}} href='../files/2023 POLE VAULT CHAMPIONSHIPS - START LIST.pdf' target='_blank'>See Start List here!</a> </p>

        <p className='event-block-title'><span className='red-text'>ELITE INVITE </span> DIVISION INFORMATION</p>
        <span className='event-block-details-header'>Entry Standards</span>
        <ul className='event-block-details'>
          <li>Elite Men</li>
          <ul>
            <li>5.35m (A) standard - automatic</li>
            <li>5.00m (B) standard</li>
            <li>4.81m starting height</li>
          </ul>
          <li>Elite Women</li>
          <ul>
            <li>4.3m (A) standard - automatic</li>
            <li>4.0m (B) standard</li>
            <li>3.71m starting height</li>
          </ul>
          <li>ELITE ENTRIES: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>$5,000 in Prize Money</span> (Elite Division)</span>
        <ul className='event-block-details'>
          <li>Elite Men: Awarded $$$ w/clearance of 5.56m (18’3&quot;) or more as follows:</li>
          <ul>
            <li>1st place = $1,250</li>
            <li>2nd place = $750</li>
            <li>3rd place = $500</li>
          </ul>
          <li>Elite Women: Awarded $$$ w/clearance of 4.46m (14&#39;8&quot;) or more as follows:</li>
          <ul>
            <li>1st place = $1,250</li>
            <li>2nd place = $750</li>
            <li>3rd place = $500</li>
          </ul>
          <li><i><u>NOTE:</u> Collegiate/High School athletes 'wishing to' maintain NCAA eligibility may not be awarded $ in accordance with NCAA requirements and will forfeit prize money.</i></li>
          <li>ELITE ENTRIES: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Elite Entries</span> (as of 05/01/2023)</span>
        <span className='event-block-details-header'><br></br>ELITE MEN</span>
        <ul className='event-block-details'>
        <ul>
          <li>Zachery Bradford - 5.91 (19' 4.5")</li>
          <ul>
            <li>Unattached / Texas Tech</li>
            <li>U20 World Championships Silver Medalist / 5-time Big 12 Champion / NCAA D-I Silver Medalist</li>
            <li><a href="https://instagram.com/bradfordpv">instagram.com/bradfordpv</a></li>
            <li>Texas</li>
          </ul>
          
          <li>Scott Houston - 5.83m (19’ 1.5”)</li>
          <ul>
            <li>Vaulthouse</li>
            <li>2018 USA National Champion / 2018 NACAC Champion</li>
            <li><a href="https://instagram.com/scottyhous">instagram.com/scottyhous</a></li>
            <li>North Carolina</li>
          </ul>
          
          <li>Cole Walsh - 5.83m (19' 1.5")</li>
          <ul>
            <li>RISEN Performance</li>
            <li>2019 World Championships Finalist / 2014 USA Junior National Champion</li>
            <li><a href="https://instagram.com/cole.vault">instagram.com/cole.vault</a></li>
            <li>Arizona</li>
          </ul>
          
          <li>Austin Miller - 5.81m (19' 0.75")</li>
          <ul>
            <li>Defending 2022 Event Champion</li>
            <li><span class="red-text">DC Vault Facility Record Holder</span> (5.63m - 18'6")</li>
            <li>Vaulthouse / Team Pacer</li>
            <li>Olympic Trials Finalist</li>
            <li><a href="https://instagram.com/a_milli29">instagram.com/a_milli29</a></li>
            <li>DMV Native!</li>
            <li>North Carolina</li>
          </ul>
          
          <li>Tray Oates - 5.74m (18’ 10”)</li>
          <ul>
            <li>Arizona Pole Vault Academy</li>
            <li>Olympic Trials 4th Place / USA National Championships 4th Place</li>
            <li><a href="https://instagram.com/olen_iii_oates">instagram.com/olen_iii_oates</a></li>
            <li>Arizona</li>
          </ul>
          
          <li>Hunter Garretson - 5.71m (18' 9")</li>
          <ul>
            <li>Unattached / University of Akron</li>
            <li>1st Team All American / 4 time NCAA National Championships Qualifier</li>
            <li><a href="https://instagram.com/polevaulthunter">instagram.com/polevaulthunter</a></li>
            <li>Ohio</li>
          </ul>
          
          <li>Jorge Luna-Estes - 5.62m (18' 5.25")</li>
          <ul>
            <li>RISEN Performance</li>
            <li>Mexican National Champion</li>
            <li><a href="https://instagram.com/iamlunaestes">instagram.com/iamlunaestes</a></li>
            <li>Mexico</li>
          </ul>
          
          <li>Keon Howe - 5.59m (18’ 4.5")</li>
          <ul>
            <li>Team Pacer</li>
            <li>2 time UNC Charlotte MVP</li>
            <li><a href="https://instagram.com/kreeceman">instagram.com/kreeceman</a></li>
            <li>North Carolina</li>
          </ul>
          
          <li>Reagan Ulrich - 5.51m (18'1")</li>
          <ul>
            <li>Unattached / University of Central Missouri</li>
            <li>5 time NCAA D-II All American</li>
            <li><a href="https://instagram.com/reaganulrichpv">instagram.com/reaganulrichpv</a></li>
            <li>Missouri</li>
          </ul>
          
          <li>Elijah Cole - 5.41m (17’ 9”)</li>
          <ul>
            <li>San Jose Track Club</li>
            <li>2023 Philippines National Champion / 2X NCAA Finals Qualifier</li>
            <li><a href="https://instagram.com/fly_with_eli">instagram.com/fly_with_eli</a></li>
            <li>Philippines</li>
          </ul>
          
          <li>Sam Young - 5.38m (17' 7.75")</li>
          <ul>
            <li>Philadelphia Jumps Club</li>
            <li>UVA University Record Holder / NCAA D-I National Championships Finalist</li>
            <li><a href="https://instagram.com/sam.phillyjumps">instagram.com/sam.phillyjumps</a></li>
            <li>Delaware</li>
          </ul>
          
          <li>Nate Hiett - 5.37m (17' 7.5")</li>
          <ul>
            <li>Arizona Pole Vault Academy</li>
            <li>3 time American East Champ</li>
            <li><a href="https://instagram.com/hiettskyvaulter">instagram.com/hiettskyvaulter</a></li>
            <li>Arizona</li>
          </ul>
          
          <li>Matthew Keim - 5.35m (17' 6.5")</li>
          <ul>
            <li>Industrial Vault Club</li>
            <li>2x NCAA All American</li>
            <li><a href="https://instagram.com/matt_keim_pv">instagram.com/matt_keim_pv</a></li>
            <li>Ohio</li>
          </ul>
          
          <li>Jacob Davis - 5.27 (17' 3.5")</li>
          <ul>
            <li>NCPVC</li>
            <li>6 time CUSA Team Champion</li>
            <li><a href="https://instagram.com/jacobtriestofly">instagram.com/jacobtriestofly</a></li>
            <li>North Carolina</li>
          </ul>
          
          <li>Joshuah Alcon - 5.2m (17’ 1”)</li>
          <ul>
            <li>DC Vault / Dominican Republic</li>
            <li>Dominican Republic National Record Holder</li>
            <li>NACAC U23 Bronze Medalist</li>
            <li><a href="https://instagram.com/joshuahalcon">instagram.com/joshuahalcon</a></li>
            <li>District of Columbia</li>
          </ul>
          
          <li>Christian Di Nicolantonio - 5.12m (16' 9.5”)</li>
          <ul>
            <li>DC Vault / Catholic University of America</li>
            <li>NCAA National Championships Qualifier / CUA Record Holder</li>
            <li><a href="https://instagram.com/c.dinic">instagram.com/c.dinic</a></li>
            <li>District of Columbia</li>
          </ul>
          
          <li>Nico Morales - 5.12m (16 '9.5")</li>
          <ul>
            <li>Vault Factory / Rutgers</li>
            <li>2023 Penn Relays Silver Medalist</li>
            <li><a href="https://instagram.com/nico.f.morales">instagram.com/nico.f.morales</a></li>
            <li>New Jersey</li>
          </ul>
        </ul>


        </ul>
        <span className='event-block-details-header'><br></br>ELITE WOMEN</span>
        <ul className='event-block-details'>
          <li>Anicka Newell - 4.70m (15’5”)</li>
          <ul>
            <li>2021 Event Champion</li>
            <li><span className='red-text'>DC Vault Facility Record Holder</span> (4.65m - 15'3")</li>
            <li>Two Time Olympian</li>
            <li><a href="https://instagram.com/flygirl93">instagram.com/flygirl93</a></li>
            <li>Texas</li>
          </ul>

          <li>Kristen Brown - 4.70m (15' 5")</li>
          <ul>
            <li>Vaulthouse / Team Pacer</li>
            <li>Two time Olympic trials finalist</li>
            <li><a href="https://instagram.com/kayybeebby">instagram.com/kayybeebby</a></li>
            <li>DMV Native!</li>
          </ul>

          <li>Kristen Leland - 4.65m (15' 3")</li>
          <ul>
            <li>Unattached</li>
            <li>2x Olympic trials qualifier / NCAA Division II National Record Holder</li>
            <li><a href="https://instagram.com/kristen_lelandpv">instagram.com/kristen_lelandpv</a></li>
            <li>Michigan</li>
          </ul>

          <li>Kortney Oates - 4.63m (15' 2")</li>
          <ul>
            <li>Risen Performance / Team Pacer</li>
            <li>7 time USA nationals Qualifier</li>
            <li><a href="https://instagram.com/kortneyoates">instagram.com/kortneyoates</a></li>
            <li>Arizona</li>
          </ul>

          <li>Gabriela Leon - 4.61m (15' 1.5')</li>
          <ul>
            <li>Puma / Team USA</li>
            <li>2022 World Championships Finalist / NCAA Division I National Champion</li>
            <li><a href="https://instagram.com/gabiileonn_">instagram.com/gabiileonn_</a></li>
            <li>Michigan</li>
          </ul>

          <ul>
            <li>
              Chloe Timberg - 4.53m (14' 10.25")
              <ul>
                <li>Unattached</li>
                <li>3 time Big Ten Conference Champion / 3 time NCAA D-I National Championships Finalist</li>
                <li><a href="https://instagram.com/chloe.timberg">instagram.com/chloe.timberg</a></li>
                <li>Pennsylvania</li>
              </ul>
            </li>
          </ul>

          <li>Sydney Horn - 4.50m (14' 9")</li>
          <ul>
            <li>VaultWorx / High Point University</li>
            <li>2022 NCAA Silver Medalist</li>
            <li>4 time NCAA All American</li>
            <li><a href="https://instagram.com/sydney_horn_">instagram.com/sydney_horn_</a></li>
            <li>Pennsylvania</li>
          </ul>

          <li>Riley Felts - 4.42m (14' 6")</li>
          <ul>
            <li>Unattached / UNC Charlotte</li>
            <li>5 time C-USA Champion / 2023 NCAA National Qualifier</li>
            <li><a href="https://instagram.com/riley.felts">instagram.com/riley.felts</a></li>
            <li>North Carolina</li>
          </ul>

          <li>Megan Houston - 4.41m (14' 5.5")</li>
          <ul>
            <li>Vaulthouse</li>
            <li>7th @ 2019 USA Indoor Championships / NCAA All American</li>
            <li><a href="https://instagram.com/zim">instagram.com/zim</a></li>
            <li>Kentucky</li>
          </ul>

          <li>Karlee Fowler - 4.25m (14')</li>
          <ul>
            <li>AZPVA</li>
            <li>Atlantic 10 conference record holder</li>
            <li><a href="https://instagram.com/kauli_flower">instagram.com/kauli_flower</a></li>
            <li>Arizona</li>
          </ul>

        </ul>
        <span className='event-block-details-header'>Bar Progressions</span>
        <ul className='event-block-details'>
          <li>Elite Men</li>
          <ul>
            <li>4.81 - 15&#39;9&quot;</li>
            <li>4.96 - 16&#39;3&quot;</li>
            <li>5.11 - 16&#39;9&quot;</li>
            <li>5.26 - 17&#39;3&quot;</li>
            <li>5.41 - 17&#39;9&quot;</li>
            <li>5.56 - 18&#39;3&quot; ($$$ CASH BAR)</li>
            <li>5.71 - 18&#39;9&quot;</li>
            <li>5.81 - 19&#39;1&quot; (WORLD CHAMPIONSHIPS QUALIFIER BAR)</li>
            <li>5.91 - 19&#39;5&quot;</li>
          </ul>
          <li>Elite Women</li>
          <ul>
            <li>3.71 - 12’2”</li>
            <li>3.86 - 12’8”</li>
            <li>4.01 - 13’2”</li>
            <li>4.16 - 13’8”</li>
            <li>4.31 - 14&#39;2&quot;</li>
            <li>4.46 - 14’8” ($$$ CASH BAR)</li>
            <li>4.61 - 15’1”</li>
            <li>4.71 - 15’5” (WORLD CHAMPIONSHIPS QUALIFIER BAR)</li>
            <li>4.81 - 15’9”</li>
            <li>4.91 - 16’1”</li>
            <li>5.01 - 16’5”</li>
          </ul>
        </ul>
        <p className='event-block-title'><span className='red-text'>OPEN</span> DIVISIONS / GENERAL EVENT INFORMATION</p>


        <span className='event-block-details-header'>Awards/Sanctioning</span>
        <ul className='event-block-details'>
          <li>Medals will be awarded in all divisions, 1st through 3rd places</li>
          <li>Special Limited-Edition Medals Awarded to the #1 High School Male and Female Competitors from the DMV (DC, MD, VA) region and for facility + event records</li>
          <li>USATF Sanctioned</li>
          <li>Results/Performance marks will be published at <a href = "https://www.worldathletics.org">WorldAthletics.org</a> (elite division only), <a href = "https://www.milesplit.com">Milesplit.com</a> and <a href="https://dcvault.com/events">DCVault.com/events</a>.</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center - 2200 East Capitol street NE Washington DC</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li>Athletes and Spectators enter the facility from the E. Capitol Street sidewalk gate. Park in Lot #3, exit the lot onto the sidewalk and had to the double gate facing the street next to the DC VAULT storage shed</li>
        </ul>
        <span className='event-block-details-header'>Open Divisons</span>
        <ul className='event-block-details'>
        <ul>
          <li>Fly-Kids Open Division</li>
          <ul>
            <li>Any athlete age 7-11</li>
            <li>1.55m starting height (5’1”)</li>
          </ul>
          <li>Masters Open Division</li>
          <ul>
            <li>Any athlete age 50+</li>
            <li>1.75m starting height (5’9”)</li>
          </ul>
          <li>Women Open Division (formerly red + black divisions)</li>
          <ul>
            <li>Female athletes with a PR under 4.10m (less than 13’5’)</li>
            <li>1.75m starting height (5’9”)</li>
          </ul>
          <li>Men ELITE I Division</li>
          <ul>
            <li>Male athletes with a PR of 4.6m to 5.35m (15’1”-17’6’’)</li>
            <li>4.25m starting height (13’11”)</li>
          </ul>
          <li>Women ELITE II Division</li>
          <ul>
            <li>Female athletes with a PR of 4.10m+ (13’5” and up)</li>
            <li>3.71m starting height (12’2”)</li>
          </ul>
          <li>Men ELITE III Division</li>
          <ul>
            <li>Male athletes with a PR of 5.36m+ (17’7” and up)</li>
            <li>4.96m starting height (16’3”)</li>
          </ul>
          <li>Men Open I Division</li>
          <ul>
            <li>Male athletes with a PR under 3.95m (less than 13’)</li>
            <li>2.8m starting height (9’3”)</li>
          </ul>
          <li>Men Open II Division</li>
          <ul>
            <li>Male athletes with a PR of 3.95m-4.59 (13’-15’)</li>
            <li>3.5m starting height (11’6”)</li>
          </ul>
        </ul>
        <p><strong>NOTE:</strong> Male and female competitors are scored separately in Fly-Kids and Masters combined Divisions. 15cm progressions will be used for Open Divisions.</p>


        <li><i>NOTE: Male and female competitors are scored separately in Fly-Kids and Masters combined Divisions. 15cm progressions will be used for Open Divisions.</i></li>

        </ul>
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>Note: <span className='red-text'>Rolling Schedule</span> - arrive early in case your time slot moves up!</li>
          <ul>
            <li>
              07:00am (staff arrive)
            </li>
            <li>
              08:00am (gates open / warmups)
              <ul>
                <li>Fly-Kids (red pit)</li>
              </ul>
            </li>
            <li>
              08:30am (competition)
              <ul>
                <li>Fly-Kids (1.5m start)</li>
              </ul>
            </li>
            <li>
              09:00am (warmups)
              <ul>
                <li>Masters Open (red pit)</li>
                <li>Women Open (red pit)</li>
                <li>Men ELITE I (black pit)</li>
              </ul>
            </li>
            <li>
              10:00am (competition)
              <ul>
                <li>Women Open (1.75m start)</li>
                <li>Masters Open (1.75m start)</li>
                <li>Men ELITE I (4.25m start)</li>
              </ul>
            </li>
            <li>
              12:00pm (warmups)
              <ul>
                <li>Women ELITE II (black pit)</li>
              </ul>
            </li>
            <li>
              1:00pm (competition)
              <ul>
                <li>Women ELITE II (3.71m start)</li>
              </ul>
            </li>
            <li>
              2:30pm (warmups)
              <ul>
                <li>Men ELITE III (black pit)</li>
              </ul>
            </li>
            <li>
              3:30pm (competition)
              <ul>
                <li>Men ELITE IIII (4.81m start)</li>
              </ul>
            </li>
            <li>
              5:00pm (warmups)
              <ul>
                <li>Men Open I (red pit)</li>
                <li>Men Open II (black pit)</li>
              </ul>
            </li>
            <li>
              6:00pm (competition)
            </li>
          </ul>



        </ul>
        <span className='event-block-details-header'>Start List/Results</span>
        <ul className='event-block-details'>
          <li>Download Start List <a style={{color: '#C0282D'}} href='../files/2023 POLE VAULT CHAMPIONSHIPS - START LIST.pdf' target='_blank'>here!</a> </li>
          <li>Download Final Results <a style={{color: '#C0282D'}} href='../files/2023 POLE VAULT CHAMPIONSHIPS - RESULTS & START LIST.xlsx' target='_blank'>here!</a></li>
        </ul>
        <span className='event-block-details-header'>Spikes</span>
        <ul className='event-block-details'>
          <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>
          <ul>
            <li>ELITE DIVISION athletes may wear 1/4" spikes</li>
          </ul>
          <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>
          <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
          <ul>
            <li>Recommended so you don't waste time at the event trying to change spikes!</li>
          </ul>
          <li>Available for $5 per set at the event (bring your own spike wrench)</li>
          
        </ul>
        <span className='event-block-details-header'>Pole Storage</span>
        <ul className='event-block-details'>
          <li>Overnight pole storage can be arranged. For drop-off and pick-up, email <span className='red-text'>Events@dcvault.org</span></li>
        </ul>
        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li>UCS Spirit Poles Available for Rent (inquire)</li>
          <li>$30 cash at check-in</li>
          <li>You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li>
        </ul>

        <span className='event-block-details-header'>Event Features / Food</span>
        <ul className='event-block-details'>
          <li>Free Grilled hotdogs and veggie dogs for competitors and spectators!</li>
          <li>Bring something special for yourself if you’d like to grill it up!</li>
        </ul>
        <span className='event-block-details-header'>Pets</span>
        <ul className='event-block-details'>
          <li>Dog friendly venue!</li>
          <li>Bring a leash and water for your critter</li>
        </ul>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>The 2023 Pole Vault Championships are open to all athletes ages 7 and up</li>
          <li>Registration Closed</li>
          <li><b>$10 for all non-competitors entering the facility (cash)</b></li>
          <li>Spectators and coaches may also watch from outside the fence free of charge</li>
        </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>For additional information, email <span className='red-text'>Events@dcvault.org</span></li>
        </ul>

      </div>)
      },
      {
        date: new Date('July 14, 2023'),
        partial: (<div className='event-block' id='14JUL2023'>
        <p className='event-block-title'>2023 FLY-KIDS <span className='red-text'>SUMMER</span> CAMP</p>
        <img src = "../img/events/kidscamp23.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>5 WEEKS of Pole Vaulting and Games!</span>
          <br></br>
          <span className='event-block-date'>July 10th through August 11th</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol Street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates</span>
        <ul className='event-block-details'>
          <li>Jul 10th - Jul 14th</li>
          <li>Jul 17th - Jul 21st</li>
          <li>Jul 24th - Jul 28th</li>
          <li>Jul 31st - Aug 4th</li>
          <li>Aug 7th - Aug 11th</li>
        </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-11</li>
          <li>Beginners through Advanced Pole Vaulters</li>
          <li>5 weeks to choose from</li>
          <li>Monday thru Friday 8:45am – 3:15pm</li>
          <li>Dropoff window 8:45am-9:00am</li>
          <li>Pickup window 3:00-3:15pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more</li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>Tuesday &amp; Thursday includes a trip to Moorenko&#39;s Ice Cream at Eastern Market during lunch break</li>
        </ul>
        
        <span className='event-block-details-header'>Included with Registration</span>
        <ul className='event-block-details'>
          <li>All equipment for use during camp</li>
          <li>Moorenko’s Ice Cream trips on Tuesday and Thursday</li>
          <li>DC Vault t-shirt (youth sizes only)</li>
          <li>Healthy Snacks</li>
        </ul>
        
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='14JUL2023'>
        <p className='event-block-title'>2023 FLY-KIDS <span className='red-text'>SUMMER</span> CAMP</p>
        <img src = "../img/events/kidscamp23.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>5 WEEKS of Pole Vaulting and Games!</span>
          <br></br>
          <span className='event-block-date'>July 10th through August 11th</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol Street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates</span>
        <ul className='event-block-details'>
          <li>Jul 10th - Jul 14th</li>
          <li>Jul 17th - Jul 21st</li>
          <li>Jul 24th - Jul 28th</li>
          <li>Jul 31st - Aug 4th</li>
          <li>Aug 7th - Aug 11th</li>
        </ul>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-11</li>
          <li>Beginners through Advanced Pole Vaulters</li>
          <li>5 weeks to choose from</li>
          <li>Monday thru Friday 8:45am – 3:15pm</li>
          <li>Dropoff window 8:45am-9:00am</li>
          <li>Pickup window 3:00-3:15pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more</li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>Tuesday &amp; Thursday includes a trip to Moorenko&#39;s Ice Cream at Eastern Market during lunch break</li>
        </ul>
        
        <span className='event-block-details-header'>Included with Registration</span>
        <ul className='event-block-details'>
          <li>All equipment for use during camp</li>
          <li>Moorenko’s Ice Cream trips on Tuesday and Thursday</li>
          <li>DC Vault t-shirt (youth sizes only)</li>
          <li>Healthy Snacks</li>
        </ul>
        <span className='event-block-details-header'>Daily Schedule</span>
        <ul className='event-block-details'>
          <li>8:45-9:00am </li>
          <ul>
            <li>drop-off window + games</li>
          </ul>
          <li>9:00-9:30am </li>
          <ul>
            <li>warm-ups + strength</li>
          </ul>
          <li>9:30-10:30am  </li>
          <ul>
            <li>drills</li>
          </ul>
          <li>10:30am-11am  </li>
          <ul>
            <li>break + snacks + games</li>
          </ul>
          <li>11-12pm </li>
          <ul>
            <li>vault</li>
          </ul>
          <li>12-12:30pm  </li>
          <ul>
            <li>walk to Lincoln Park</li>
          </ul>
          <li>12:30-1pm  </li>
          <ul>
            <li>lunch @ Lincoln Park (+ Ice Cream @ E. Market on Tue & Thu)</li>
          </ul>
          <li>1:00-1:30pm</li>
          <ul>
            <li>drills @ Lincoln Park</li>
          </ul>
          <li>1:30-2:00pm</li>
          <ul>
            <li>walk to DCV</li>
          </ul>
          <li>2:00pm-3:00pm</li>
          <ul>
            <li>vault</li>
          </ul>
          <li>3:00-3:15pm </li>
          <ul>
            <li>Pickup window + games</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Daily Technical Focus</span>
        <ul className='event-block-details'>
          <li>M - run / takeoff</li>
          <ul>
            <li>learn to carry and run with the pole and how to take-off</li>
          </ul>
          <li>T - swing</li>
          <ul>
            <li>learn to begin to swing upside down on the pole with rings, ropes and hanging drills</li>
          </ul>
          <li>W - extension </li>
          <ul>
            <li>learn how to pull yourself up the pole towards the bar with ropes, platforms and partner drills</li>
          </ul>
          <li>R - turn</li>
          <ul>
            <li>learn to turn over the bar with rings, ropes, platforms and ground drills</li>
          </ul>
          <li>F - height / competition </li>
          <ul>
            <li>Putting all of the technical work together, campers will have a competition to go over heights!</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Games</span>
        <ul className='event-block-details'>
          <li>Water Balloon Fight</li>
          <li>Face Painting</li>
          <li>Sumo Ball Wrestling Match</li>
          <li>Nerf Games</li>
          <li>Relay Races</li>
          <li>and more!</li>
        </ul>
        <span className='event-block-details-header'>What to Bring</span>
        <ul className='event-block-details'>
          <li>Water Bottle</li>
          <li>Sunblock</li>
          <li>Bug Spray</li>
          <li>Bag Lunch (ice chest available at DCV)</li>
          <li>Running shoes</li>
          <li>Athletic active wear clothing</li>
        </ul>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>$350/week</li>
          <li>10% Discount when registering for 4 or 5 weeks (Discount applied at checkout)</li>
          <li><a href = "http://dcvault.com/compete/">Register Here</a>  </li>
        </ul>
        
        <center><span className='red-text'>Click Arrow to Collapse Info</span></center>
        </div>)
      },
      {
        date: new Date('August 25, 2022'),
        partial: (<div className='event-block' id='25AUG2022'>
        <p className='event-block-title'><span class="red-text">THURSDAY</span> NIGHT <span class="red-text">F</span>L<span class="red-text">IGHTS</span>!</p>
        <img src = "../img/events/tnflights.JPG" alt="TNF" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Bi-Weekly, Thursdays, Summer 2022</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates:</span>
        <ul className='event-block-details'>
          <li>Jul 14 </li>
          <li>Jul 28 </li>
          <li>Aug 11 </li>
          <li>Aug 25</li>
        </ul>

        <span className='event-block-details-header'>Schedule: </span>
        <ul className='event-block-details'>
          <li>6pm · Gates, Registration and Runways Open  </li>
          <li>7pm · Competition Begins</li>
          <li>REGISTRATION CLOSES AT 6:45pm</li>
        </ul>
        <span className='event-block-details-header'>Registration/Entry: </span>
        <ul className='event-block-details'>
          <li>No pre-registration needed </li>
          <li>Register at the event</li>
          <li>$5 cash entry for competitors </li>
          <li>$5 cash entry for spectators</li>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='25AUG2022'>
        <p className='event-block-title'>THURSDAY  <span className='red-text'>NIGHT  </span> FLIGHTS!</p>
        <img src = "../img/events/tnflights.JPG" alt="TNF" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Bi-Weekly, Thursdays, Summer 2022</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Dates:</span>
        <ul className='event-block-details'>
          <li>Jul 14 </li>
          <li>Jul 28 </li>
          <li>Aug 11 </li>
          <li>Aug 25</li>
        </ul>

        <span className='event-block-details-header'>Schedule: </span>
        <ul className='event-block-details'>
          <li>5:30pm · Gates, Registration and Runways Open  </li>
          <li>6:30pm · Competition Begins</li>
          <li>REGISTRATION CLOSES AT 6:45pm</li>
        </ul>
        <span className='event-block-details-header'>Registration/Entry: </span>
        <ul className='event-block-details'>
          <li>No pre-registration needed </li>
          <li>Register at the event</li>
          <li>$5 cash entry for competitors </li>
          <li>$5 cash entry for spectators</li>
        </ul>
        <span className='event-block-details-header'><span class="red-text">Spikes</span></span>
        <ul className='event-block-details'>
          <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>
          <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>
          <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
          <li>Available for $5 per set at the event (bring your own spike wrench)</li> 
        </ul>
        <span className='event-block-details-header'><span class="red-text">Pole Rentals</span></span>
        <ul className='event-block-details'>
          <li>10&#39;8&quot; - 15&#39;1&quot; UCS Spirit Poles Available for Rent</li>
          <li>$5 cash at check-in</li>
          <li>You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li> 
        </ul>
        <span className='event-block-details-header'>Location:</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>2200 East Capitol Street NE · Washington DC</li>
        </ul>
        <span className='event-block-details-header'>Ages:</span>
        <ul className='event-block-details'>
          <li>7 years old and up</li>
          <li>Athletes are expected to be capable of executing safe vaults · athletes exhibiting an inability to vault safely will not be allowed to compete</li>
        </ul>
        <span className='event-block-details-header'>Opening Heights </span>
        <ul className='event-block-details'>
          <li>4’ or higher as needed</li>
        </ul>
        <span className='event-block-details-header'>Additional Information </span>
        <ul className='event-block-details'>
          <li>Open Runway on 2nd practice pit available for use during and after your competition!</li>
          <li>Results/Performance marks will be published at <a href = "https://www.milesplit.com">Milesplit.com</a> and <a href="https://dcvault.com/events">DCVault.com/events</a>.</li>
          <li>Pets Welcome (bring leash and water)</li>
          <li>Dogs on the grill while they last · bring your own food to grill if you like!</li>
          <li>Additional Questions: Events@DCVault.org</li>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>)
      },
      {
        date: new Date('July 11, 2022'),
        partial: (<div className='event-block' id='11JUL2022'>
        <p className='event-block-title'>FLY-KIDS <span className='red-text'>SUMMER</span> CAMP</p>
        <img src = "../img/events/kidscamp.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Monday-Friday, July 11th-15th 2022</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol Street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-10</li>
          <li>Beginners through Advanced</li>
          <li>Monday thru Friday 8:45am - 4pm</li>
          <li>Dropoff window 8:45am-9am</li>
          <li>Pickup window 3:30-4pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more </li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>On Tuesday & Thursday a trip to Moorenko's Ice Cream at Eastern Market will be included during lunch</li>
        </ul>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Deadline to register is July 8th </li>
          <li>$350 - <a href = "http://dcvault.com/register/">Register Here</a>  </li>
        </ul>
        <span className='event-block-details-header'>Included</span>
        <ul className='event-block-details'>
          <li>All equipment is provided</li>
          <li>Moorenko’s Ice Cream included</li>
          <li>DC Vault t-shirt included (youth sizes only)</li>
          <li>Healthy Snacks provided</li>
          <li>Water provided</li>
        </ul>
        
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='11JUL2022'>
        <p className='event-block-title'>FLY-KIDS <span className='red-text'>SUMMER</span> CAMP</p>
        <img src = "../img/events/kidscamp.jpg" alt="FLY-KIDS" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Monday-Friday, July 11th-15th 2022</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol Street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>Ages 7-10</li>
          <li>Beginners through Advanced</li>
          <li>Monday thru Friday 8:45am - 4pm</li>
          <li>Dropoff window 8:45am-9am</li>
          <li>Pickup window 3:30-4pm</li>
          <li>Kids will participate in daily pole vaulting, drills, strength training, games and more </li>
          <li>Kids will be escorted to Lincoln Park for lunch break, drills, and games</li>
          <li>On Tuesday & Thursday a trip to Moorenko's Ice Cream at Eastern Market will be included during lunch</li>
        </ul>
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Deadline to register is July 8th </li>
          <li>Registration Closed  </li>
        </ul>
        <span className='event-block-details-header'>Included</span>
        <ul className='event-block-details'>
          <li>All equipment is provided</li>
          <li>Moorenko’s Ice Cream included</li>
          <li>DC Vault t-shirt included (youth sizes only)</li>
          <li>Healthy Snacks provided</li>
          <li>Water provided</li>
        </ul>
        <span className='event-block-details-header'>Daily Schedule</span>
        <ul className='event-block-details'>
          <li>8:45-9:00am </li>
          <ul>
            <li>drop-off window + games</li>
          </ul>
          <li>9:00-9:30am </li>
          <ul>
            <li>warm-ups + strength</li>
          </ul>
          <li>9:30-10:30am  </li>
          <ul>
            <li>drills</li>
          </ul>
          <li>10:30am-11am  </li>
          <ul>
            <li>break + snacks + games</li>
          </ul>
          <li>11-12pm </li>
          <ul>
            <li>vault</li>
          </ul>
          <li>12-12:30pm  </li>
          <ul>
            <li>walk to Lincoln Park</li>
          </ul>
          <li>12:30-1pm  </li>
          <ul>
            <li>lunch @ Lincoln Park (+ Ice Cream @ E. Market on Tue & Thu)</li>
          </ul>
          <li>1-2pm </li>
          <ul>
            <li>drills @ Lincoln Park</li>
          </ul>
          <li>2-2:30 </li>
          <ul>
            <li>walk to DCV</li>
          </ul>
          <li>2:30-3:30pm </li>
          <ul>
            <li>vault</li>
          </ul>
          <li>3:30-4pm </li>
          <ul>
            <li>Pickup window + games</li>
          </ul>
        </ul>
        <span className='event-block-details-header'>Daily Technical Focus</span>
        <ul className='event-block-details'>
          <li>M - run / takeoff</li>
          <li>T - swing (+ Ice Cream Day!)</li>
          <li>W - extension </li>
          <li>R - turn (+ Ice Cream Day!)</li>
          <li>F - height / competition </li>
        </ul>
        <span className='event-block-details-header'>What to Bring</span>
        <ul className='event-block-details'>
          <li>Water Bottle</li>
          <li>Sunblock</li>
          <li>Bug Spray</li>
          <li>Bag Lunch (ice chest available at DCV)</li>
          <li>Running shoes</li>
          <li>Athletic active wear clothing</li>
        </ul>
        
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>)
      },
      {
        date: new Date('July 2, 2022'),
        partial: (<div className='event-block' id='02JUL2022'>
        <p className='event-block-title'>2022 <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/events/dmvchamps.png" alt="DMV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, July 2nd 2022</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Awards/Sanctioning</span>
        <ul className='event-block-details'>
          <li>Medals will be awarded in all divisions, 1st through 3rd places</li>
          <li>Special Limited-Edition Medals Awarded to the #1 High School Male and Female Competitors from the DMV (DC, MD, VA) region</li>
          <li>USATF Sanctioned</li>
          <li>Results/Performance marks will be published at <a href = "https://www.worldathletics.org">WorldAthletics.org</a> (elite division only), <a href = "https://www.milesplit.com">Milesplit.com</a> and <a href="https://dcvault.com/events">DCVault.com/events</a>.</li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>$5,000 in Prize Money</span> (Elite Division)</span>
        <ul className='event-block-details'>
          <li>Elite Men (4.9m/16' entry standard - must be verified)</li>
          <ul>
            <li>Award $ w/clearance of 5.5m (18') or more as follows:</li>
            <ul>
              <li>1st place = $1,250</li>
              <li>2nd place = $750</li>
              <li>3rd place = $500</li>
            </ul>
          </ul>
          <li>Elite Women (3.97m/13' entry standard - must be verified)</li>
          <ul>
            <li>Award $ w/clearance of 4.40m (14'5") or more as follows…</li>
            <ul>
              <li>1st place = $1,250</li>
              <li>2nd place = $750</li>
              <li>3rd place = $500</li>
            </ul>
          </ul>
          <li><i><u>NOTE:</u> Collegiate/High School athletes 'wishing to' maintain NCAA eligibility may not be awarded $ in accordance with NCAA requirements and will forfeit prize money.</i></li>
          <li>ELITE ENTRIES: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Elite Entries</span> (as of 6/21/2022)</span>
        <span className='event-block-details-header'><br></br>MEN</span>
        <ul className='event-block-details'>
          <li>Nate Richartz  - 5.75m (<span className='red-text'>18' 10.25"</span>)</li>
          <ul>
            <li>RISEN Performance / Tracksmith</li>
            <li>Olympic Trials Qualifier</li>
            <li><a href = "https://instagram.com/nate_richartz">instagram.com/nate_richartz</a></li>
            <li>Arizona</li>
          </ul>
          <li>Tray Oates - 5.74m (<span className='red-text'>18' 9.9"</span>)</li>
          <ul>
            <li>Arizona Pole Vault Academy / Midwest Meats</li>
            <li>Olympic Trials 4th Place / USA National Championships 4th Place / 5 time All-American</li>
            <li><a href = "https://instagram.com/olen_iii_oates">instagram.com/olen_iii_oates</a></li>
            <li>Arizona</li>
          </ul>
          <li>Austin Miller - 5.73m (<span className='red-text'>18' 9.5"</span>)</li>
          <ul>
            <li>Vault House / Tean Pacer</li>
            <li>Olympic Trials Finalist / DMV Native!</li>
            <li><a href = "https://instagram.com/a_milli29">instagram.com/a_milli29</a></li>
            <li>North Carolina</li>
          </ul>
          <li>Zach Ferrara - 5.45m (<span className='red-text'>17' 10.5"</span>)</li>
          <ul>
            <li>Talons Up Vault Club</li>
            <li>NCAA Division III National Champion / 3 time All-American / USATF Indoor Championships Qualifier</li>
            <li><a href = "https://instagram.com/Fly1n4marshmallow">instagram.com/Fly1n4marshmallow</a></li>
            <li>New York</li>
          </ul>
          <li>Matthew Keim 5.34m (<span className='red-text'>17' 6.25"</span>)</li>
          <ul>
            <li>Industrial Vault Club</li>
            <li>2x NCAA All American</li>
            <li><a href = "https://instagram.com/matt_keim_pv">instagram.com/matt_keim_pv</a></li>
            <li>Ohio</li>
          </ul>
          <li>Christian Di Nicolantonio 4.91m (<span className='red-text'>16' 1.25"</span>)</li>
          <ul>
            <li>DC Vault / Catholic University of America</li>
            <li>NCAA National Championships Qualifier / CUA Record Holder</li>
            <li><a href = "https://instagram.com/c.dinic">instagram.com/c.dinic</a></li>
            <li>District of Columbia</li>
          </ul>
          <li>Brandon Shin - 4.9m (<span className='red-text'>16' 0.75"</span>)</li>
          <ul>
            <li>DC Vault / The University of Chicago</li>
            <li>NCAA National Championships Qualifier</li>
            <li><a href = "https://instagram.com/brndnshn">instagram.com/brndnshn</a></li>
            <li>Ohio</li>
          </ul>
        </ul>
        <span className='event-block-details-header'><br></br>WOMEN</span>
        <ul className='event-block-details'>
          <li>Kristen Brown 4.70m (<span className='red-text'>15' 5"</span>)</li>
          <ul>
            <li>Two time Olympic trials finalist and has been ranked top 10 in the world!</li>
            <li><a href = "https://instagram.com/kayybeebby">instagram.com/kayybeebby</a></li>
            <li>Atlanta, GA</li>
          </ul>
          <li>Kortney Oates - 4.63m (<span className='red-text'>15' 2.2"</span>)</li>
          <ul>
            <li>Risen Performance / Team Pacer</li>
            <li>7x USA nationals Qualifier</li>
            <li><a href = "https://instagram.com/kortneyoates">instagram.com/kortneyoates</a></li>
            <li>Arizona</li>
          </ul>
        </ul>

        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>The 2022 Pole Vault Championships are open to all athletes ages 7 and up</li>
          <li>Advanced Registration Only</li>
          <li>Registration Closes June 28th</li>
          <li>$35 for competitors - <span className='red-text'>Registration Closed</span></li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches may also watch from outside the fence free of charge</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <ul>
            <li>2200 East Capitol street NE Washington DC </li>
          </ul>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>
        </ul>
        <span className='event-block-details-header'>Final Schedule</span>
        <ul className='event-block-details'>
          <li>Note: <span className='red-text'>Rolling Schedule</span> - arrive early in case your time slot moves up!</li>
          <li>15cm progressions</li>
          <li><a style={{color: '#C0282D'}} href='../files/pvchampsSL.docx' target='_blank'>See Start List here!</a> </li>
          <li>Flight Times:</li>
          <ul>
            <li>08:30am (staff arrive)</li>
            <li><span className = 'red-text'>09:45am (gates open)</span></li>
            <li>10:00am (warmups)</li>
              <ul>
                <li>6&#39;-11&#39;6&quot; Combined (red pit)</li>
                <li>11’7”-15’11” Men (black pit)</li>
              </ul>
            <li>11:00 am (competition)</li>
              <ul>
                <li><span className = 'red-text'>6&#39;-11&#39;6&quot; Combined (1.85m start)</span></li>
                <li><span className = 'red-text'>11’7”-15’11” Men (3.40m start)</span></li>
              </ul>
            <li>1:00pm (warmups)</li>
            <ul>
              <li>Fly-Kids (red pit)</li>
              <li>12’+ Elite Women (black pit)</li>
            </ul>
            <li><span className = 'red-text'>2:00pm (competition)</span></li>
            <ul>
              <li><span className = 'red-text'>Fly-Kids (1.25m start)</span></li>
              <li><span className = 'red-text'>12’+ Elite Women (3.40m start)</span></li>
            </ul>
            <li>4:00pm (warmups)</li>
            <ul>
              <li>Elite Men (black pit)</li>
            </ul>
            <li><span className = 'red-text'>5:00pm (competition)</span></li>
            <ul>
              <li><span className = 'red-text'>16’+ Elite Men (4.6m opening height)</span></li>
            </ul>
          </ul>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='02JUL2022'>
                <p className='event-block-title'>2022 <span className='red-text'>Pole Vault</span> Championships</p>
        <img src = "../img/events/dmvchamps.png" alt="DMV Champs" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>Saturday, July 2nd 2022</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Awards/Sanctioning</span>
        <ul className='event-block-details'>
          <li>Medals will be awarded in all divisions, 1st through 3rd places</li>
          <li>Special Limited-Edition Medals Awarded to the #1 High School Male and Female Competitors from the DMV (DC, MD, VA) region</li>
          <li>USATF Sanctioned</li>
          <li>Results/Performance marks will be published at <a href = "https://www.worldathletics.org">WorldAthletics.org</a> (elite division only), <a href = "https://www.milesplit.com">Milesplit.com</a> and <a href="https://dcvault.com/events">DCVault.com/events</a>.</li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>$5,000 in Prize Money</span> (Elite Division)</span>
        <ul className='event-block-details'>
          <li>Elite Men (4.9m/16' entry standard - must be verified)</li>
          <ul>
            <li>Award $ w/clearance of 5.5m (18') or more as follows:</li>
            <ul>
              <li>1st place = $1,250</li>
              <li>2nd place = $750</li>
              <li>3rd place = $500</li>
            </ul>
          </ul>
          <li>Elite Women (3.97m/13' entry standard - must be verified)</li>
          <ul>
            <li>Award $ w/clearance of 4.40m (14'5") or more as follows…</li>
            <ul>
              <li>1st place = $1,250</li>
              <li>2nd place = $750</li>
              <li>3rd place = $500</li>
            </ul>
          </ul>
          <li><i><u>NOTE:</u> Collegiate/High School athletes 'wishing to' maintain NCAA eligibility may not be awarded $ in accordance with NCAA requirements and will forfeit prize money.</i></li>
          <li>ELITE ENTRIES: Contact <span className='red-text'>Events@DCVault.org</span></li>
        </ul>
        <span className='event-block-details-header'><span className='red-text'>Elite Entries</span> (as of 6/21/2022)</span>
        <span className='event-block-details-header'><br></br>MEN</span>
        <ul className='event-block-details'>
          <li>Nate Richartz  - 5.75m (<span className='red-text'>18' 10.25"</span>)</li>
          <ul>
            <li>RISEN Performance / Tracksmith</li>
            <li>Olympic Trials Qualifier</li>
            <li><a href = "https://instagram.com/nate_richartz">instagram.com/nate_richartz</a></li>
            <li>Arizona</li>
          </ul>
          <li>Tray Oates - 5.74m (<span className='red-text'>18' 9.9"</span>)</li>
          <ul>
            <li>Arizona Pole Vault Academy / Midwest Meats</li>
            <li>Olympic Trials 4th Place / USA National Championships 4th Place / 5 time All-American</li>
            <li><a href = "https://instagram.com/olen_iii_oates">instagram.com/olen_iii_oates</a></li>
            <li>Arizona</li>
          </ul>
          <li>Austin Miller - 5.73m (<span className='red-text'>18' 9.5"</span>)</li>
          <ul>
            <li>Vault House / Tean Pacer</li>
            <li>Olympic Trials Finalist / DMV Native!</li>
            <li><a href = "https://instagram.com/a_milli29">instagram.com/a_milli29</a></li>
            <li>North Carolina</li>
          </ul>
          <li>Zach Ferrara - 5.45m (<span className='red-text'>17' 10.5"</span>)</li>
          <ul>
            <li>Talons Up Vault Club</li>
            <li>NCAA Division III National Champion / 3 time All-American / USATF Indoor Championships Qualifier</li>
            <li><a href = "https://instagram.com/Fly1n4marshmallow">instagram.com/Fly1n4marshmallow</a></li>
            <li>New York</li>
          </ul>
          <li>Matthew Keim 5.34m (<span className='red-text'>17' 6.25"</span>)</li>
          <ul>
            <li>Industrial Vault Club</li>
            <li>2x NCAA All American</li>
            <li><a href = "https://instagram.com/matt_keim_pv">instagram.com/matt_keim_pv</a></li>
            <li>Ohio</li>
          </ul>
          <li>Christian Di Nicolantonio 4.91m (<span className='red-text'>16' 1.25"</span>)</li>
          <ul>
            <li>DC Vault / Catholic University of America</li>
            <li>NCAA National Championships Qualifier / CUA Record Holder</li>
            <li><a href = "https://instagram.com/c.dinic">instagram.com/c.dinic</a></li>
            <li>District of Columbia</li>
          </ul>
          <li>Brandon Shin - 4.9m (<span className='red-text'>16' 0.75"</span>)</li>
          <ul>
            <li>DC Vault / The University of Chicago</li>
            <li>NCAA National Championships Qualifier</li>
            <li><a href = "https://instagram.com/brndnshn">instagram.com/brndnshn</a></li>
            <li>Ohio</li>
          </ul>
        </ul>
        <span className='event-block-details-header'><br></br>WOMEN</span>
        <ul className='event-block-details'>
          <li>Kristen Brown 4.70m (<span className='red-text'>15' 5"</span>)</li>
          <ul>
            <li>Two time Olympic trials finalist and has been ranked top 10 in the world!</li>
            <li><a href = "https://instagram.com/kayybeebby">instagram.com/kayybeebby</a></li>
            <li>Atlanta, GA</li>
          </ul>
          <li>Kortney Oates - 4.63m (<span className='red-text'>15' 2.2"</span>)</li>
          <ul>
            <li>Risen Performance / Team Pacer</li>
            <li>7x USA nationals Qualifier</li>
            <li><a href = "https://instagram.com/kortneyoates">instagram.com/kortneyoates</a></li>
            <li>Arizona</li>
          </ul>
        </ul>
        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>The 2022 Pole Vault Championships are open to all athletes ages 7 and up</li>
          <li>Advanced Registration Only</li>
          <li>Registration Closes June 28th</li>
          <li>$35 for competitors - <span className='red-text'>Registration Closed</span></li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches may also watch from outside the fence free of charge</li>
        </ul>
        <span className='event-block-details-header'>Venue</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <ul>
            <li>2200 East Capitol street NE Washington DC </li>
          </ul>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>
        </ul>
        <span className='event-block-details-header'>Final Schedule</span>
        <ul className='event-block-details'>
          <li>Note: <span className='red-text'>Rolling Schedule</span> - arrive early in case your time slot moves up!</li>
          <li>15cm progressions</li>
          <li><a style={{color: '#C0282D'}} href='../files/pvchampsSL.docx' target='_blank'>See Start List here!</a> </li>
          <li>Flight Times:</li>
          <ul>
            <li>08:30am (staff arrive)</li>
            <li><span className = 'red-text'>09:45am (gates open)</span></li>
            <li>10:00am (warmups)</li>
              <ul>
                <li>6&#39;-11&#39;6&quot; Combined (red pit)</li>
                <li>11’7”-15’11” Men (black pit)</li>
              </ul>
            <li>11:00 am (competition)</li>
              <ul>
                <li><span className = 'red-text'>6&#39;-11&#39;6&quot; Combined (1.85m start)</span></li>
                <li><span className = 'red-text'>11’7”-15’11” Men (3.40m start)</span></li>
              </ul>
            <li>1:00pm (warmups)</li>
            <ul>
              <li>Fly-Kids (red pit)</li>
              <li>12’+ Elite Women (black pit)</li>
            </ul>
            <li><span className = 'red-text'>2:00pm (competition)</span></li>
            <ul>
              <li><span className = 'red-text'>Fly-Kids (1.25m start)</span></li>
              <li><span className = 'red-text'>12’+ Elite Women (3.40m start)</span></li>
            </ul>
            <li>4:00pm (warmups)</li>
            <ul>
              <li>Elite Men (black pit)</li>
            </ul>
            <li><span className = 'red-text'>5:00pm (competition)</span></li>
            <ul>
              <li><span className = 'red-text'>16’+ Elite Men (4.6m opening height)</span></li>
            </ul>
          </ul>
        </ul>
        <span className='event-block-details-header'>Start List/Results</span>
        <ul className='event-block-details'>
          <li>Download Start List <span class="red-text">Here!</span> (available June 30th )</li>
          <li>Download Final Results <span class="red-text">Here!</span></li>
        </ul>
        <span className='event-block-details-header'>Pole Storage</span>
        <ul className='event-block-details'>
          <li>Overnight pole storage can be arranged. For drop-off and pick-up, email <span className='red-text'>Events@dcvault.org</span></li>
        </ul>
        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li>10'8" - 15'1" UCS Spirit Poles Available for Rent</li>
          <li>$25 cash at check-in</li>
          <li>You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li>
        </ul>
        <span className='event-block-details-header'>Spikes</span>
        <ul className='event-block-details'>
          <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>
          <ul>
            <li>ELITE DIVISION athletes may wear 1/4" spikes</li>
          </ul>
          <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>
          <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
          <ul>
            <li>Recommended so you don't waste time at the event trying to change spikes!</li>
          </ul>
          <li>Available for $5 per set at the event (bring your own spike wrench)</li>
          
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
        <span className='event-block-details-header'>General Info</span>
        <ul className='event-block-details'>
          <li>For additional information, email <span className='red-text'>Events@dcvault.org</span></li>
        </ul>

      </div>)
      },
      {
        date: new Date('April 24, 2022'),
        partial: (<div className='event-block' id='24APR2022'>
            <p className='event-block-title'><span className='red-text'>FREE</span> POLE VAULT <span className='red-text'>CLINIC</span> at Georgetown Prep</p>
            <img src = "../img/events/PREP.jpg" alt="prep" width = '350' class = "center"></img>

            <p className='event-block-info'>
              <span className='event-block-date'>April 24, 2022</span>
              <br></br>
              <span className='event-block-date'>10900 Rockville Pike - North Bethesda, MD</span></p>

            <span className='event-block-details-header'>Event Info</span>
            <ul className='event-block-details'>
                <li>Hosted by <span className='red-text'>DC Vault</span></li>
                <li>Limited Space: Open to <b>Montgomery County Students only</b> until April 17th. Beginning April 18th ,additional applicants will be accepted if space is available.</li>
                <li>Ages: 8-17</li>
                <li>Equipment: Poles and Equipment provided</li>
                <li>Facility: Georgetown Prep Outdoor Track</li>
                <li>Schedule: 5:00pm – warmups / 5:30pm – drills / 6:00pm – groundwork / 7:00pm – jumps</li>
                <li>Register:Email DCVault@DCVault.org</li>
            </ul>

        </div>)
        },
        {
          date: new Date('December 30, 2050'),
          partial: (<div className='event-block' id='30DEC2050'>
              <p className='event-block-title'><span className='red-text'>FREE</span> POLE VAULT <span className='red-text'>CLINIC</span></p>
              <img src = "../img/events/freeclinic.jpg" alt="clinic" width = '350' class = "center"></img>
  
              <p className='event-block-info'>
                <span className='event-block-date'>Recurring</span>
                <br></br>
                <span className='event-block-date'>2200 East Capitol Street NE - Washington, DC</span></p>
  
              <span className='event-block-details-header'>Event Info</span>
              <ul className='event-block-details'>
                  <li>Did you receive a DC Vault FREE POLE VAULT CLINIC invitation card? If so, you're entitled to a Free Drop-In session during a regularly scheduled DC Vault class!</li>
                  <li>Just <a onclick="document.getElementById('contact-button').click()">contact us</a> to confirm your drop-in class date and to receive your special discount code. Then use your personal code to register at the <a href="/register">DC Vault course sign up page</a> for your free Drop In class!</li>
                  <li>Be sure to bring your invitation card with you to your Drop In class (REQUIRED for participation).</li>
                  <li>Note: Invitation cards are only given out in person, at special events, as special awards, or for individual recognition. If you receive one, don't lose it! </li>
              </ul>
  
          </div>)
          },
        {
          date: new Date('April 15, 2022'),
          partial: (<div className='event-block' id='15APR2022'>
              <p className='event-block-title'><span className='red-text'>FLY-KIDS</span> at <span className='red-text'>Eastern Market</span></p>
              <img src = "../img/events/flykids_em.jpeg" alt="fly" width = '350' class = "center"></img>
  
              <p className='event-block-info'>
                <span className='event-block-date'>Friday, April 15, 2022</span>
                <br></br>
                <span className='event-block-date'>Eastern Market - Corner of 7th and C St SE</span></p>
  
              <span className='event-block-details-header'>Event Info</span>
              <ul className='event-block-details'>
                  <li>Four 30-minute FLY-KIDS intro classes</li>
                  <li>Limited to 6 participants per class</li>
                  <li>Beginners welcome!</li>
                  <li>Ages 6-9</li>
                  <li>Kids will be shown very basic fundamentals of pole vaulting</li>
                  <li>Participants will have the chance to go over a (soft) bar into the FLY-KIDS landing mat</li>
                  <li>Location - corner of 7th and C St. SE in Washington, DC</li>
                  <li>Check-in 10 minutes prior to your group start time.</li>
                  <li>Must arrive on time to participate!</li>
                  <li>New Member Discounts provided at the event!</li>
              </ul>

              <span className='event-block-details-header'>Schedule</span>
              <ul className='event-block-details'>
                  <li>5:00pm - 5:30pm - Group 1</li>
                  <li>5:30pm - 6:00pm - Group 2</li>
                  <li>6:00pm - 6:30pm DC Vault FLY-KIDS Exhibition</li>
                  <li>6:30pm - 7:00pm- Group 3</li>
                  <li>7:00pm - 7:30pm - Group 4</li>
              </ul>

              <span className='event-block-details-header'>Registration</span>
              <ul className='event-block-details'>
                  <li>Free to Participate!</li>
                  <li>Pre-registration required</li>
                  <li>To register, click here: <a href="https://www.signupgenius.com/go/10C054DADAC2EA4F49-flykids">https://www.signupgenius.com/go/10C054DADAC2EA4F49-flykids</a></li>
              </ul>
  
          </div>)
          },
      {
        date: new Date('October 30, 2021'),
        partial: (<div className='event-block' id='30OCT2021'>
        <p className='event-block-title'>Halloween<span className='red-text'> Vault</span> 2021</p>
        <img src = "../img/logos/halloweenvault21.jpg" alt="Street Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>October 30th, 2021</span>
          <br></br>
          <span className='event-block-date'>DC Vault - 2200 East Capitol street NE, Washington DC </span>
        </p>
        <p className='event-block-info'>
        <span className='event-block-details-header'>Event Features</span>
        <ul className='event-block-details'>
          <li>Haunted Vault Site (featuring our favorite 13' skeleton Sergio!)</li>
          <li>Costumed Vaulters</li>
          <li>Pet costume competition (bring you spooky puppy dogs!)</li>
          <li>Free Candy for kids and competitors</li>
          <li>Free grilled hot-dogs and veggie dogs</li>
          <li>Spooky FLY-KIDS competition (ages 6-10)</li>
          <li>Medals awarded for 1st-3rd place finishes in Fly-Kids + all competitor flights</li>
        </ul>
        </p>        
        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only</li>
          <li>Registration Closed</li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches are able to watch from outside the fence free of charge if they prefer</li>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
                full: (<div className='event-block' id='30OCT2021'>
                <p className='event-block-title'>Halloween<span className='red-text'> Vault</span> 2021</p>
                <img src = "../img/logos/halloweenvault21.jpg" alt="Street Vault" width = '350' class = "center"></img>
                <p className='event-block-info'>
                  <span className='event-block-date'>October 30th, 2021</span>
                  <br></br>
                  <span className='event-block-date'>DC Vault - 2200 East Capitol street NE, Washington DC </span>
                </p>
                <p className='event-block-info'>
                <span className='event-block-details-header'>Event Features</span>
                <ul className='event-block-details'>
                  <li>Haunted Vault Site (featuring our favorite 13' skeleton Sergio!)</li>
                  <li>Costumed Vaulters</li>
                  <li>Pet costume competition (bring you spooky puppy dogs!)</li>
                  <li>Free Candy for kids and competitors</li>
                  <li>Free grilled hot-dogs and veggie dogs</li>
                  <li>Spooky FLY-KIDS competition (ages 6-10)</li>
                  <li>Medals awarded for 1st-3rd place finishes in Fly-Kids + all competitor flights</li>
                </ul>
                </p>        
                
                <span className='event-block-details-header'>Registration</span>
                <ul className='event-block-details'>
                  <li>Advanced Registration Only</li>
                  <li>Registration Closed</li>
                </ul>
                <span className='event-block-details-header'>Entry Fee</span>
                <ul className='event-block-details'>
                  <li>$35 for competitors</li>
                  <li>$5 for all non-competitors entering the facility (cash)</li>
                  <li>Spectators and coaches are able to watch from outside the fence free of charge if they prefer</li>
                </ul>
                <span className='event-block-details-header'>Facility</span>
                <ul className='event-block-details'>
                  <li>DC Vault Pole Vault Center</li>
                  <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
                  <li>Parking On-Site (Lot #3)</li>
                  <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>
                  <li>Address:
                      <ul>
                        <li>2200 East Capitol street NE Washington DC</li>
                        <li>Do not enter "North" Capitol or "NW" into your GPS!</li>
                        <li>Manually enter the address above or "DC Vault"</li>
                      </ul>
                  </li>
                </ul>
                <span className='event-block-details-header'>SPIKES</span>
                <ul className='event-block-details'>
                  <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>
                  <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>
                  <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
                  <ul>
                    <li>Recommended so you don’t waste time at the event trying to change spikes!</li>
                  </ul>
                  <li>Available for $5 per set at the event (bring your own spike wrench)</li>
                </ul>
                <span className='event-block-details-header'>Pole Rentals</span>
                <ul className='event-block-details'>
                  <li>$15 cash at check-in</li>
                  <li>NOTE: You may be sharing your rental pole</li>
                  <li>ID will be held until pole is returned</li>
                </ul>
                <span className='event-block-details-header'>Schedule (tentative - final schedule will be emailed to competitors the week of the event)</span>
                <ul className='event-block-details'>
                  <li>5:00pm Gates Open</li>
                  <li>5:00-5:30pm Warmups - Fly Kids (Red Pit)</li>
                  <li>5:30-6:00pm Competition - Fly Kids (Red Pit)</li>
                  <li>6:00-7:00pm Warmups - Flight 1 (Red Pit)</li>
                  <li>6:00-7:00pm Warmups - Flight 2 (Black Pit)</li>
                  <li>7:00-10:00pm Competition - Flight 1 (Red Pit)</li>
                  <li>7:00-10:00pm Competition - Flight 2 (Black Pit)</li>
                </ul>
                <center><span className='red-text'>Click Arrow for More Info</span></center>
                </div>)
                
      },
      {
        date: new Date('July 16, 2021'),
        partial:(
        <div className='event-block' id='16JUL2021'>
        <p className='event-block-title'>National<span className='red-text'>Street Vault</span> 2021</p>
        <img src = "../img/logos/streetvault21.jpg" alt="Street Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>July 16th-17th 2021</span>
          <br></br>
          <span className='event-block-date'>Eastern Market, 777 C Street SE - Washington DC</span>
        </p>
        <p className='event-block-info'>
        <span className='event-block-details-header'>Results</span>
        <ul className='event-block-details'>
          <li><a href = "https://photos.app.goo.gl/ogE3Yd7GupM62mw96">Street Vault Photos Found Here!</a></li>
          <li><a style={{color: '#C0282D'}} href='../files/2021streetvaultresults.xlsx' target='_blank'>Download Final Results Here!</a> </li>
        </ul>
        </p>        
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Advanced Registration Only</li>
          <li>Registration Closed</li>
        </ul>
        </div>
                ),
                full: (<div className='event-block' id='26JUN2021'>
        <p className='event-block-title'>National<span className='red-text'>Street Vault</span> 2021</p>
        <img src = "../img/logos/streetvault21.jpg" alt="Street Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>July 16th-17th 2021</span>
          <br></br>
          <span className='event-block-date'>Eastern Market, 777 C Street SE - Washington DC</span>
        </p>
        <p className='event-block-info'>
        <span className='event-block-details-header'>Results</span>
        <ul className='event-block-details'>
          <li><a href = "https://photos.app.goo.gl/ogE3Yd7GupM62mw96">Street Vault Photos Found Here!</a></li>
          <li><a style={{color: '#C0282D'}} href='../files/2021streetvaultresults.xlsx' target='_blank'>Download Final Results Here!</a> </li>
        </ul>
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
        <img src = "../img/logos/moon-2021.png" alt="Moon Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>August 14th 2021</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Event Features</span>
        <ul className='event-block-details'>
          <li>Glowing-Vaulters in Body-Glow paint</li>
          <li>Free glowing party favors for kids</li>
          <li>Glow-bling for spectators</li>
          <li>Free grilled hot-dogs and veggie dogs</li>
          <li>Prizes for best glow-costume</li>
          <li>Best Glow-Pet costume competition (bring your puppy dogs!)</li>
          <li>Glowing FLY-KIDS competition (ages 6-10)</li>
          <li>Medals awarded for 1st-3rd place finishes in Fly-Kids + all competitor flights</li>
        </ul>     
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Registration closed</li>
          <li><a style={{color: '#C0282D'}} href='../files/moon_start.pdf' target='_blank'>Download Heat Sheets Here!</a> </li>
          <li><a style={{color: '#C0282D'}} href='../files/moonvaultresults-21.xlsx' target='_blank'>Download Final Results Here!</a> </li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches can watch from outside the fence free of charge if they prefer</li>
        </ul>
        <center><span className='red-text'>Click Arrow for More Info</span></center>
        </div>),
        full: (<div className='event-block' id='14AUG2021'>
        <p className='event-block-title'>Moon<span className='red-text'>Vault</span></p>
        <img src = "../img/logos/moon-2021.png" alt="Moon Vault" width = '350' class = "center"></img>
        <p className='event-block-info'>
          <span className='event-block-date'>August 14th 2021</span>
          <br></br>
          <span className='event-block-date'>2200 East Capitol street NE, Washington DC</span>
        </p>
        <span className='event-block-details-header'>Event Features</span>
        <ul className='event-block-details'>
          <li>Glowing-Vaulters in Body-Glow paint</li>
          <li>Free glowing party favors for kids</li>
          <li>Glow-bling for spectators</li>
          <li>Free grilled hot-dogs and veggie dogs</li>
          <li>Prizes for best glow-costume</li>
          <li>Best Glow-Pet costume competition (bring your puppy dogs!)</li>
          <li>Glowing FLY-KIDS competition (ages 6-10)</li>
          <li>Medals awarded for 1st-3rd place finishes in Fly-Kids + all competitor flights</li>
        </ul>     
        <span className='event-block-details-header'>Registration</span>
        <ul className='event-block-details'>
          <li>Registration closed</li>
          <li><a style={{color: '#C0282D'}} href='../files/moon_start.pdf' target='_blank'>Download Heat Sheets Here!</a> </li>
          <li><a style={{color: '#C0282D'}} href='../files/moonvaultresults-21.xlsx' target='_blank'>Download Final Results Here!</a> </li>
        </ul>
        <span className='event-block-details-header'>Entry Fee</span>
        <ul className='event-block-details'>
          <li>$35 for competitors</li>
          <li>$5 for all non-competitors entering the facility (cash)</li>
          <li>Spectators and coaches can watch from outside the fence free of charge if they prefer</li>
        </ul>
        <span className='event-block-details-header'>Facility</span>
        <ul className='event-block-details'>
          <li>DC Vault Pole Vault Center</li>
          <li>3 Mondo Runways, UCS 1800, 1900 and Elite 2100 series pits</li>
          <li>Parking On-Site (Lot #3)</li>
          <li><u>Athletes enter the facility from the E. Capitol street sidewalk gate</u></li>
          <li>Address:
              <ul>
                <li>2200 East Capitol street NE Washington DC</li>
                <li>Do not enter "North" Capitol or "NW" into your GPS!</li>
                <li>Manually enter the address above or "DC Vault"</li>
              </ul>
          </li>
        </ul>
        <span className='event-block-details-header'>SPIKES</span>
        <ul className='event-block-details'>
          <li><b>1/8" spikes ONLY at this facility (not standard 1/4" spikes!)</b></li>
          <li>Athletes using spikes longer than 1/8" will be disqualified/scratched from the competition without refund</li>
          <li>1/8” spikes can be purchased online at <a href="https://amazon.com">Amazon.com</a></li>
          <ul>
            <li>Recommended so you don’t waste time at the event trying to change spikes!</li>
          </ul>
          <li>Available for $5 per set at the event (bring your own spike wrench)</li>
        </ul>
        <span className='event-block-details-header'>Pole Drop-off/Pick-up</span>
        <ul className='event-block-details'>
          <li>If you need to store poles overnight, arrangements can be made for drop-off and pick-up</li>
          <li>Arrangements must be made 24 HOURS PRIOR TO THE EVENT or more</li>
        </ul>
        <span className='event-block-details-header'>Pole Rentals</span>
        <ul className='event-block-details'>
          <li>$15 cash at check-in</li>
          <li>You may be sharing your rental pole</li>
          <li>ID will be held until pole is returned</li>
        </ul>
        
        <span className='event-block-details-header'>Schedule</span>
        <ul className='event-block-details'>
          <li>7:45pm Gates Open</li>
          <li>7:45-8:00pm Warmups - Fly Kids (Red Pit)</li>
          <li>8:00-8:15pm Competition - Fly Kids (Red Pit / Opening Height 4'1")</li>
          <li>8:15-9:00pm Warmups - Flight 1 (Red Pit)</li>
          <li>8:15-9:00pm Warmups - Flight 2 (Black Pit)</li>
          <li>9:00-11:00pm Competition - Flight 1 (Red Pit / Opening Height 5')</li>
          <li>9:00-11:00pm Competition - Flight 2 (Black Pit / Opening Height 6'6")</li>
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
        <span className='event-block-details-header'>Spikes</span>
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
