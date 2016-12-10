/* jshint browser:true */
/* global THREE */

'use strict';

let eventManager = require('patterns/tx-event');
let canvas = require('map/canvas');
let animation = require('map/animation');
let uiEvents = require('ui/uiEvents');
let mapEvents = require('map/mapEvents');

const RENDER_EVENT = 'maprender';

const TRANSITION_DURATION = 300;

const CAMERA_TOP_POSITION = [0, 500, 0];
const CAMERA_TOP_ROTATION = [-1.57069, 0, -3.14159];
const CAMERA_PERSPECTIVE_POSITION = [0, 200, -350];
const CAMERA_PERSPECTIVE_ROTATION = [-2.62244, 0, -3.14159];

const PAN_STEP = 50;
const PAN_LEFT_STEP = [-PAN_STEP, 0, 0];
const PAN_RIGHT_STEP = [PAN_STEP, 0, 0];
const PAN_RATIO = 0.35;

const ROTATION_DEFAULT = [0, 0, 0];
const ROTATION_STEP = Math.PI / 180 * 30;
const ROTATION_CCW_STEP = [0, ROTATION_STEP, 0];
const ROTATION_CW_STEP = [0, -ROTATION_STEP, 0];

const SCALE_DEFAULT = 1;
const SCALE_STEP = 0.25;
const SCALE_MAX = 4;
const SCALE_MIN = 0.25;
const SCALE_RATIO = 0.0075;

