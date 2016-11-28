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

module.exports = _ => {

  let dom;
  let locations;

  /* Get */

  function getDOM() {
    return dom;
  }

  function getLocations() {
    return locations;
  }

  /* Actions */

  function toggleLocations() {
    getDOM().classList.toggle(ACTIVE_CLASS_NAME);
  }

  function projectLocations(event) {
    locations.forEach(currentLocation => {currentLocation.project(event.data);});
  }

  function generateMapLocations() {
    return getLocations().map(mapLocation => mapLocation.position());
  }

  /* Inititalization */

  function appendLocations() {
    let container = document.createDocumentFragment();
    getLocations().forEach(currentLocation => {container.appendChild(currentLocation.dom());});
    getDOM().appendChild(container);
  }

  function initializeEvents() {
    eventManager.bind(document, 'maprender', projectLocations);
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
