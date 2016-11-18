(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = function (locationData) {

  var info = void 0;
  var dom = void 0;

  function createLocation() {
    console.log('Create Location');
  }

  function createLocationDOM() {
    console.log('Create Location DOM');
  }

  function updateLocation() {
    console.log('Update Location');
  }

  function removeLocation() {
    info = null;
  }

  function getLocation() {
    return info;
  }

  function getLocationName() {
    return info.name;
  }

  function getLocationPicture() {
    return info.picture;
  }

  function getLocationCoordinates() {
    return info.coordinates;
  }

  function getDOM() {
    return dom;
  }

  function initializeLocation() {
    info = createLocation();
    dom = createLocationDOM();
  }

  initializeLocation(locationData);

  return {
    update: updateLocation,
    remove: removeLocation,
    info: getLocation,
    name: getLocationName,
    picture: getLocationPicture,
    coordinates: getLocationCoordinates,
    dom: getDOM
  };
};

},{}],2:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var location = require('./location');

var LOCATIONS_ID = 'locations';
var ACTIVE_CLASS_NAME = 'locations-is-active';

var locations = void 0;

function toggleLocations() {
  locations.classList.toggle(ACTIVE_CLASS_NAME);
}

function setupLocations() {
  locations = document.getElementById(LOCATIONS_ID);
}

function initializeLocations() {
  setupLocations();
}

exports.init = initializeLocations;
exports.toggle = toggleLocations;

},{"./location":1}],3:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var animation = void 0;

function easing(fraction) {
  return fraction < 0.5 ? 16 * Math.pow(fraction, 5) : 1 + 16 * --fraction * Math.pow(fraction, 4);
}

function runAnimation(startTime, duration, value, change, task) {
  animation = requestAnimationFrame(function (_) {
    var fraction = (Date.now() - startTime) / duration;
    if (fraction >= 1) {
      task(value + change);
    } else {
      task(value + change * easing(fraction));
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

},{}],4:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

var CANVAS_HOLDER_ID = 'map';

var SCENE_URL = '/res/models/placeholder.json';

var CAMERA_ANGLE = 45;
var CAMERA_NEAR = 0.1;
var CAMERA_FAR = 1000;
var CAMERA_POSITION = { y: 200, z: 350 };
var CAMERA_ROTATION = { x: 100 };

var LIGHT_POSITION = { y: 150, z: 500 };
var LIGHT_COLOR = 0xFFFFFF;

var holderDOM = void 0;
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
  renderer = new THREE.WebGLRenderer({ antialias: true });
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
  return new Promise(function (resolve, reject) {
    var loader = new THREE.JSONLoader();
    loader.load(SCENE_URL, function (geometry) {
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

},{}],5:[function(require,module,exports){
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
var ZOOM_STEP = 0.35;
var TRANSITION_DURATION = 500;

function renderMap() {
  renderer.render(scene, camera);
}

function rotateMap(angle) {
  object.rotation.y = angle;
  renderMap();
}

function rotateMapCCW() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.rotation.y, ROTATION_STEP, rotateMap);
}

function rotateMapCW() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.rotation.y, -ROTATION_STEP, rotateMap);
}

function zoomMap(factor) {
  object.scale.set(factor, factor, factor);
  renderMap();
}

function zoomInMap() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.scale.x, ZOOM_STEP, zoomMap);
}

function zoomOutMap() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.scale.x, -ZOOM_STEP, zoomMap);
}

function setupMap(properties) {
  renderer = properties.renderer;
  scene = properties.scene;
  camera = properties.camera;
  light = properties.light;
  object = properties.object;

  return Promise.resolve();
}

function initializeMap() {
  canvas.init().then(setupMap).then(renderMap);
}

exports.init = initializeMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;

},{"./animation":3,"./canvas":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
/* jshint browser:true */

'use strict';

function enterFullScreen() {
  document.documentElement.webkitRequestFullscreen();
}

function exitFullScreen() {
  document.webkitExitFullscreen();
}

function toggleFullScreen() {
  if (!document.webkitFullscreenElement) {
    enterFullScreen();
  } else {
    exitFullScreen();
  }
}

exports.enter = enterFullScreen;
exports.exit = exitFullScreen;
exports.toggle = toggleFullScreen;

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var control = require('./control');
var toggle = require('./toggle');
var display = require('./display');

var WESTWORLD_ID = 'westworld';
var LOCATIONS_ID = 'showLocations';
var ROTATE_CCW_ID = 'rotateCCW';
var ROTATE_CW_ID = 'rotateCW';
var ZOOM_IN_ID = 'zoomIn';
var ZOOM_OUT_ID = 'zoomOut';
var FULL_SCREEN_ID = 'fullScreen';

module.exports = function (map, locations) {
  toggle(WESTWORLD_ID, function (_) {});
  toggle(LOCATIONS_ID, locations.toggle);
  control(ROTATE_CCW_ID, map.rotateCCW);
  control(ROTATE_CW_ID, map.rotateCW);
  control(ZOOM_IN_ID, map.zoomIn);
  control(ZOOM_OUT_ID, map.zoomOut);
  toggle(FULL_SCREEN_ID, display.toggle);
};

},{"./control":6,"./display":7,"./toggle":8}],10:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var map = require('map/map');
var locations = require('locations/locations');
var ui = require('ui/ui');

locations.init();
map.init();
ui(map, locations);

},{"locations/locations":2,"map/map":5,"ui/ui":9}]},{},[10]);
