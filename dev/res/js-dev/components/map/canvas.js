/* jshint browser:true */
/* global THREE */

'use strict';

const CANVAS_HOLDER_ID = 'map';

const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION = {y: 200, z: 350};
const CAMERA_ROTATION = {x: 100};

const LIGHT_POSITION = {y: 150, z: 500};
const LIGHT_COLOR = 0xFFFFFF;

module.exports = _ => {

  let holderDOM;
  let canvasDOM;
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
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    canvasDOM = renderer.domElement;
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

  function setupObject() {
    let material = new THREE.MeshLambertMaterial({color: 0xCC0000});
    object = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);
    scene.add(object);
  }

  function inititalizeCanvas() {
    setupCanvas();
    setupRenderer();
    setupScene();
    setupCamera();
    setupLights();
    setupObject();
    holderDOM.appendChild(canvasDOM);
  }

  inititalizeCanvas();

  return {
    renderer: renderer,
    scene: scene,
    camera: camera,
    light: light,
    object: object
  };

};
