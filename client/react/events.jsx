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
        date: new Date('June 8, 2018'),
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
       b.date - a.date
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
