(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var animation = void 0;

function runAnimation(startTime, duration, value, change, task) {
  animation = requestAnimationFrame(function (_) {
    var fraction = (Date.now() - startTime) / duration;
    if (fraction >= 1) {
      task(value + change);
    } else {
      task(value + change * fraction);
      runAnimation(startTime, duration, value, change, task);
    }
  });
}

function stopAnimation() {
  if (animation) {
    cancelAnimationFrame(animation);
  }
}

function go(duration, value, change, task) {
  runAnimation(Date.now(), duration, value, change, task);
}

exports.go = go;
exports.stop = stopAnimation;

},{}],2:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

var CANVAS_HOLDER_ID = 'map';

var CAMERA_ANGLE = 45;
var CAMERA_NEAR = 0.1;
var CAMERA_FAR = 1000;
var CAMERA_POSITION = { y: 200, z: 350 };
var CAMERA_ROTATION = { x: 100 };

var LIGHT_POSITION = { y: 150, z: 500 };
var LIGHT_COLOR = 0xFFFFFF;

module.exports = function (_) {

  var holderDOM = void 0;
  var canvasDOM = void 0;
  var width = void 0;
  var height = void 0;

  var renderer = void 0;

  var scene = void 0;

  var camera = void 0;
  var cameraAngle = void 0;
  var cameraAspect = void 0;
  var cameraNear = void 0;
  var cameraFar = void 0;

  var light = void 0;

  var object = void 0;

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
    var material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
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

},{}],3:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var canvas = require('./canvas');
var animation = require('./animation');

var renderer = void 0;
var scene = void 0;
var camera = void 0;
var light = void 0;
var object = void 0;

var ROTATION_STEP = 0.5235;
var ROTATION_DURATION = 250;
var ZOOM_STEP = 1;

function renderMap() {
  renderer.render(scene, camera);
}

function rotateMap(angle) {
  object.rotation.y = angle;
  renderMap();
}

function rotateMapCCW() {
  animation.stop();
  animation.go(ROTATION_DURATION, object.rotation.y, ROTATION_STEP, rotateMap);
}

function rotateMapCW() {
  animation.stop();
  animation.go(ROTATION_DURATION, object.rotation.y, -ROTATION_STEP, rotateMap);
}

function zoomMap(factor) {
  console.log(factor);
}

function zoomInMap() {
  zoomMap(ZOOM_STEP);
  console.log('Zoom In');
}

function zoomOutMap() {
  zoomMap(ZOOM_STEP);
  console.log('Zoom Out');
}

function toggleFullScreenMap() {
  console.log('Full Screen');
}

function initializeMap() {
  var _canvas = canvas();

  renderer = _canvas.renderer;
  scene = _canvas.scene;
  camera = _canvas.camera;
  light = _canvas.light;
  object = _canvas.object;

  renderMap();
}

exports.init = initializeMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.toggleFullScreen = toggleFullScreenMap;

},{"./animation":1,"./canvas":2}],4:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = function (id, task) {

  var dom = void 0;

  function onClick(event) {
    event.preventDefault();
    task();
  }

  dom = document.getElementById(id);
  dom.addEventListener('click', onClick);
};

},{}],5:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var control = require('./control');
var toggle = require('./toggle');

var ROTATE_CCW_ID = 'rotateCCW';
var ROTATE_CW_ID = 'rotateCW';
var ZOOM_IN_ID = 'zoomIn';
var ZOOM_OUT_ID = 'zoomOut';
var FULL_SCREEN_ID = 'fullScreen';

module.exports = function (map) {

  function inititalizeControls() {
    control(ROTATE_CCW_ID, map.rotateCCW);
    control(ROTATE_CW_ID, map.rotateCW);
    control(ZOOM_IN_ID, map.zoomIn);
    control(ZOOM_OUT_ID, map.zoomOut);
    toggle(FULL_SCREEN_ID, map.toggleFullScreen);
  }

  inititalizeControls();
};

},{"./control":4,"./toggle":7}],6:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var toggle = require('./toggle');

var DRAWER_TOGGLE_ID = 'locationsToggle';
var DRAWER_ID = 'locations';
var ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

module.exports = function (_) {

  var locationsDrawer = void 0;
  var activeClass = void 0;

  function toggleDrawer() {
    locationsDrawer.classList.toggle(activeClass);
  }

  locationsDrawer = document.getElementById(DRAWER_ID);
  activeClass = '' + DRAWER_ID + ACTIVE_CLASS_NAME_SUFFIX;
  toggle(DRAWER_TOGGLE_ID, toggleDrawer);
};

},{"./toggle":7}],7:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

module.exports = function (id, task) {

  var dom = void 0;
  var activeClass = void 0;

  function onClick(event) {
    event.preventDefault();
    dom.classList.toggle(activeClass);
    task();
  }

  dom = document.getElementById(id);
  activeClass = '' + id + ACTIVE_CLASS_NAME_SUFFIX;
  dom.addEventListener('click', onClick);
};

},{}],8:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var drawer = require('./drawer');
var controls = require('./controls');

module.exports = function (map) {

  drawer();
  controls(map);
};

},{"./controls":5,"./drawer":6}],9:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var map = require('map/map');
var ui = require('ui/ui');

map.init();
ui(map);

},{"map/map":3,"ui/ui":8}]},{},[9]);
