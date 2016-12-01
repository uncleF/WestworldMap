/* jshint browser:true */

'use strict';

let createNode = require('patterns/tx-createNode');

const TEMPLATE_NAME_PHOLDER = '{{ NAME }}';
const TEMPLATE_DESC_PHOLDER = '{{ DESC }}';
const TEMPLATE = `<a href="#" class="location">
                    <span class="locationInfo">
                      <span class="locationName">${TEMPLATE_NAME_PHOLDER}</span>
                      <span class="locationDescription">${TEMPLATE_DESC_PHOLDER}</span>
                    </span>
                  </a>`;

const LOCATION_HIDDEN_CLASS = 'location-is-hidden';

module.exports = locationData => {

  let dom;
  let name;
  let description;
  let picture;
  let position;

  /* Get */

  function getLocationName() {
    return name;
  }

  function getLocationDescription() {
    return description;
  }

  function getLocationPicture() {
    return picture;
  }

  function getLocationPosition() {
    return position;
  }

  function getLocationDOM() {
    return dom;
  }

  function getLocation() {
    return {
      name: getLocationName(),
      description: getLocationDescription(),
      picture: getLocationPicture()
    };
  }

  /* Actions */

  function hideLocation() {
    getLocationDOM().classList.add(LOCATION_HIDDEN_CLASS);
  }

  function showLocation() {
    getLocationDOM().classList.remove(LOCATION_HIDDEN_CLASS);
  }

  function projectLocation(newPosition) {
    if (newPosition.visibility) {
      showLocation();
    } else {
      hideLocation();
    }
    getLocationDOM().style.transform = `translateY(50%) translateX(${newPosition.position.x}px) translateY(${newPosition.position.y}px) translateZ(0)`;
  }

  /* Initialization */

  function createLocationDOM() {
    let html = TEMPLATE
      .replace(TEMPLATE_NAME_PHOLDER, getLocationName())
      .replace(TEMPLATE_DESC_PHOLDER, getLocationDescription());
    dom = createNode(html);
  }

  ({name, description, picture, position} = locationData);
  createLocationDOM();

  /* Interface */

  return {
    info: getLocation,
    name: getLocationName,
    picture: getLocationPicture,
    position: getLocationPosition,
    dom: getLocationDOM,
    project: projectLocation
  };

};