module.exports = locationsData => {

  let width;
  let height;
  let halfWidth;
  let halfHeight;

  let renderer;

  let scene;
  let snap;

  let camera;

  let light;

  let raycaster;

  let object;

  let points;

  let view;

  /* Get */

  function getMapRotation() {
    return [
      object.rotation.x,
      object.rotation.y % (Math.PI * 2),
      object.rotation.z,
    ];
  }

  function getMapDefaultRotation() {
    return [
      ROTATION_DEFAULT[0],
      Math.round(object.rotation.y / (Math.PI * 2)) * Math.PI * 2,
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
    return view ? CAMERA_TOP_POSITION : CAMERA_PERSPECTIVE_POSITION;
  }

  function getSnap() {
    return snap;
  }

  /* Utilities */

  function calculateRotationFromDelta(data) {
    let rotation = getSnap().mapRotation.slice(0);
    let startVector = {
      x: data.startPosition.clientX - halfWidth,
      y: halfHeight - data.startPosition.clientY
    };
    let currentVector = {
      x: data.currentPosition.clientX - halfWidth,
      y: halfHeight - data.currentPosition.clientY
    };
    rotation[1] -= Math.atan2(currentVector.x, currentVector.y) - Math.atan2(startVector.x, startVector.y);
    return rotation;
  }

  function calculatePositionFromDelta(delta) {
    let position = getSnap().cameraPosition.slice(0);
    position[0] += delta.x * -PAN_RATIO;
    return position;
  }

  function calculateScaleFromDistance(delta) {
    return getSnap().mapScale + delta * SCALE_RATIO;
  }

  function calculatePointProjection(point) {
    let projection = new THREE.Vector3();
    projection.setFromMatrixPosition(point.matrixWorld).project(camera);
    return projection;
  }

  function calculateLocationPosition(point) {
    let projection = calculatePointProjection(point);
    let position = {
      x: Math.round((projection.x + 1) * halfWidth),
      y: Math.round((-projection.y + 1) * halfHeight)
    };
    let positionNDC = new THREE.Vector2((position.x / width) * 2 - 1, (-position.y / height) * 2 + 1);
    raycaster.setFromCamera(positionNDC, camera);
    return {
      position: position,
      visibility: (raycaster.intersectObjects(object.children)[0].object === point)
    };
  }

  function calculateLocationsPositions() {
    return points.map(calculateLocationPosition);
  }

  function calculateHalves() {
    halfWidth = width / 2;
    halfHeight = height / 2;
  }

  /* Map Actions */

  function renderMap() {
    renderer.render(scene, camera);
    eventManager.trigger(document, RENDER_EVENT, false, 'UIEvent', {newPositions: calculateLocationsPositions()});
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

  function panCamera(position) {
    camera.position.set(...position);
    renderMap();
  }

  function panCameraLeft() {
    animation.go(TRANSITION_DURATION, getCameraPosition(), PAN_LEFT_STEP, panCamera, true);
  }

  function panCameraRight() {
    animation.go(TRANSITION_DURATION, getCameraPosition(), PAN_RIGHT_STEP, panCamera, true);
  }

  /* Scene Actions */

  function transformScene(transformation) {
    camera.position.set(...transformation.slice(0, 3));
    object.rotation.set(...transformation.slice(3, 6));
    object.scale.set(transformation[6], transformation[6], transformation[6]);
    renderMap();
  }

  function resetScene() {
    let startValues = [...getCameraPosition(), ...getMapRotation(), getMapScale()];
    let targetValues = [...getCameraDefaultPosition(), ...getMapDefaultRotation(), SCALE_DEFAULT];
    animation.go(TRANSITION_DURATION, startValues, targetValues, transformScene);
  }

  function snapScene() {
    snap = {
      mapRotation: getMapRotation(),
      mapScale: getMapScale(),
      cameraPosition: getCameraPosition()
    };
  }

  function resizeScene() {
    width = window.innerWidth;
    height = window.innerHeight;
    calculateHalves();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
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
    if (!view) {
      moveCameraTop();
    } else {
      moveCameraPerspective();
    }
    view = !view;
    eventManager.trigger(document, mapEvents.topDown, false);
  }

  /* Map Initialization */

  function onTopDown() {
    toggleTopDownView();
  }

  function onRotate(event) {
    let rotation = calculateRotationFromDelta(event.data);
    rotateMap(rotation);
  }

  function onRotateCCW(event) {
    rotateMapCCW();
  }

  function onRotateCW(event) {
    rotateMapCW();
  }

  function onPan(event) {
    let position = calculatePositionFromDelta(event.data.delta);
    panCamera(position);
  }

  function onPanLeft() {
    panCameraLeft();
  }

  function onPanRight() {
    panCameraRight();
  }

  function onZoom(event) {
    let scale = calculateScaleFromDistance(event.data.delta);
    scaleMap(scale);
  }

  function onZoomIn(event) {
    zoomInMap();
  }

  function onZoomOut(event) {
    zoomOutMap();
  }

  function onReset() {
    resetScene();
  }

  function onSnap() {
    snapScene();
  }

  function onResize(event) {
    requestAnimationFrame(_ => {
      resizeScene();
      renderMap();
    });
  }

  function initializeEvents() {
    eventManager.bind(document, uiEvents.topDown, onTopDown);
    eventManager.bind(document, uiEvents.rotate, onRotate);
    eventManager.bind(document, uiEvents.rotateCCW, onRotateCCW);
    eventManager.bind(document, uiEvents.rotateCW, onRotateCW);
    eventManager.bind(document, uiEvents.pan, onPan);
    eventManager.bind(document, uiEvents.panLeft, onPanLeft);
    eventManager.bind(document, uiEvents.panRight, onPanRight);
    eventManager.bind(document, uiEvents.zoom, onZoom);
    eventManager.bind(document, uiEvents.zoomIn, onZoomIn);
    eventManager.bind(document, uiEvents.zoomOut, onZoomOut);
    eventManager.bind(document, uiEvents.snap, onSnap);
    eventManager.bind(document, uiEvents.reset, onReset);
    eventManager.bind(window, 'resize', onResize);
  }

  function setupMap(properties) {
    ({renderer, scene, camera, light, raycaster, object, points} = properties);
    ({width, height} = renderer.domElement);
    view = false;
    calculateHalves();
    initializeEvents();
    renderMap();
  }

  return canvas(locationsData)
    .then(setupMap);

};

