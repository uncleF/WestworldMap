/* jshint browser:true */

'use strict';

module.export = locationData => {

  let info;
  let dom;

  function createLocation() {
    console.log('Create Location');
  }

  function createLocationDOM() {
    console.log('Create Location DOM');
  }

  function updateLocation() {
    console.log('Update Location');
  }

  function removeLocation() {
    info = null;
  }

  function getLocation() {
    return info;
  }

  function getLocationName() {
    return info.name;
  }

  function getLocationPicture() {
    return info.picture;
  }

  function getLocationCoordinates() {
    return info.coordinates;
  }

  function getDOM() {
    return dom;
  }

  function initializeLocation() {
    info = createLocation();
    dom = createLocationDOM();
  }

  initializeLocation(locationData);

  return {
    update: updateLocation,
    remove: removeLocation,
    info: getLocation,
    name: getLocationName,
    picture: getLocationPicture,
    coordinates: getLocationCoordinates,
    dom: getDOM
  };

};
