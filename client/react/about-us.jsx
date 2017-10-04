import React from 'react';
import {render} from 'react-dom';

class AboutUs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: [
        {
          image: 'imageone.jpg',
          text: 'Who We Are',
          link: 'who-we-are'
        },
        {
          image: 'imagetwo.jpg',
          text: 'Athletes Around the World',
          link: 'around-the-world'
        },
        {
          image: 'imagethree.jpg',
          text: 'Meet Our Staff',
          link: 'Staff'
        },
        {
          image: 'imagefour.jpg',
          text: 'Photo Gallery',
          link: 'gallery'
        },
        {
          image: 'imagefive.jpg',
          text: 'Our Partners',
          link: 'partners'
        }
      ],
      active: 0,
      delay: 5000,
      timer: null,
      resetTimer: null,
    };
  }

  componentDidMount() {
    this.setState({
      timer: setTimeout(this.shiftImages.bind(this), this.state.delay - 2000)
    });
  }

  shiftImages() {
    let active = document.getElementsByClassName('active-image')[0];
    let second = document.getElementsByClassName('second-image')[0];
    let third = document.getElementsByClassName('third-image')[0];
    let fourth = document.getElementsByClassName('fourth-image')[0];

    second.style.transition = null;
    third.style.transition = null;
    fourth.style.transition = null;

    second.style.transform = 'translateX(-70%)';
    third.style.transform = 'translateX(-15%)';
    fourth.style.transform = 'translateX(-15%)';
    this.setState({
      resetTimer: setTimeout(() => {
        this.resetCarousel.bind(this)();
        let len = this.state.content.length;
        let current = this.state.active;
        this.setState({
          active: (current + 1) % len
        });
      }, 2000)
    })

    this.setState({
      timer: setTimeout(this.shiftImages.bind(this), this.state.delay)
    });
  }

  resetCarousel() {
    let active = document.getElementsByClassName('active-image')[0];
    let second = document.getElementsByClassName('second-image')[0];
    let third = document.getElementsByClassName('third-image')[0];
    let fourth = document.getElementsByClassName('fourth-image')[0];

    second.style.transition = 'none';
    third.style.transition = 'none';
    fourth.style.transition = 'none';

    second.style.transform = null;
    third.style.transform = null;
    fourth.style.transform = null;
  }

  setCarousel(index) {
    clearTimeout(this.state.timer);
    clearTimeout(this.state.resetTimer);

    this.setState({
      active: (index - 1) % this.state.content.length
    });

    this.resetCarousel();

    this.setState({
      timer: setTimeout(this.shiftImages.bind(this), 0)
    });
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
        <div className='second-image'  style={{backgroundImage: 'url(../img/carousel/' + this.state.content[(this.state.active+1)%len].image + ')'}} onClick={() => {this.setCarousel.bind(this)(this.state.active + 1)}}>
          <div className='carousel-title'>
            <p>{this.state.content[(this.state.active + 1)%len].text}</p>
          </div>
        </div>
        <div className='third-image' style={{backgroundImage: 'url(../img/carousel/' + this.state.content[(this.state.active+2)%len].image + ')'}} onClick={() => {this.setCarousel.bind(this)(this.state.active + 2)}}>
          <div className='carousel-title'>
            <p>{this.state.content[(this.state.active + 2)%len].text}</p>
          </div>
        </div>
        <div className='fourth-image' style={{backgroundImage: 'url(../img/carousel/' + this.state.content[(this.state.active+3)%len].image + ')'}} onClick={() => {this.setCarousel.bind(this)(this.state.active + 3)}}>
          <div className='carousel-title'>
            <p>{this.state.content[(this.state.active + 3)%len].text}</p>
          </div>
        </div>
      </div>
    );
  }

}

export default AboutUs;