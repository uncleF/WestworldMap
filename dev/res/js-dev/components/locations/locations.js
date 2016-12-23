/* jshint browser:true */

'use strict';

let mapLocation = require('./location');
let eventManager = require('patterns/tx-event');
let download = require('utilities/download');
let uiEvents = require('ui/uiEvents');
let mapEvents = require('map/mapEvents');

const LOCATIONS_DATA_URL = 'data/locations.json';

const LOCATIONS_ID = 'locations';
const ACTIVE_CLASS_NAME = 'locations-is-active';

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
    eventManager.trigger(document, mapEvents.locations, false);
  }

  function projectLocations(event) {
    locations.forEach((currentLocation, index) => currentLocation.project(event.data.newPositions[index]));
  }

  function generateMapLocations() {
    return getLocations().map(mapLocation => mapLocation.position());
  }

  /* Inititalization */

  function onMapRender(event) {
    requestAnimationFrame(_ => {
      projectLocations(event);
    });
  }

  function onLocationsChange() {
    toggleLocations();
  }

  function initializeEvents() {
    eventManager.bind(document, 'maprender', onMapRender);
    eventManager.bind(document, uiEvents.locations, onLocationsChange);
  }

  function appendLocations() {
    let container = document.createDocumentFragment();
    getLocations().forEach(currentLocation => container.appendChild(currentLocation.dom()));
    getDOM().appendChild(container);
  }

  function initilizeLocations(data) {
    dom = document.getElementById(LOCATIONS_ID);
    locations = data.map(locationData => mapLocation(locationData));
  }

  function initialization(data) {
    initilizeLocations(data);
    appendLocations();
    initializeEvents();
    return generateMapLocations();
  }

  return download(LOCATIONS_DATA_URL)
    .then(initialization);

};
