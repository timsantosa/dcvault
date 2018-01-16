import React from 'react'
import ReactTooltip from 'react-tooltip'

class Training extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      trainingCards: [
        {
          title: 'Youth/Adult',
          ages: 'Youth: 13 and under, Adult: 21+',
          price: '$175',
          priceModifier: 'PER COURSE',
          location: 'DCV',
          duration: '4-week course',
          dates: 'Spring, Summer, and Fall',
          description: 'A 4 week program specifically designed for youth or adult athletes is offered at our DC Vault site in Spring, Summer and Fall. Classes cover Primary Phases of the vault and are suitable for beginner through intermediate youth, or beginner to advanced adults. Class is held on weekdays or weekends depending on the training program. Check our schedule for upcoming courses.'
        },
        {
          title: 'Beginner',
          ages: 'All Ages',
          price: '$550',
          priceModifier: 'PER QTR',
          location: 'DCV, PREP, BALT, PA',
          duration: '3-month course',
          dates: 'Spring, Summer, Fall, and Winter (see schedule for upcoming classes)',
          description: 'Beginner, Level I athletes focus on developing primary phases of the vault. Class is held on weekends and includes static and dynamic stretching, biomechanically focused warm-up, primary phase drills and vaulting.'
        },
        {
          title: 'Intermediate',
          ages: 'All Ages',
          price: '$550',
          priceModifier: 'PER QTR',
          location: 'DCV, PREP, BALT, PA',
          duration: '3-month course',
          dates: 'Spring, Summer, Fall, and Winter (see schedule for upcoming classes)',
          description: 'Intermediate, Level II athletes focus on mastering primary phases of the vault and basic introduction of secondary phases of the vault. Class is held on weekends and includes static and dynamic stretching, biomechanically focused warm-up, primary and secondary phase drills, vaulting and introductory speed and strength conditioning.'
        },
        {
          title: 'Emerging Elite',
          priceModifier: 'INVITE ONLY',
          location: 'DCV, CUA',
          duration: '6-month course',
          dates: 'Fall and Winter',
          description: 'Emerging Elite, Level III athletes focus on mastering secondary phases of the vault. Class is held on weekends and at multiple times during the week. Athletes participate in a 6-month comprehensive training program designed to produce maximum level of performance during the competitive season. Classes include static and dynamic stretching, biomechanically focused warm-up, secondary phase drills, vaulting and extensive speed and strength conditioning.'
        },
        {
          title: 'Elite',
          priceModifier: 'INVITE ONLY',
          location: 'DCV, CUA',
          duration: '9-month course',
          dates: 'Fall, Winter, and Spring',
          description: 'Elite, Level IV athletes focus on high level refinement of secondary phases of the vault, as well as mastering tertiary phases of the vault. Athletes participate in a 9-month comprehensive training program designed to produce two seasonal peaks in performance (indoor and outdoor championships)and to transition athletes to professional level training.'
        },
        {
          title: 'Professional',
          priceModifier: 'INVITE ONLY',
          location: 'DCV, NCS, PG',
          duration: 'Year-round program',
          description: 'Professional, Level V athletes work in private session on a personalized, comprehensive, year-round training program. Technical focus is on mastering tertiary phases of the vault, with strong emphasis placed on high level refinement of energy transitions. Speed and strength development is customized for the individual athlete to produce peak performance during championship competitions. It incorporates recovery phases and non-traditional range of motion and biomechanical movements for stabilization, technical consistency and injury prevention.'
        },
        {
          title: 'Discounts',
          priceModifier: 'BY REQUEST',
          description: 'DC Vault offers a variety of discounts to needy athletes, local residents and service members, such as...</br>10% - DC Residents</br>10% - Active Duty Military</br>10% - Full Time College Student</br>25% - DCPS Students</br>25% - Family Discount</br>Does not apply to equipment rental, special training sessions, or events. Discounts cannot be combined.</br>Please contact us (dcvault@dcvault.org) to apply for a discount code.'
        },
        {
          title: 'Private Lessons',
          priceModifier: 'BY REQUEST',
          description: '1 hour in duration, offered for all skill levels. Private lessons are limited in availability. Please contact us for scheduling.'
        },
        {
          title: 'Pole Rental',
          price: '$150',
          priceModifier: 'PER QTR',
          description: 'Note - Poles are provided FREE OF CHARGE for use during DC Vault classes.</br>As a typical athlete will progress through 3-6 poles during a season, the cost of purchasing poles (ranging from $300-$800 each) can add up quickly. Our pole rental program allows athletes to check out one pole at a time for non-club related activities, such as high school practice or competition.'
        }
      ],
      showDescription: false,
      currentDescription: ''
    }
  }

  componentDidMount () {

  }

  render () { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div id='training-container' className='container'>
        <p className='section-header'>Training <span className='red-text'>Options</span></p>
        <div className='row' style={{width: '100%', margin: '0'}}>
          {
            this.state.trainingCards.map((card, index) => {
              return (
                <TrainingCard card={card} index={index} key={index} />
              )
            })
          }
        </div>
        <div className='red-button' onClick={() => { window.location.href = '/register' }} style={{marginTop: '30px'}}>
          <span className='button-text'>Sign Up</span>
        </div>
        <div className='center-content' style={{marginTop: '15px'}}>
          <p className='info-text' style={{textAlign: 'center'}}>To apply for a discount code or training group invitation, please <a className='red-text' onClick={() => { document.getElementById('contact-button').click() }}>contact us</a></p>
        </div>
        <ReactTooltip html />
      </div>
    )
  }
}

class TrainingCard extends React.Component {
  render () {
    let card = this.props.card
    let index = this.props.index

    let classString = 'col-xs-12 col-md-4 option-card '
    if (index % 2 === 0) {
      classString += 'dark'
    } else {
      classString += 'light'
    }

    let descriptionString = ''
    if (card.duration) {
      descriptionString += card.duration + '</br>'
    }
    if (card.location) {
      descriptionString += 'Locations: ' + card.location + '</br>'
    }
    if (card.ages) {
      descriptionString += 'Ages: ' + card.ages + '</br>'
    }
    descriptionString += card.description
    return (
      <div className={classString}>
        <p className='option-title'>{card.title}</p>
        <p className='option-info'>{card.ages ? card.ages : ''}</p>
        <div className='option-price-container-1'>
          <div className='option-price-container-2'>
            <p className='option-price'>{card.price ? card.price : 'N/A'}</p>
            <p className='option-price-modifier'>{card.priceModifier ? card.priceModifier : ''}</p>
          </div>
        </div>
        <a className='learn-more' data-tip={'<div style="max-width: 250px">' + descriptionString + '</div>'}>Details</a>
      </div>
    )
  }
}

export default Training
