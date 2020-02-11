import React from 'react'
import ReactTooltip from 'react-tooltip'

class Training extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      trainingCards: [
          {
              title: 'Fly-Kids',
              ages: 'Ages 6-10',
                price:'$120',
              priceModifier:'SPECIALTY',
              location: 'DCV',
              description: 'Our FLY-KIDS DC program is designed for children ages 6-10 years of age. This innovative monthly program introduces young kids to the basics of pole vaulting in a fun, engaging environment. Using custom made children\'s pole vault equipment and an innovative approach to training, kids are actually able to pole vault within their first lesson! Kids will run, jump, climb and swing their way to new heights!'
          },
        {

          title: 'Adult',
          ages: 'Ages 21+',
          price: '$300',
          priceModifier: 'SPECIALTY',
          location: 'DCV, PREP',
          dates: 'Spring, Summer, Fall, and Winter',
          description: 'A flexible program for adult athletes with demanding schedules that allows participants register for a limited number of sessions that can be used in just a few weeks or spread out over several months. Classes focus on the individual in that Adults can set their own training objectives. Adults are trained separately from other athletes when enough participants register for a single class (coordinate with your friends!).  '
        },
        {
          title: 'Beginner-Intermediate',
          ages: 'All Ages',
          price: '$450',
          priceModifier: 'MONTHLY - QUARTERLY',
          location: 'DCV, PREP',
          duration: 'Monthly + Quarterly',
          dates: 'Spring, Summer, Fall, and Winter (see schedule for upcoming classes)',
          description: 'Beginner, Level-1 athletes focus on introduction to the vault, while Intermediate, Level II athletes focus on mastering primary phases of the vault. Class includes static and dynamic stretching, biomechanically focused warm-up, drills and vaulting. '
        },
        {
          title: 'Emerging Elite',
          priceModifier: 'INVITE ONLY',
          location: 'DCV',
          duration: '6-month course',
          dates: 'Fall and Winter',
          description: 'Emerging Elite, Level III athletes focus on mastering secondary phases of the vault. Athletes participate in a 6-month comprehensive training program designed to produce maximum level of performance during the competitive season. Classes include static and dynamic stretching, biomechanically focused warm-up, secondary phase drills, vaulting and extensive speed and strength conditioning.'
        },
        {
          title: 'Elite',
          priceModifier: 'INVITE ONLY',
          location: 'DCV',
          duration: '9-month course',
          dates: 'Fall, Winter, and Spring',
          description: 'Elite, Level IV athletes focus on high level refinement of secondary phases of the vault, as well as mastering tertiary phases of the vault. Athletes participate in a 9-month comprehensive training program designed to produce two seasonal peaks in performance (indoor and outdoor championships) and to transition athletes to professional level training.'
        },
        {
          title: 'Professional',
          priceModifier: 'INVITE ONLY',
          location: 'DCV',
          duration: 'Year-round program',
          description: 'Professional, Level V athletes work in private session on a personalized, comprehensive, year-round training program. Technical focus is on mastering tertiary phases of the vault, with strong emphasis placed on high level refinement of energy transitions. Speed and strength development is customized for the individual athlete to produce peak performance during championship competitions. It incorporates recovery phases and non-traditional range of motion and biomechanical movements for stabilization, technical consistency and injury prevention.'
        },
          {
            title: 'Strength Training',
            location:'DCV',
            ages: 'Ages 13+',
            priceModifier: 'SPECIALTY',
            description: 'Athletes participating in the DC Vault Strength Program will learn fundamentals of weightlifting, calisthenics, balance and flexibility, using methods similar to DC Vault\'s elite development programs. \n' +
                'With movements transferable to the vault, focus is placed on technical elements and biomechanics to ensure safety, improve motor skills, and result in the greatest gains for each athlete.'
          },
        {
          title: 'Private Lessons',
          price: '$200',
          ages: 'All Ages',
          priceModifier: 'BY REQUEST',
          description: '1 hour in duration, offered for all skill levels. Private lessons are limited in availability. Please contact us for scheduling.'
        },
        {
          title: 'Pole Rental',
          price: '$200',
          priceModifier: 'WEEKLY - QUARTERLY',
          description: 'Poles are provided FREE OF CHARGE for use during DC Vault classes.</br>A typical athlete will progress through 3-6 poles seasonally. At $400-$900 each, costs can add up quickly. Our pole rental program allows athletes to check out one pole at a time for Non-DCV related activities, such as a school team competition.'
        }
      ],
      showDescription: false,
      currentDescription: ''
    }
  }

  componentDidMount () {

  }

  //        <p className='option-info'>{card.ages ? card.ages : ''}</p>
  //old ages options above the circle
  render () { // All components have a render function in which you will return this 'HTML-like' syntax
    return (
      <div id='training-container' className='container'>
        <p className='section-header'>Training <span className='red-text'>Programs</span></p>
        <div className='red-button' onClick={() => { window.location.href = '/register/info' }} style={{marginBottom: '30px'}}>
          <span className='button-text'>Course Sign Up</span>
        </div>
        <div className='row' style={{width: '100%', margin: '0'}}>
          {
            this.state.trainingCards.map((card, index) => {
              return (
                <TrainingCard card={card} index={index} key={index} />
              )
            })
          }
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

    if (card.location) {
      descriptionString += 'Locations: ' + card.location + '</br>'
    }
    if (card.ages) {
      descriptionString += 'Ages: ' + card.ages + '</br>'
    }
    if (card.duration) {
      descriptionString += card.duration + '</br>'
    }
    descriptionString += card.description

    return (
      <div className={classString}>
        <p className='option-title'>{card.title}</p>
        <div className='option-price-container-1'>
          <div className='option-price-container-2'>
            <p className='option-price'>{card.ages ? card.ages : 'N/A'}</p>
            <p className='option-price-modifier'>{card.priceModifier ? card.priceModifier : ''}</p>
          </div>
        </div>
        <a className='learn-more' data-tip={'<div style="max-width: 250px">' + descriptionString + '</div>'}>Details</a>
      </div>
    )
  }
}

export default Training
