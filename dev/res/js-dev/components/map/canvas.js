/* jshint browser:true */
/* global THREE */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');
let errorMessages = require('ui/errorMessages');

const SCENE_URL = 'scene/scene.json';

const CANVAS_HOLDER_ID = 'map';

const CAMERA_POSITION = [0, 6.65, -11.65];
const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

module.exports = locationsData => {

  let width;
  let height;

  let dom;

  let renderer;

  let scene;

  let camera;
  let cameraAngle;
  let cameraAspect;
  let cameraNear;
  let cameraFar;

  let raycaster;

  let object;

  let points;

  /* Initialization */

  function setupCanvas() {
    dom = document.getElementById(CANVAS_HOLDER_ID);
    width = dom.clientWidth;
    height = dom.clientHeight;
    return Promise.resolve();
  }

  function setupRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({antialias: true, castShadows: true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      return Promise.resolve();
    }
    catch (error) {
      return Promise.reject(errorMessages.webGlInactive);
    }
  }

  function setupScene() {
    scene = new THREE.Scene();
  }

  function setupCamera() {
    cameraAngle = CAMERA_ANGLE;
    cameraAspect = width / height;
    cameraNear = CAMERA_NEAR;
    cameraFar = CAMERA_FAR;
    camera = new THREE.PerspectiveCamera(cameraAngle, cameraAspect, cameraNear, cameraFar);
    camera.position.set(...CAMERA_POSITION);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
  }

  function setupRaycaster() {
    raycaster = new THREE.Raycaster();
  }

  function addLocationPoint(position) {
    let locationGeometry = new THREE.BoxGeometry(5, 5, 5);
    let locationMaterial = new THREE.MeshLambertMaterial({color: 0x0000ff, transparent: true, opacity: 0});
    let point = new THREE.Mesh(locationGeometry, locationMaterial);
    point.position.set(...position);
    object.add(point);
    return point;
  }

  function addLocationPoints() {
    points = locationsData.map(addLocationPoint);
  }

  function getLocationPoints() {
    return points;
  }

  function addObject(loadedObjects) {
    object = new THREE.Object3D();
    object.add(loadedObjects);
    addLocationPoints();
    scene.add(object);
  }

  function getObject() {
    return object;
  }

  function setupObject() {
    return new Promise((resolve, reject) => {
      let loader = new THREE.ObjectLoader();
      loader.load(SCENE_URL, loadedObjects => {
        addObject(loadedObjects);
        resolve();
      }, request => {
        eventManager.trigger(document, uiEvents.progress, false, 'UIEvent', {total: request.total, loaded: request.loaded});
      }, error => {
        reject(error);
      });
    });
  }

  function setupDOM() {
    dom.appendChild(renderer.domElement);
  }

  function setupBase() {
    setupScene();
    setupCamera();
    setupRaycaster();
    return Promise.resolve();
  }

  function returnCanvasInterface() {
    return {
      renderer: renderer,
      scene: scene,
      camera: camera,
      raycaster: raycaster,
      object: getObject,
      points: getLocationPoints
    };
  }

  return setupCanvas()
    .then(setupRenderer)
    .then(setupBase)
    .then(setupObject)
    .then(setupDOM)
    .then(returnCanvasInterface);

};
