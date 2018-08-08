import React, { Component } from 'react';
// import fetchJsonp from 'fetch-jsonp';

import * as data from './locations.json';
import Places from './Places';
import InfoBox from './InfoBox';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: data,
      map: '',
      markers: [],
      isInfoBoxOpen: false,
      currentMarker: {},
      infoContent: ''
    };
  }

  componentDidMount() {
    window.initMap = this.initMap;
    loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyC1Y06-pFfNM7Voq4ygiUcrAPHXXugYRNc&callback=initMap');
  }

  /**
   * Create the map in the center of ancient Athens,
   * create markers for the hard coded locations,
   * create marker in the map and push them in the state,
   * enable click on marker to open info box,
   * enable click on map to close info box.
   */
  initMap = () => {
    let that = this;
    const { locations, markers } = this.state;

    let map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 37.9726543, lng: 23.7263274 },
      zoom: 16
    });
    this.setState({ map });

    for (let i = 0; i < locations.length; i++) {
      let position = locations[i].position;
      let title = locations[i].title;
      let id = locations[i].key

      let marker = new window.google.maps.Marker({
        id: id,
        map: map,
        title: title,
        position: position,
        animation: window.google.maps.Animation.DROP,
      });

      markers.push(marker);

      marker.addListener('click', function () {
        that.openInfoBox(marker);
      });
    }

     map.addListener('click', function () {
      that.closeInfoBox();
     });
  }

  openInfoBox = (marker) => {
    this.setState({
      isInfoBoxOpen: true,
      currentMarker: marker
    });

    this.getInfo(marker);
  }

  closeInfoBox = () => {
    this.setState({
      isInfoBoxOpen: false,
      currentMarker: {}
    });
  }

  /** Fetch from Wikipedia API the title of the place and
   * then get the content of the response and
   * then get the content into the state 
   */
  getInfo = (marker) => {
    let that = this;
    let place = marker.title;
     //api call through proxy to solve cors issue
    let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    let srcUrl 
     = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' 
     + place;
    srcUrl = srcUrl.replace(/ /g, '%20');
    
    fetch(proxyUrl + srcUrl)
      .then(function(response) {
        return response.json();
      }).then(function (data) {
        let pages = data.query.pages;
        let pageId = Object.keys(data.query.pages)[0];
        let pageContent = pages[pageId].extract;

        that.setState({ infoContent: pageContent });

      }).catch(function (error) {
        let pageError = 'Parsing failed ' + error;
        that.setState({
          infoContent: pageError
        });
      })
  }

  render() {
    return (
      <div className="App">
        <Places
          locationsList={this.state.locations}
          markers={this.state.markers}
          openInfoBox={this.openInfoBox}
        />

        {
          this.state.isInfoBoxOpen &&
          <InfoBox
            currentMarker={this.state.currentMarker}
            infoContent={this.state.infoContent}
          />
        }
        <div id="map" role="application"></div>
      </div>
    );
  }
}

export default App;

function loadScript (src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');

  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);

  script.onerror = function () {
    document.write('Loading error on Google Maps')
  };
}
