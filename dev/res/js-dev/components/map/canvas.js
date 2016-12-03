/* jshint browser:true */
/* global THREE */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');
let errorMessages = require('ui/errorMessages');

const GEOMETRY_URL = '/models/placeholder.json';

const CANVAS_HOLDER_ID = 'map';

const CAMERA_POSITION = [0, 200, -350];
const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

const LIGHT_POSITION = [0, 150, 500];
const LIGHT_COLOR = 0xFFFFFF;

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

  let light;

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

  function setupLights() {
    light = new THREE.PointLight(LIGHT_COLOR);
    light.position.set(...LIGHT_POSITION);
    scene.add(light);
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

  function addObject(geometry) {
    object = new THREE.Object3D();
    object.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
    addLocationPoints();
    scene.add(object);
  }

  function setupObject() {
    return new Promise((resolve, reject) => {
      let loader = new THREE.JSONLoader();
      loader.load(GEOMETRY_URL, geometry => {
        addObject(geometry);
        resolve();
      }, request => {
        eventManager(document, uiEvents.progress, {total: request.total, loaded: request.loaded});
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
    setupLights();
    setupRaycaster();
    return Promise.resolve();
  }

  function returnCanvasInterface() {
    return {
      renderer: renderer,
      scene: scene,
      camera: camera,
      light: light,
      raycaster: raycaster,
      object: object,
      points: points
    };
  }

  return setupCanvas()
    .then(setupRenderer)
    .then(setupBase)
    .then(setupObject)
    .then(setupDOM)
    .then(returnCanvasInterface);

};
