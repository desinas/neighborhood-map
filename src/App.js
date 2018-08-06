import React, { Component } from 'react';

import * as dataLocations from './locations.json';

import './App.css';

function loadJS (src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');

  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);

  script.onerror = function () {
    document.write('Loading error on Google Maps')
  };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: dataLocations,
      map: '',
      markers: [],
      isInfoBoxOpen: false,
      currentMarker: {},
      infoContent: ''
    };
  }

  componentDidMount() {
    window.initMap = this.initMap;
    loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyC1Y06-pFfNM7Voq4ygiUcrAPHXXugYRNc&callback=initMap');
  }

  initMap = () => {
    let controlledThis = this;
    const { locations, markers } = this.state;

    /* create the map in the center of ancient Athens */
    let map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 37.9726543, lng: 23.7263274 },
      zoom: 16
    });
    this.setState({ map });

    /* create markers for the hard coded locations */
    for (let i = 0; i < locations.length; i++) {
      let position = locations[i].position;
      let title = locations[i].title;
      let id = locations[i].short

      /* create marker in the map */
      let marker = new window.google.maps.Marker({
        id: id,
        map: map,
        title: title,
        position: position,
        animation: window.google.maps.Animation.DROP,
      });

      /* push marker in the state of markers */
      markers.push(marker);

      /* enable click on marker to open info box */
      marker.addListener('click', function () {
        controlledThis.openInfoBox(marker);
      });
    }

    /* enable click on map to close info box */
     map.addListener('click', function () {
      controlledThis.closeInfoBox();
     });
  }

  openInfoBox = (marker) => {
    this.setState({
      isInfoBoxOpen: true,
      currentMarker: marker
    });

    this.getInfos(marker);
  }

  closeInfoBox = () => {
    this.setState({
      isInfoBoxOpen: false,
      currentMarker: {}
    });
  }

  getInfos = (marker) => {
    let controlledThis = this;
    let place = marker.title;
    let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    let srcUrl 
     = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' 
     + place;
    srcUrl = srcUrl.replace(/ /g, '%20');
    
    /** Fetch from Wikipedia API the title of the place and
     * then get the content of the response and
     * then get the content into the state 
     */
    fetch(proxyUrl + srcUrl)
      .then(function(response) {
        return response.json();
      }).then(function (data) {
        let pages = data.query.pages;
        let pageId = Object.keys(data.query.pages)[0];
        let pageContent = pages[pageId].extract;

        controlledThis.setState({ infoContent: pageContent });

      }).catch(function (error) {
        let pageError = 'Parsing failed ' + error;
        controlledThis.setState({
          infoContent: pageError
        });
      })
  }

  render() {
    return (
      <div className="App">
        
        <div id="map" role="application"></div>
      </div>
    );
  }
}

export default App;
