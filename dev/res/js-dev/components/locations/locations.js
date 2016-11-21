/* jshint browser:true */

'use strict';

let location = require('./location');
let eventTool = require('patterns/tx-event');

const LOCATIONS_ID = 'locations';
const ACTIVE_CLASS_NAME = 'locations-is-active';

let locations;
let dom;

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

function toggleLocations() {
  dom.classList.toggle(ACTIVE_CLASS_NAME);
}

function translateLocations(event) {
  locations.forEach(currentLocation => {currentLocation.project(event.data);});
}

/* Events */

function initializeEvents() {
  eventTool.bind(document, 'maprender', translateLocations);
}

/* Initialization */

function appendLocations() {
  let container = document.createDocumentFragment();
  locations.forEach(currentLocation => {container.appendChild(currentLocation.dom());});
  dom.appendChild(container);
}

function setupLocations() {
  locations = locationsData.map(locationData => location(locationData));
  appendLocations();
}

function initializeLocations() {
  dom = document.getElementById(LOCATIONS_ID);
  setupLocations();
  initializeEvents();
  return Promise.resolve(locations);
}

/* Interface */

exports.init = initializeLocations;
exports.toggle = toggleLocations;
