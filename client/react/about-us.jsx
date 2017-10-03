import React from 'react';
import {render} from 'react-dom';

class AboutUs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: [
        {
          image: 'imageone.jpg',
          text: 'Image One Text'
        },
        {
          image: 'imagetwo.jpg',
          text: 'Image Two Text'
        },
        {
          image: 'imagethree.jpg',
          text: 'Image Three Text'
        },
        {
          image: 'imagefour.jpg',
          text: 'Image Four Text'
        },
        {
          image: 'imagefive.jpg',
          text: 'Image Five Text'
        }
      ],
      active: 0,
      delay: 5000
    };
  }

  componentDidMount() {
    setTimeout(this.shiftImages.bind(this), this.state.delay - 2000);
  }

  shiftImages() {
    let active = document.getElementsByClassName('active-image')[0];
    let second = document.getElementsByClassName('second-image')[0];
    let third = document.getElementsByClassName('third-image')[0];
    let fourth = document.getElementsByClassName('fourth-image')[0];

    active.style.transition = null;
    second.style.transition = null;
    third.style.transition = null;
    fourth.style.transition = null;

    // active.style.left = '-80%';
    second.style.left = '0';
    third.style.left = '70%';
    fourth.style.left = '85%';

    setTimeout(() => {
      active.style.transition = 'none';
      second.style.transition = 'none';
      third.style.transition = 'none';
      fourth.style.transition = 'none';

      active.style.left = null;
      second.style.left = null;
      third.style.left = null;
      fourth.style.left = null;

      let len = this.state.content.length;
      let current = this.state.active;
      this.setState({
        active: (current + 1) % len
      });
    }, 2000);

    setTimeout(this.shiftImages.bind(this), this.state.delay);
  }

  render() {

    let len = this.state.content.length;


    return (
      <div className='container carousel'>
        <div className='active-image' style={{backgroundImage: 'url(../img/carousel/' + this.state.content[this.state.active].image + ')'}}>
          <div className='carousel-title'>
            <p>{this.state.content[this.state.active].text}</p>
          </div>
        </div>
        <div className='second-image'  style={{backgroundImage: 'url(../img/carousel/' + this.state.content[(this.state.active+1)%len].image + ')'}}>
          <div className='carousel-title'>
            <p>{this.state.content[(this.state.active + 1)%len].text}</p>
          </div>
        </div>
        <div className='third-image' style={{backgroundImage: 'url(../img/carousel/' + this.state.content[(this.state.active+2)%len].image + ')'}}>
          <div className='carousel-title'>
            <p>{this.state.content[(this.state.active + 2)%len].text}</p>
          </div>
        </div>
        <div className='fourth-image' style={{backgroundImage: 'url(../img/carousel/' + this.state.content[(this.state.active+3)%len].image + ')'}}>
          <div className='carousel-title'>
            <p>{this.state.content[(this.state.active + 3)%len].text}</p>
          </div>
        </div>
      </div>
    );
  }

}

export default AboutUs;