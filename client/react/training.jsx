import React from 'react';
import {render} from 'react-dom';
import ReactTooltip from 'react-tooltip';

class Training extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      descriptions: {
        beginner: 'Beginner, Level I athletes focus on developing primary phases of the vault. Class is held on weekends and includes static and dynamic stretching, biomechanically focused warm-up, primary phase drills and vaulting and equipment setup/takedown.',
        intermediate: 'Intermediate, Level II athletes focus on mastering primary phases of the vault and basic introduction of secondary phases of the vault; Class is held on weekends. Classes include static and dynamic stretching, biomechanically focused warm-up, primary and secondary phase drills and vaulting, introductory speed and strength conditioning and equipment setup/takedown.',
        emerging: 'Emerging Elite, Level III athletes focus on mastering secondary phases of the vault. Class is held on weekends and at multiple times during the week. Athletes participate in a 6-month comprehensive training program designed to produce maximum level of performance during the competitive season. Classes include static and dynamic stretching, biomechanically focused warm-up, secondary phase drills and vaulting, extensive speed and strength conditioning and equipment setup/take-down.',
        elite: 'Elite, Level IV athletes focus on high level refinement of secondary phases of the vault, as well as mastering tertiary phases of the vault. Athletes participate in a 9-month comprehensive training program designed to produce two seasonal peaks in performance (indoor and outdoor championships) and to transition athletes to professional level training.',
        professional: 'Professional, Level V athletes work in private session on a personalized, comprehensive, year-round training program. Technical focus is on mastering tertiary phases of the vault, with strong emphasis placed on high level refinement of energy transitions. Speed and strength development is customized for the individual athlete to produce peak performance during championship competitions. It incorporates recovery phases and non-traditional range of motion and biomechanical movements for stabilization, technical consistency and injury prevention.',
        youthAdult: 'Youth Classes (ages 8-14) and Adult Classes (ages 21+)</br>\
          $350 - Summer 1 / $350 - Summer 2 / $600 - Both Summer Sessions</br>\
          Classes are offered during two periods during the summer quarter for Beginner and Intermediate students.</br>\
          Classes are held twice a week in the evenings for a 4 week period (see schedule) and cover all primary phases of the vault, to include pole carry and approach, plant and takeoff, swing, turn.',
        discounts: 'DC Vault offers a variety of discounts to needy athletes, local residents and service members, such as... </br>\
          </br>\
          10% - DC Residents </br>\
          10% - Active Duty Military </br>\
          10% - Full Time College Student </br>\
          25% - DCPS Students </br>\
          25% - Family Discount </br>\
          </br>\
          Does not apply to equipment retnal, special training sessions, or events</br>',
          poleRental: 'Note: Poles are provided free of charge for use during DC Vault training sessions.</br>\
            Our pole rental program allows athletes to check out one pole at a time for non-club activities. Due to the fact that a typical athlete will progress through 4-8 poles through a season, it can be costly for an athlete to purchase their own poles (which range from $375 to nearly $1000). Poles will be issued on a first-come, first-serve basis. All else being equal, the most senior athlete will have priority.',
          events: 'DC Vault will be holding various events throughout the year. Please click "See More" to view some of the upcoming events!'
      },
      showDescription: false,
      currentDescription: ''
    };
  }

  componentDidMount() {

  }

  render() { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div className="container">
        <p className="section-header">Training <span className="red-text">Options</span></p>
        <div className="row">
          <div className="col-xs-6 col-md-2 option-card">
            <p className="option-title">BEGINNER</p>
            <p className="option-info">All Ages</p>
            <div className="option-price-container">
              <p className="option-price">$550</p>
              <p className="option-price-modifier">PER QUARTER</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.beginner+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-md-2 option-card">
            <p className="option-title">INTERMEDIATE</p>
            <p className="option-info">All Ages</p>
            <div className="option-price-container">
              <p className="option-price">$550</p>
              <p className="option-price-modifier">PER QUARTER</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.intermediate+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-md-2 option-card">
            <p className="option-title">EMERGING ELITE</p>
            <p className="option-info"></p>
            <div className="option-price-container">
              <p className="option-price">N/A</p>
              <p className="option-price-modifier">INVITE ONLY</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.emerging+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-md-2 option-card">
            <p className="option-title">ELITE</p>
            <p className="option-info"></p>
            <div className="option-price-container">
              <p className="option-price">N/A</p>
              <p className="option-price-modifier">INVITE ONLY</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.elite+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-md-2 option-card">
            <p className="option-title">PROFESSIONAL</p>
            <p className="option-info"></p>
            <div className="option-price-container">
              <p className="option-price">N/A</p>
              <p className="option-price-modifier">INVITE ONLY</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.professional+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-md-2 option-card">
            <p className="option-title">YOUTH/ADULT</p>
            <p className="option-info">Summer Only</p>
            <div className="option-price-container">
              <p className="option-price">$350</p>
              <p className="option-price-modifier">PER ATHLETE</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.youthAdult+'</div>'}>Details</a>
          </div>
        </div>
        <div className="row" style={{marginTop: '20px'}}>
          <div className="red-button" onClick={() => {window.location.href='/register'}}>
            <span className="button-text">SIGN UP</span>
          </div>
        </div>

        <p className="subsection-header" style={{marginTop: '75px', marginBottom: '15px'}}><span className="red-text">Other</span> Options</p>
        <div className="row">

          <div className="col-xs-6 col-md-2 col-md-push-3 option-card">
            <p className="option-title">SPECIAL EVENTS</p>
            <p className="option-info"></p>
            <div className="option-price-container" onClick={() => {window.location.href="#events"}}>
              <p className="option-price">VARIES</p>
              <p className="option-price-modifier">CLICK FOR MORE</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.events+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-md-2 col-md-push-3 option-card">
            <p className="option-title">DISCOUNTS</p>
            <p className="option-info"></p>
            <div className="option-price-container">
              <p className="option-price">VARIES</p>
              <p className="option-price-modifier">PER ATHLETE</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.discounts+'</div>'}>Details</a>
          </div>

          <div className="col-xs-6 col-xs-push-3 col-md-2 col-md-push-3 option-card">
            <p className="option-title">POLE RENTAL</p>
            <p className="option-info">Registered Athletes Only</p>
            <div className="option-price-container">
              <p className="option-price">$150</p>
              <p className="option-price-modifier">PER QUARTER</p>
            </div>
            <a className="learn-more" data-tip={'<div style="max-width: 250px">'+this.state.descriptions.poleRental+'</div>'}>Details</a>
          </div>

        </div>
        <ReactTooltip html={true}/>
      </div>
    );
  }
}

class DescriptionModal extends React.Component {
  constructor(props) {
    super(props);
  }


}

export default Training;