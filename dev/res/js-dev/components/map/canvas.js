/* jshint browser:true */
/* global THREE */

'use strict';

const CANVAS_HOLDER_ID = 'map';

const SCENE_URL = '/res/models/placeholder.json';

const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION = {x: 0, y: 200, z: 350};
const CAMERA_ROTATION = {x: 100, y: 0, z: 0};

const LIGHT_POSITION = {x: 0, y: 150, z: 500};
const LIGHT_COLOR = 0xFFFFFF;

let holderDOM;
let width;
let height;

let renderer;

let scene;

let camera;
let cameraAngle;
let cameraAspect;
let cameraNear;
let cameraFar;

let light;

let object;

let locations;

function setupCanvas() {
  holderDOM = document.getElementById(CANVAS_HOLDER_ID);
  width = holderDOM.clientWidth;
  height = holderDOM.clientHeight;
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, castShadows: true});
  renderer.setSize(width, height);
  holderDOM.appendChild(renderer.domElement);
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
  camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
  camera.rotation.set(CAMERA_ROTATION.x, CAMERA_ROTATION.y, CAMERA_ROTATION.z);
  scene.add(camera);
}

function setupLights() {
  light = new THREE.PointLight(LIGHT_COLOR);
  light.position.set(LIGHT_POSITION.x, LIGHT_POSITION.y, LIGHT_POSITION.z);
  scene.add(light);
}

function addLocationPoint(currentLocation) {
  let position = currentLocation.position();
  let point = new THREE.Object3D();
  point.position.set(position.x, position.y, position.z);
  currentLocation.point(point);
  object.add(point);
}

function addLocationPoints() {
  locations.forEach(addLocationPoint);
}

function addObject(geometry) {
  object = new THREE.Object3D();
  object.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
  addLocationPoints();
  scene.add(object);
}

function getProperties() {
  return {
    renderer: renderer,
    scene: scene,
    camera: camera,
    light: light,
    object: object
  };
}

function setupObject() {
  return new Promise((resolve, reject) => {
    let loader = new THREE.JSONLoader();
    loader.load(SCENE_URL, (geometry) => {
      addObject(geometry);
      resolve(getProperties());
    });
  });
}

function inititalizeCanvas(locationsInstance) {
  locations = locationsInstance;
  setupCanvas();
  setupRenderer();
  setupScene();
  setupCamera();
  setupLights();
  return setupObject();
}

exports.init = inititalizeCanvas;
