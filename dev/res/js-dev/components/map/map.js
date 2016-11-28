/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let canvas = require('./canvas');
let animation = require('./animation');
let uiEvents = require('ui/uiEvents');

module.exports = locationsData => {

  const ROTATION_DEFAULT = [0, 0, 0];
  const ROTATION_STEP = Math.PI / 180 * 30;
  const ROTATION_CCW_STEP = [0, ROTATION_STEP, 0];
  const ROTATION_CW_STEP = [0, -ROTATION_STEP, 0];
  const ROTATION_RATIO = 0.01;

  const SCALE_DEFAULT = 1;
  const SCALE_STEP = 0.25;
  const SCALE_MAX = 4;
  const SCALE_MIN = 0.25;
  const SCALE_RATIO = 0.01;

  const TRANSITION_DURATION = 300;

  const EVENT_RENDER = 'maprender';

  const PAN_STEP = 50;
  const PAN_RATIO = 0.25;

  const CAMERA_TOP_POSITION = [0, 500, 0];
  const CAMERA_TOP_ROTATION = [-1.57069, 0, -3.14159];
  const CAMERA_PERSPECTIVE_POSITION = [0, 200, -350];
  const CAMERA_PERSPECTIVE_ROTATION = [-2.62244, 0, -3.14159];

  let renderer;
  let width;
  let height;

  let scene;
  let snap;

  let camera;

  let light;

  let object;

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

  function calculateRotationFromDelta(delta) {
    let rotation = getSnap().mapRotation.slice(0);
    rotation[1] += delta.x * ROTATION_RATIO;
    return rotation;
  }

  function calculatePositionFromDelta(delta) {
    let position = getSnap().cameraPosition.slice(0);
    position[0] += delta.x * -PAN_RATIO;
    return position;
  }

  /* Map Actions */

  function renderMap() {
    renderer.render(scene, camera);
    eventManager.trigger(document, EVENT_RENDER, false, 'UIEvent', {camera: camera, width: width, height: height});
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
    animation.go(TRANSITION_DURATION, getCameraPosition()[0], -PAN_STEP, panCamera, true);
  }

  function panCameraRight() {
    animation.go(TRANSITION_DURATION, getCameraPosition()[0], PAN_STEP, panCamera, true);
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
  }

  /* Map Initialization */

  function onTopDown() {
    toggleTopDownView();
  }

  function onRotate(event) {
    let rotation = calculateRotationFromDelta(event.data.delta);
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
    console.log('Free zoom');
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
    console.log('resize');
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
    ({renderer, scene, camera, light, object} = properties);
    ({width, height} = renderer.domElement);
    view = false;
    initializeEvents();
    renderMap();
  }

  return canvas(locationsData)
    .then(setupMap);

};

