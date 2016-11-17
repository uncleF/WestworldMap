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
const ROTATION_DURATION = 250;
const ZOOM_STEP = 10;

function renderMap() {
  renderer.render(scene, camera);
}

function rotateMap(angle) {
  object.rotation.y = angle;
  renderMap();
}

function rotateMapCCW() {
  animation.stop();
  animation.go(ROTATION_DURATION, object.rotation.y, ROTATION_STEP, rotateMap);
}

function rotateMapCW() {
  animation.stop();
  animation.go(ROTATION_DURATION, object.rotation.y, -ROTATION_STEP, rotateMap);
}

function zoomMap(factor) {
  console.log(factor);
}

function zoomInMap() {
  zoomMap(ZOOM_STEP);
  console.log('Zoom In');
}

function zoomOutMap() {
  zoomMap(ZOOM_STEP);
  console.log('Zoom Out');
}

function toggleFullScreenMap() {
  console.log('Full Screen');
}

function initializeMap() {
  ({renderer, scene, camera, light, object} = canvas());
  renderMap();
}

exports.init = initializeMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.toggleFullScreen = toggleFullScreenMap;
