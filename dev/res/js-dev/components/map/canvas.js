/* jshint browser:true */
/* global THREE */

'use strict';

const CANVAS_HOLDER_ID = 'map';

const SCENE_URL = '/res/models/placeholder.json';

const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION = [0, 200, 350];

const LIGHT_COLOR = 0xFFFFFF;
const LIGHT_POSITION = [0, 150, 500];

let holderDOM;
let width;
let height;

let locations;

let renderer;

let scene;

let camera;
let cameraAngle;
let cameraAspect;
let cameraNear;
let cameraFar;

let light;

let world;

let object;

/* Get */

function getProperties() {
  return {
    renderer: renderer,
    scene: scene,
    camera: camera,
    light: light,
    world: world,
    object: object
  };
}

/* Initialization */

function setupCanvas() {
  holderDOM = document.getElementById(CANVAS_HOLDER_ID);
  width = holderDOM.clientWidth;
  height = holderDOM.clientHeight;
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true, castShadows: true});
  renderer.setSize(width, height);
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

function addWorld() {
  world = new THREE.Object3D();
  scene.add(world);
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
  world.add(object);
}

function setupObject() {
  return new Promise((resolve, reject) => {
    let loader = new THREE.JSONLoader();
    loader.load(SCENE_URL, geometry => {
      addWorld();
      addObject(geometry);
      resolve();
    });
  });
}

function setupDOM() {
  holderDOM.appendChild(renderer.domElement);
}

function inititalizeCanvas(locationData) {
  locations = locationData;
  setupCanvas();
  setupRenderer();
  setupScene();
  setupCamera();
  setupLights();
  return setupObject()
    .then(setupDOM)
    .then(getProperties);
}

/* Interface */

exports.init = inititalizeCanvas;
