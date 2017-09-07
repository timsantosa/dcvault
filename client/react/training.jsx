import React from 'react';
import {render} from 'react-dom';
import ReactTooltip from 'react-tooltip';

class Training extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      descriptions: {

        beginner: '3-month course</br>\
          ​Ages: All Ages</br>\
          Location Options: DCV, BALT, PREP, PA​</br>\
          Beginner, Level I athletes focus on developing primary phases of the vault. Class is held on weekends and includes static and dynamic stretching, biomechanically focused warm-up, primary phase drills and vaulting and equipment setup/takedown.',

        intermediate: '3-month course</br>\
          ​​Ages​: All Ages</br>\
          ​Location Options: ​DCV, BALT, PREP​, ​PA</br>\
          Intermediate, Level II athletes focus on mastering primary phases of the vault and basic introduction of secondary phases of the vault; Class is held on weekends and includes static and dynamic stretching, biomechanically focused warm-up, primary and secondary phase drills and vaulting, introductory speed and strength conditioning and equipment setup/takedown.',

        emerging: '6-month course​</br>\
          Ages: An invitation only group​</br>\
          ​Locations: CUA, DCV​</br>\
          Emerging Elite, Level III athletes focus on mastering secondary phases of the vault. Class is held on weekends and at multiple times during the week. Athletes participate in a 6-month comprehensive training program designed to produce maximum level of performance during the competitive season. Classes include static and dynamic stretching, biomechanically focused warm-up, secondary phase drills and vaulting, extensive speed and strength conditioning and equipment setup/take-down.',

        elite: '9-month course​</br>\
          Ages: An invitation only group​</br>\
          ​Locations: CUA, DCV​</br>\
          Elite, Level IV athletes focus on high level refinement of secondary phases of the vault, as well as mastering tertiary phases of the vault. Athletes participate in a 9-month comprehensive training program designed to produce two seasonal peaks in performance (indoor and outdoor championships) and to transition athletes to professional level training.',

        professional: 'Year-round course​</br>\
          Ages: An invitation only group​</br>\
          ​Locations: CUA, DCV​, PG, NCS</br>\
          Professional, Level V athletes work in private session on a personalized, comprehensive, year-round training program. Technical focus is on mastering tertiary phases of the vault, with strong emphasis placed on high level refinement of energy transitions. Speed and strength development is customized for the individual athlete to produce peak performance during championship competitions. It incorporates recovery phases and non-traditional range of motion and biomechanical movements for stabilization, technical consistency and injury prevention.',

        youthAdult: '6-week course</br>\
          ​Ages: ​Youth Classes (14 and under)</br>\
          ​Ages: ​Adult Classes (21+)</br>\
          ​Locations: DCV​</br>\
          Cl​​as​s​es specifically ​designed​ ​for​ beginner and intermediate youth and adults are offered at our DC Vault site​. Classes cover all primary phases of the vault, to include pole carry​/​approach, plant​/​takeoff, swing​/​turn.​',

        discounts: 'DC Vault offers a variety of discounts to needy athletes, local residents and service members, such as... </br>\
          </br>\
          10% - DC Residents </br>\
          10% - Active Duty Military </br>\
          10% - Full Time College Student </br>\
          25% - DCPS Students </br>\
          25% - Family Discount </br>\
          </br>\
          Does not apply to equipment rental, special training sessions, or events</br>\
          Please contact us (dcvault@dcvault.org) to apply for a discount',
          poleRental: 'Note: Poles are provided free of charge for use during DC Vault training sessions.</br>\
            Our pole rental program allows athletes to check out one pole at a time for non-club activities. Due to the fact that a typical athlete will progress through 4-8 poles through a season, it can be costly for an athlete to purchase their own poles (which range from $375 to nearly $1000). Poles will be issued on a first-come, first-serve basis. All else being equal, the most senior athlete will have priority.',
          events: 'DC Vault will be holding various events throughout the year. Please click "More Info" to view some of the upcoming events!'
      },
      showDescription: false,
      currentDescription: ''
    };
  }

  componentDidMount() {

  }

  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div id="training-container" className="container">
        <p className="section-header">Training <span className="red-text">Options</span></p>
        <div className="row" style={{width: '100%', margin: '0'}}>
          <div className="col-xs-12 col-md-4 option-card dark">
            <p className="option-title">BEGINNER</p>
            <p className="option-info">All Ages</p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">$550</p>
                <p className="option-price-modifier">PER QUARTER</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.beginner+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card">
            <p className="option-title">INTERMEDIATE</p>
            <p className="option-info">All Ages</p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">$550</p>
                <p className="option-price-modifier">PER QUARTER</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.intermediate+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card dark">
            <p className="option-title">YOUTH/ADULT</p>
            <p className="option-info">SIGNUP NOW</p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">$350</p>
                <p className="option-price-modifier">PER COURSE</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.youthAdult+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card">
            <p className="option-title">EMERGING ELITE</p>
            <p className="option-info"></p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">N/A</p>
                <p className="option-price-modifier">INVITE ONLY</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.emerging+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card dark">
            <p className="option-title">ELITE</p>
            <p className="option-info"></p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">N/A</p>
                <p className="option-price-modifier">INVITE ONLY</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.elite+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card">
            <p className="option-title">PROFESSIONAL</p>
            <p className="option-info"></p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">N/A</p>
                <p className="option-price-modifier">INVITE ONLY</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.professional+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card dark">
            <p className="option-title">SPECIAL EVENTS</p>
            <p className="option-info"></p>
            <div className="option-price-container-1">
              <div className="option-price-container-2" onClick={() => {window.location.href="#events"}}>
                <p className="option-price">VARIES</p>
                <p className="option-price-modifier">MORE INFO</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.events+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card">
            <p className="option-title">POLE RENTAL</p>
            <p className="option-info">Registered Athletes Only</p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">$150</p>
                <p className="option-price-modifier">PER QUARTER</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.poleRental+'</div>'}>Details</a>
          </div>

          <div className="col-xs-12 col-md-4 option-card dark">
            <p className="option-title">DISCOUNTS</p>
            <p className="option-info">Upon Request</p>
            <div className="option-price-container-1">
              <div className="option-price-container-2">
                <p className="option-price">VARIES</p>
                <p className="option-price-modifier">PER ATHLETE</p>
              </div>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.discounts+'</div>'}>Details</a>
          </div>
        </div>

        <div className="red-button" onClick={() => {window.location.href='/register'}} style={{marginTop: '30px'}}>
          <span className="button-text">Sign Up</span>
        </div>
        <div className='center-content' style={{marginTop: '15px'}}>
          <p className="info-text" style={{textAlign: 'center'}}>To apply for a discount code or training group invitation, please <a className="red-text" onClick={() => {document.getElementById('contact-button').click()}}>contact us</a></p>
        </div>


        <ReactTooltip html={true}/>
      </div>
    );
  }
}

/*
*/

class DescriptionModal extends React.Component {
  constructor(props) {
    super(props);
  }


}

export default Training;