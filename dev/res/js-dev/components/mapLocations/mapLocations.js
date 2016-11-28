/* jshint browser:true */

'use strict';

let mapLocation = require('./mapLocation');
let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const LOCATIONS_ID = 'locations';
const ACTIVE_CLASS_NAME = 'locations-is-active';

/* Mock Locations */

let locationsData = [
  {
    name: 'Sweetwater',
    description: 'Has a train station',
    picture: '#',
    position: {x: 0, y: 30, z: 20}
  }, {
    name: 'Pariah',
    description: 'One giant brothel',
    picture: '#',
    position: {x: 60, y: 15, z: 15}
  }
];

/* Actions */

module.exports = _ => {

  let dom;
  let locations;

  function toggleLocations() {
    dom.classList.toggle(ACTIVE_CLASS_NAME);
  }

  function translateLocations(event) {
    locations.forEach(currentLocation => {currentLocation.project(event.data);});
  }

  function appendLocations() {
    let container = document.createDocumentFragment();
    locations.forEach(currentLocation => {container.appendChild(currentLocation.dom());});
    dom.appendChild(container);
  }

  function generateMapLocations() {

  }

  function initializeEvents() {
    eventManager.bind(document, 'maprender', translateLocations);
    eventManager.bind(document, uiEvents.locations, toggleLocations);
  }

  function initilizeLocations() {
    dom = document.getElementById(LOCATIONS_ID);
    locations = locationsData.map(locationData => mapLocation(locationData));
  }

  initilizeLocations();
  appendLocations();
  initializeEvents();
  return Promise.resolve(generateMapLocations());

};
