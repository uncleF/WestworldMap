/* jshint browser:true */
/* global THREE */

'use strict';

const CANVAS_HOLDER_ID = 'map';

const SCENE_URL = '/res/models/placeholder.json';

const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION = {y: 200, z: 350};
const CAMERA_ROTATION = {x: 100};

const LIGHT_POSITION = {y: 150, z: 500};
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

function setupCanvas() {
  holderDOM = document.getElementById(CANVAS_HOLDER_ID);
  width = holderDOM.clientWidth;
  height = holderDOM.clientHeight;
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true});
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
  camera.position.y = CAMERA_POSITION.y;
  camera.position.z = CAMERA_POSITION.z;
  camera.rotation.x = CAMERA_ROTATION.x;
  scene.add(camera);
}

function setupLights() {
  light = new THREE.PointLight(LIGHT_COLOR);
  light.position.y = LIGHT_POSITION.y;
  light.position.z = LIGHT_POSITION.z;
  scene.add(light);
}

function addObject(geometry) {
  object = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
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

function inititalizeCanvas() {
  setupCanvas();
  setupRenderer();
  setupScene();
  setupCamera();
  setupLights();
  return setupObject();
}

exports.init = inititalizeCanvas;
