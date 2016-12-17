/* jshint browser:true */
/* global THREE */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');
let errorMessages = require('ui/errorMessages');

const SCENE_URL = '/scene/scene.json';

const CANVAS_HOLDER_ID = 'map';

const CAMERA_POSITION = [0, 200, -350];
const CAMERA_ANGLE = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

const TILT_SHIFT_FOCUS_POS = 0.40;
const TILT_SHIFT_AMOUNT = 0.015;
const TILT_SHIFT_BRIGHTNESS = 0.45;

module.exports = locationsData => {

  let width;
  let height;

  let dom;

  let renderer;
  let composer;

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

  function addObject(loadedObjects) {
    object = new THREE.Object3D();
    object.add(loadedObjects);
    addLocationPoints();
    scene.add(object);
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

  function setupShaders() {
    let renderPass = new THREE.RenderPass(scene, camera);
    let tiltShiftPass = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
    composer = new THREE.EffectComposer(renderer);
    tiltShiftPass.uniforms.focusPos.value = TILT_SHIFT_FOCUS_POS;
    tiltShiftPass.uniforms.amount.value = TILT_SHIFT_AMOUNT;
    tiltShiftPass.uniforms.brightness.value = TILT_SHIFT_BRIGHTNESS;
    tiltShiftPass.renderToScreen = true;
    composer.addPass(renderPass);
    composer.addPass(tiltShiftPass);
  }

  function returnCanvasInterface() {
    return {
      renderer: renderer,
      composer: composer,
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
    .then(setupShaders)
    .then(setupObject)
    .then(setupDOM)
    .then(returnCanvasInterface);

};
