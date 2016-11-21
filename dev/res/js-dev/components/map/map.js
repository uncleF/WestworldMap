/* jshint browser:true */

'use strict';

let canvas = require('./canvas');
let animation = require('./animation');
let panorama = require('./panorama');
let eventTool = require('patterns/tx-event');

const ROTATION_DEFAULT = [0, 0, 0];
const ROTATION_STEP = Math.PI / 180 * 30;
const ROTATION_CCW_STEP = [0, ROTATION_STEP, 0];
const ROTATION_CW_STEP = [0, -ROTATION_STEP, 0];

const SCALE_DEFAULT = 1;
const SCALE_STEP = 0.25;
const SCALE_MAX = 4;
const SCALE_MIN = 0.25;

const TRANSITION_DURATION = 300;

const EVENT_RENDER = 'maprender';

const CAMERA_TOP_POSITION = [0, 500, 0];
const CAMERA_TOP_ROTATION = [-1.57069, 0, 0];
const CAMERA_PERSPECTIVE_POSITION = [0, 200, 350];
const CAMERA_PERSPECTIVE_ROTATION = [-0.5191, 0, 0];

let renderer;
let width;
let height;

let scene;

let camera;
let cameraStatus;

let light;

let world;

let object;

/* Get */

function getMapRotation() {
  return [
    object.rotation.x,
    object.rotation.y,
    object.rotation.z,
  ];
}

function getMapScale() {
  return object.scale.x;
}

/* Map Actions */

function renderMap() {
  renderer.render(scene, camera);
  triggerRenderEvent();
}

function rotateMap(angles) {
  object.rotation.set(...angles);
  renderMap();
}

function rotateMapCCW() {
  animation.go(TRANSITION_DURATION, getMapRotation(), ROTATION_CCW_STEP, rotateMap, true);
}

function rotateMapCW() {
  animation.go(TRANSITION_DURATION, getMapRotation(), ROTATION_CW_STEP, rotateMap, true);
}

function zoomMap(factor) {
  factor = factor > SCALE_MAX ? SCALE_MAX : factor;
  factor = factor < SCALE_MIN ? SCALE_MIN : factor;
  object.scale.set(factor, factor, factor);
  renderMap();
}

function zoomInMap() {
  animation.go(TRANSITION_DURATION, getMapScale(), SCALE_STEP, zoomMap, true);
}

function zoomOutMap() {
  animation.go(TRANSITION_DURATION, getMapScale(), -SCALE_STEP, zoomMap, true);
}

function scaleRotateMap(anglesFactor) {
  zoomMap(anglesFactor.pop());
  rotateMap(anglesFactor);
  renderMap();
}

function resetMap() {
  let startValues = [...getMapRotation(), getMapScale()];
  let targetValues = [...ROTATION_DEFAULT, SCALE_DEFAULT];
  animation.go(TRANSITION_DURATION, startValues, targetValues, scaleRotateMap);
}

/* Views */

function positionRotateCamera(positionRotation) {
  camera.position.set(positionRotation[0], positionRotation[1], positionRotation[2]);
  camera.rotation.set(positionRotation[3], positionRotation[4], positionRotation[5]);
  renderMap();
}

function moveCameraTop() {
  let startValues = [...CAMERA_PERSPECTIVE_POSITION, ...CAMERA_PERSPECTIVE_ROTATION];
  let targetValues = [...CAMERA_TOP_POSITION, ...CAMERA_TOP_ROTATION];
  animation.go(TRANSITION_DURATION, startValues, targetValues, positionRotateCamera);
}

function moveCameraPerspective() {
  let startValues = [...CAMERA_TOP_POSITION, ...CAMERA_TOP_ROTATION];
  let targetValues = [...CAMERA_PERSPECTIVE_POSITION, ...CAMERA_PERSPECTIVE_ROTATION];
  animation.go(TRANSITION_DURATION, startValues, targetValues, positionRotateCamera);
}

function toggleTopDownView() {
  if (cameraStatus) {
    moveCameraTop();
    cameraStatus = false;
  } else {
    moveCameraPerspective();
    cameraStatus = true;
  }
}

function togglePanoramaView() {
  panorama.toggle();
}

/* Map Events */

function triggerRenderEvent() {
  let data = {
    camera: camera,
    width: width,
    height: height
  };
  eventTool.trigger(document, EVENT_RENDER, false, 'UIEvent', data);
}

/* Map Initialization */

function setupMap(properties) {
  ({renderer, scene, camera, light, world, object} = properties);
  width = renderer.domElement.width;
  height = renderer.domElement.height;
  cameraStatus = true;
  return Promise.resolve();
}

function initializeMap(locations) {
  return canvas.init(locations)
    .then(setupMap)
    .then(renderMap);
}

/* Interface */

exports.init = initializeMap;
exports.getRotation = getMapRotation;
exports.getScale = getMapScale;
exports.render = renderMap;
exports.rotate = rotateMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoom = zoomMap;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.reset = resetMap;
exports.toggleTopView = toggleTopDownView;
exports.togglePanorama = togglePanoramaView;
