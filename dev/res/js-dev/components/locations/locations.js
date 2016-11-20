/* jshint browser:true */

'use strict';

let location = require('./location');
let eventTool = require('patterns/tx-event');

const LOCATIONS_ID = 'locations';
const ACTIVE_CLASS_NAME = 'locations-is-active';

let locations;
let dom;

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

function getLocations() {
  return locations;
}

function getLocationsDOM() {
  return dom;
}

function setLocationsDOM() {
  dom = document.getElementById(LOCATIONS_ID);
}

function toggleLocations() {
  dom.classList.toggle(ACTIVE_CLASS_NAME);
}

function translateLocations(event) {
  locations.forEach(currentLocation => {currentLocation.project(event.data);});
}

function appendLocations() {
  var container = document.createDocumentFragment();
  locations.forEach(currentLocation => {container.appendChild(currentLocation.dom());});
  getLocationsDOM().appendChild(container);
}

function setupLocations() {
  locations = locationsData.map(locationData => location(locationData));
  appendLocations();
}

function setupEvents() {
  eventTool.bind(document, 'maprender', translateLocations);
}

function initializeLocations() {
  setLocationsDOM();
  setupLocations();
  setupEvents();
}

exports.init = initializeLocations;
exports.toggle = toggleLocations;
exports.locations = getLocations;
