import React from 'react';
import {render} from 'react-dom';
import apiHelpers from './api-helpers';

class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      returnedPhotos: [],
      showZoom: false
    }
  }

  componentDidMount() {
    apiHelpers.getFacebookImages('186876704664784')
    .then((res) => {
      console.log(res);
      this.setState({
        returnedPhotos: res.data.data
      })
    })
  }

  zoomImage(id) {
    this.refs.zoomedImage.src = 'https://graph.facebook.com/' + id + '/picture';
    this.setState({
      showZoom: true
    })
  }

  render() {
    return (
      <div>
        <div className="container">
          <div className="row">
            {this.state.returnedPhotos.map((photo, index) => {
              return (
                <div key={index} className="col-xs-12 col-md-4">
                  <div className='gallery-img-container'>
                    <img src={'https://graph.facebook.com/' + photo.id + '/picture'} onClick={() => {this.zoomImage.bind(this)(photo.id)}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="zoom-image" style={{display: this.state.showZoom ? 'block' : 'none'}} onClick={() => {this.setState.bind(this)({showZoom: false})}}>
          <span className="glyphicon glyphicon-remove close-image" onClick={() => {this.setState.bind(this)({showZoom: false})}}></span>
          <img ref="zoomedImage" className="zoomed-image"/>
        </div>
      </div>
    );
  }
}

export default Gallery;