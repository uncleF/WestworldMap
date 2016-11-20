/* jshint browser:true */

'use strict';

let canvas = require('./canvas');
let animation = require('./animation');
let panorama = require('./panorama');
let eventTool = require('patterns/tx-event');

const ROTATION_STEP = 0.5235;
const ZOOM_STEP = 0.35;
const ZOOM_MAX = 4;
const ZOOM_MIN = 0.25;
const TRANSITION_DURATION = 500;

const EVENT_RENDER = 'maprender';
const EVENT_TYPE = 'UIEvent';

let renderer;
let scene;
let camera;
let light;
let object;

let width;
let height;

function getMapRotation() {
  return object.rotation.y;
}

function getMapScale() {
  return object.scale.x;
}

function rotateMap(angle) {
  object.rotation.set(0, angle, 0);
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
  factor = factor > ZOOM_MAX ? ZOOM_MAX : factor;
  factor = factor < ZOOM_MIN ? ZOOM_MIN : factor;
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

function resetMap() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.scale.x, (1 - getMapScale()), zoomMap);
}

function toggleMapPanorama() {
  panorama.toggle();
}

function showTopDownMapView() {
  console.log('Top-Down View');
}

function triggerRenderEvent() {
  let data = {
    camera: camera,
    width: width,
    height: height
  };
  eventTool.trigger(document, EVENT_RENDER, false, EVENT_TYPE, data);
}

function renderMap() {
  renderer.render(scene, camera);
  triggerRenderEvent();
}

function setMapSize() {
  width = renderer.domElement.width;
  height = renderer.domElement.height;
}

function setupMap(properties) {
  ({renderer, scene, camera, light, object} = properties);
  setMapSize();
  return Promise.resolve();
}

function initializeMap(locations) {
  canvas.init(locations)
    .then(setupMap)
    .then(renderMap);
}

exports.init = initializeMap;
exports.rotate = rotateMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.angle = getMapRotation;
exports.zoom = zoomMap;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.reset = resetMap;
exports.panorama = toggleMapPanorama;
exports.topDown = showTopDownMapView;
exports.scale = getMapScale;
