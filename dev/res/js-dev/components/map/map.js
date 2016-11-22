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

const PAN_STEP = 50;

const CAMERA_TOP_POSITION = [0, 500, 0];
const CAMERA_TOP_ROTATION = [-1.57069, 0, -3.14159];
const CAMERA_PERSPECTIVE_POSITION = [0, 200, -350];
const CAMERA_PERSPECTIVE_ROTATION = [-2.62244, 0, -3.14159];

let renderer;
let width;
let height;

let scene;

let camera;
let cameraStatus;
let cameraSnapshotPosition;

let light;

let object;

/* Get */

function getMapRotation() {
  let skipedRotation = object.rotation.y % (Math.PI * 2);
  return [
    object.rotation.x,
    skipedRotation,
    object.rotation.z,
  ];
}

function getMapDefaultRotation() {
  let skipedDefault = Math.round(object.rotation.y / (Math.PI * 2)) * Math.PI * 2;
  return [
    ROTATION_DEFAULT[0],
    skipedDefault,
    ROTATION_DEFAULT[2]
  ];
}

function getMapScale() {
  return object.scale.x;
}

function getCameraPosition() {
  return [
    camera.position.x,
    camera.position.y,
    camera.position.z
  ];
}

function getCameraDefaultPosition() {
  return cameraStatus ? CAMERA_PERSPECTIVE_POSITION : CAMERA_TOP_POSITION;
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

function scaleMap(factor) {
  factor = factor > SCALE_MAX ? SCALE_MAX : factor;
  factor = factor < SCALE_MIN ? SCALE_MIN : factor;
  object.scale.set(factor, factor, factor);
  renderMap();
}

function zoomInMap() {
  animation.go(TRANSITION_DURATION, getMapScale(), SCALE_STEP, scaleMap, true);
}

function zoomOutMap() {
  animation.go(TRANSITION_DURATION, getMapScale(), -SCALE_STEP, scaleMap, true);
}

/* Camera Actions */

function shiftCamera(position) {
  camera.position.x = position;
  renderMap();
}

function panCamera(distance) {
  let position = cameraSnapshotPosition[0] + distance;
  shiftCamera(position);
}

function panCameraLeft() {
  animation.go(TRANSITION_DURATION, getCameraPosition()[0], -PAN_STEP, shiftCamera, true);
}

function panCameraRight() {
  animation.go(TRANSITION_DURATION, getCameraPosition()[0], PAN_STEP, shiftCamera, true);
}

/* Scene Actions */

function sceneSnapshot() {
  cameraSnapshotPosition = getCameraPosition();
}

function changeScene(transformation) {
  camera.position.set(...transformation.slice(0, 3));
  object.rotation.set(...transformation.slice(3, 6));
  object.scale.set(transformation[6], transformation[6], transformation[6]);
  renderMap();
}

function resetScene() {
  let startValues = [...getCameraPosition(), ...getMapRotation(), getMapScale()];
  let targetValues = [...getCameraDefaultPosition(), ...getMapDefaultRotation(), SCALE_DEFAULT];
  animation.go(TRANSITION_DURATION, startValues, targetValues, changeScene);
}

/* Views */

function transformCamera(positionRotation) {
  camera.position.set(...positionRotation.slice(0, 3));
  camera.rotation.set(...positionRotation.slice(3));
  renderMap();
}

function moveCameraTop() {
  let startValues = [...getCameraPosition(), ...CAMERA_PERSPECTIVE_ROTATION];
  let targetValues = [...CAMERA_TOP_POSITION, ...CAMERA_TOP_ROTATION];
  animation.go(TRANSITION_DURATION, startValues, targetValues, transformCamera);
}

function moveCameraPerspective() {
  let startValues = [...getCameraPosition(), ...CAMERA_TOP_ROTATION];
  let targetValues = [...CAMERA_PERSPECTIVE_POSITION, ...CAMERA_PERSPECTIVE_ROTATION];
  animation.go(TRANSITION_DURATION, startValues, targetValues, transformCamera);
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
  ({renderer, scene, camera, light, object} = properties);
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
exports.zoom = scaleMap;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.pan = panCamera;
exports.panLeft = panCameraLeft;
exports.panRight = panCameraRight;
exports.snapshot = sceneSnapshot;
exports.reset = resetScene;
exports.toggleTopView = toggleTopDownView;
exports.togglePanorama = togglePanoramaView;
