/* jshint browser:true */

'use strict';

const location = require('./location');

module.export = locationsData => {

  let list;
  let dom;

  function createLocationList() {
    console.log('Create Location List');
  }

  function createLocationsDOM() {
    console.log('Create Locations DOM');
  }

  function updateLocationList() {
    console.log('Update Location List');
  }

  function getLocationList() {
    return list;
  }

  function getDOM() {
    return dom;
  }

  function initializeLocations() {
    list = createLocationList();
    dom = createLocationsDOM();
  }

  initializeLocations();

  return {
    update: updateLocationList,
    list: getLocationList,
    dom: getDOM
  };

};
