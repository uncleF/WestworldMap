/* jshint browser:true */
/* global THREE */

'use strict';

let createNode = require('patterns/tx-createNode');

module.exports = locationData => {

  const TEMPLATE_NAME_PHOLDER = '{{ NAME }}';
  const TEMPLATE_DESC_PHOLDER = '{{ DESC }}';
  const TEMPLATE = `<a href="#" class="location">
                      <span class="locationInfo">
                        <span class="locationName">${TEMPLATE_NAME_PHOLDER}</span>
                        <span class="locationDescription">${TEMPLATE_DESC_PHOLDER}</span>
                      </span>
                    </a>`;

  let name;
  let description;
  let picture;
  let position;
  let vector;
  let dom;

  function getLocation() {
    return {
      name: getLocationName(),
      description: getLocationDescription(),
      picture: getLocationPicture()
    };
  }

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

  function getLocationVector() {
    return vector;
  }

  function getLocationDOM() {
    return dom;
  }

  function createLocationDOM() {
    let html = TEMPLATE
      .replace(TEMPLATE_NAME_PHOLDER, getLocationName())
      .replace(TEMPLATE_DESC_PHOLDER, getLocationDescription());
    dom = createNode(html);
  }

  function normalizeProjection(projection, data) {
    return {
      x: Math.round((projection.x + 1) * data.width  / 2),
      y: Math.round((-projection.y + 1) * data.height / 2)
    };
  }

  function translateLocation(newPosition) {
    getLocationDOM().style.transform = `translateY(50%) translateX(${newPosition.x}px) translateY(${newPosition.y}px)`;
  }

  function projectLocation(data) {
    let projectionVector = new THREE.Vector3()
      .setFromMatrixPosition(getLocationVector().matrixWorld)
      .project(data.camera);
    translateLocation(normalizeProjection(projectionVector, data));
  }

  function pointLocation(locationVector) {
    vector = locationVector;
  }

  ({name, description, picture, position} = locationData);
  createLocationDOM();

  return {
    info: getLocation,
    name: getLocationName,
    picture: getLocationPicture,
    position: getLocationPosition,
    vector: getLocationVector,
    dom: getLocationDOM,
    project: projectLocation,
    point: pointLocation
  };

};
