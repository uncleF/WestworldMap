/* jshint browser:true */

'use strict';

let canvas = require('./canvas');
let animation = require('./animation');

let renderer;
let scene;
let camera;
let light;
let object;

const ROTATION_STEP = 0.5235;
const ZOOM_STEP = 0.35;
const TRANSITION_DURATION = 500;

function renderMap() {
  renderer.render(scene, camera);
}

function rotateMap(angle) {
  object.rotation.y = angle;
  renderMap();
}

function rotateMapCCW() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.rotation.y, ROTATION_STEP, rotateMap);
}

function rotateMapCW() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.rotation.y, -ROTATION_STEP, rotateMap);
}

function zoomMap(factor) {
  object.scale.set(factor, factor, factor);
  renderMap();
}

function zoomInMap() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.scale.x, ZOOM_STEP, zoomMap);
}

function zoomOutMap() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.scale.x, -ZOOM_STEP, zoomMap);
}

function setupMap(properties) {
  ({renderer, scene, camera, light, object} = properties);
  return Promise.resolve();
}

function initializeMap() {
  canvas.init()
    .then(setupMap)
    .then(renderMap);
}

exports.init = initializeMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
