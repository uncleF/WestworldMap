/* jshint browser:true */
/* global THREE */

'use strict';

const GEOMETRY_URL = '/res/models/placeholder.json';

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

  let object;
  let objectGeometry;

  /* Initialization */

  function setupCanvas() {
    dom = document.getElementById(CANVAS_HOLDER_ID);
    width = dom.clientWidth;
    height = dom.clientHeight;
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

  function addLocationPoint(position) {
    let point = new THREE.Object3D();
    point.position.set(position.x, position.y, position.z);
    // currentLocation.point(point);
    object.add(point);
  }

  function addLocationPoints() {
    locationsData.forEach(addLocationPoint);
  }

  function addObject() {
    object = new THREE.Object3D();
    object.add(new THREE.Mesh(objectGeometry, new THREE.MeshNormalMaterial()));
    addLocationPoints();
    scene.add(object);
  }

  function setupObject() {
    return new Promise((resolve, reject) => {
      let loader = new THREE.JSONLoader();
      loader.load(GEOMETRY_URL, geometry => {
        objectGeometry = geometry;
        addObject();
        resolve();
      });
    });
  }

  function setupDOM() {
    dom.appendChild(renderer.domElement);
  }

  function returnCanvasInterface() {
    return {
      renderer: renderer,
      scene: scene,
      camera: camera,
      light: light,
      object: object
    };
  }

  setupCanvas();
  setupRenderer();
  setupScene();
  setupCamera();
  setupLights();
  return setupObject()
    .then(setupDOM)
    .then(returnCanvasInterface);

};
