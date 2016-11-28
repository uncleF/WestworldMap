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

module.exports = locationData => {

  let name;
  let description;
  let picture;
  let position;
  let dom;

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

  // function normalizeProjection(data) {
  //   return {
  //     x: Math.round((data.projection.x + 1) * data.width  / 2),
  //     y: Math.round((-data.projection.y + 1) * data.height / 2)
  //   };
  // }

  function projectLocation(newPosition) {
    getLocationDOM().style.transform = `translateY(50%) translateX(${newPosition.x}px) translateY(${newPosition.y}px)`;
  }

  // function projectLocation(data) {
  //   let projectionVector = new THREE.Vector3()
  //     .setFromMatrixPosition(getLocationVector().matrixWorld)
  //     .project(data.camera);
  //   translateLocation(normalizeProjection(data));
  // }

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
