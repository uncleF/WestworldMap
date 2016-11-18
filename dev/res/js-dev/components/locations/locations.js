/* jshint browser:true */

'use strict';

const location = require('./location');

const LOCATIONS_ID = 'locations';
const ACTIVE_CLASS_NAME = 'locations-is-active';

let locations;

function toggleLocations() {
  locations.classList.toggle(ACTIVE_CLASS_NAME);
}

function setupLocations() {
  locations = document.getElementById(LOCATIONS_ID);
}

function initializeLocations() {
  setupLocations();
}

exports.init = initializeLocations;
exports.toggle = toggleLocations;
