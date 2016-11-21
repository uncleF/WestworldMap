(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

var createNode = require('patterns/tx-createNode');

module.exports = function (locationData) {

  var TEMPLATE_NAME_PHOLDER = '{{ NAME }}';
  var TEMPLATE_DESC_PHOLDER = '{{ DESC }}';
  var TEMPLATE = '<a href="#" class="location">\n                      <span class="locationInfo">\n                        <span class="locationName">' + TEMPLATE_NAME_PHOLDER + '</span>\n                        <span class="locationDescription">' + TEMPLATE_DESC_PHOLDER + '</span>\n                      </span>\n                    </a>';

  var name = void 0;
  var description = void 0;
  var picture = void 0;
  var position = void 0;
  var vector = void 0;
  var dom = void 0;

  function getLocation() {
    return {
      name: getLocationName(),
      description: getLocationDescription(),
      picture: getLocationPicture()
    };
  }

  function getLocationName() {
    return name;
  }

  function getLocationDescription() {
    return description;
  }

  function getLocationPicture() {
    return picture;
  }

  function getLocationPosition() {
    return position;
  }

  function getLocationVector() {
    return vector;
  }

  function getLocationDOM() {
    return dom;
  }

  function createLocationDOM() {
    var html = TEMPLATE.replace(TEMPLATE_NAME_PHOLDER, getLocationName()).replace(TEMPLATE_DESC_PHOLDER, getLocationDescription());
    dom = createNode(html);
  }

  function normalizeProjection(projection, data) {
    return {
      x: Math.round((projection.x + 1) * data.width / 2),
      y: Math.round((-projection.y + 1) * data.height / 2)
    };
  }

  function translateLocation(newPosition) {
    getLocationDOM().style.transform = 'translateY(50%) translateX(' + newPosition.x + 'px) translateY(' + newPosition.y + 'px)';
  }

  function projectLocation(data) {
    var projectionVector = new THREE.Vector3().setFromMatrixPosition(getLocationVector().matrixWorld).project(data.camera);
    translateLocation(normalizeProjection(projectionVector, data));
  }

  function pointLocation(locationVector) {
    vector = locationVector;
  }

  name = locationData.name;
  description = locationData.description;
  picture = locationData.picture;
  position = locationData.position;

  createLocationDOM();

  return {
    info: getLocation,
    name: getLocationName,
    picture: getLocationPicture,
    position: getLocationPosition,
    vector: getLocationVector,
    dom: getLocationDOM,
    project: projectLocation,
    point: pointLocation
  };
};

},{"patterns/tx-createNode":7}],2:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var location = require('./location');
var eventTool = require('patterns/tx-event');

var LOCATIONS_ID = 'locations';
var ACTIVE_CLASS_NAME = 'locations-is-active';

var locations = void 0;
var dom = void 0;

/* Mock Locations */

var locationsData = [{
  name: 'Sweetwater',
  description: 'Has a train station',
  picture: '#',
  position: { x: 0, y: 30, z: 20 }
}, {
  name: 'Pariah',
  description: 'One giant brothel',
  picture: '#',
  position: { x: 60, y: 15, z: 15 }
}];

/* Actions */

function toggleLocations() {
  dom.classList.toggle(ACTIVE_CLASS_NAME);
}

function translateLocations(event) {
  locations.forEach(function (currentLocation) {
    currentLocation.project(event.data);
  });
}

/* Events */

function initializeEvents() {
  eventTool.bind(document, 'maprender', translateLocations);
}

/* Initialization */

function appendLocations() {
  var container = document.createDocumentFragment();
  locations.forEach(function (currentLocation) {
    container.appendChild(currentLocation.dom());
  });
  dom.appendChild(container);
}

function setupLocations() {
  locations = locationsData.map(function (locationData) {
    return location(locationData);
  });
  appendLocations();
}

function initializeLocations() {
  dom = document.getElementById(LOCATIONS_ID);
  setupLocations();
  initializeEvents();
  return Promise.resolve(locations);
}

/* Interface */

exports.init = initializeLocations;
exports.toggle = toggleLocations;

},{"./location":1,"patterns/tx-event":8}],3:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var animation = void 0;

/* Easing */

function cubicInOut(fraction) {
  return fraction < 0.5 ? 4 * Math.pow(fraction, 3) : (fraction - 1) * (2 * fraction - 2) * (2 * fraction - 2) + 1;
}

/* Utilities */

function calculateDeltaValues(startValues, targetValues) {
  if (typeof startValues === 'number') {
    return targetValues - startValues;
  } else {
    return startValues.map(function (value, index) {
      return targetValues[index] - startValues[index];
    });
  }
}

function calculateNewValues(startValues, deltaValues, fraction) {
  if (typeof startValues === 'number') {
    return startValues + deltaValues * fraction;
  } else {
    return startValues.map(function (value, index) {
      return startValues[index] + deltaValues[index] * fraction;
    });
  }
}

/* Animation */

function progressAnimation(startTime, duration, startValues, deltaValues, fraction, task) {
  var adjustedFraction = cubicInOut(fraction);
  var newValues = calculateNewValues(startValues, deltaValues, adjustedFraction);
  task(newValues);
  runAnimation(startTime, duration, startValues, deltaValues, task);
}

function completeAnimation(startValues, deltaValues, fraction, task) {
  var newValues = calculateNewValues(startValues, deltaValues, fraction);
  task(newValues);
}

function runAnimation(startTime, duration, startValues, deltaValues, task) {
  animation = requestAnimationFrame(function (_) {
    var fraction = (Date.now() - startTime) / duration;
    if (fraction < 1) {
      progressAnimation(startTime, duration, startValues, deltaValues, fraction, task);
    } else {
      completeAnimation(startValues, deltaValues, 1, task);
    }
  });
}

/* Actions */

function stop() {
  if (animation) {
    cancelAnimationFrame(animation);
  }
}

function go(duration, startValues, targetValues, task, relative) {
  var deltaValues = relative ? targetValues : calculateDeltaValues(startValues, targetValues);
  stop();
  runAnimation(Date.now(), duration, startValues, deltaValues, task);
}

/* Interface */

exports.stop = stop;
exports.go = go;

},{}],4:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

var CANVAS_HOLDER_ID = 'map';

var SCENE_URL = '/res/models/placeholder.json';

var CAMERA_ANGLE = 45;
var CAMERA_NEAR = 0.1;
var CAMERA_FAR = 1000;
var CAMERA_POSITION = [0, 200, 350];

var LIGHT_COLOR = 0xFFFFFF;
var LIGHT_POSITION = [0, 150, 500];

var holderDOM = void 0;
var width = void 0;
var height = void 0;

var locations = void 0;

var renderer = void 0;

var scene = void 0;

var camera = void 0;
var cameraAngle = void 0;
var cameraAspect = void 0;
var cameraNear = void 0;
var cameraFar = void 0;

var light = void 0;

var world = void 0;

var object = void 0;

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
  renderer = new THREE.WebGLRenderer({ antialias: true, castShadows: true });
  renderer.setSize(width, height);
}

function setupScene() {
  scene = new THREE.Scene();
}

function setupCamera() {
  var _camera$position;

  cameraAngle = CAMERA_ANGLE;
  cameraAspect = width / height;
  cameraNear = CAMERA_NEAR;
  cameraFar = CAMERA_FAR;
  camera = new THREE.PerspectiveCamera(cameraAngle, cameraAspect, cameraNear, cameraFar);
  (_camera$position = camera.position).set.apply(_camera$position, CAMERA_POSITION);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);
}

function setupLights() {
  var _light$position;

  light = new THREE.PointLight(LIGHT_COLOR);
  (_light$position = light.position).set.apply(_light$position, LIGHT_POSITION);
  scene.add(light);
}

function addWorld() {
  world = new THREE.Object3D();
  scene.add(world);
}

function addLocationPoint(currentLocation) {
  var position = currentLocation.position();
  var point = new THREE.Object3D();
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
  return new Promise(function (resolve, reject) {
    var loader = new THREE.JSONLoader();
    loader.load(SCENE_URL, function (geometry) {
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
  return setupObject().then(setupDOM).then(getProperties);
}

/* Interface */

exports.init = inititalizeCanvas;

},{}],5:[function(require,module,exports){
/* jshint browser:true */

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var canvas = require('./canvas');
var animation = require('./animation');
var panorama = require('./panorama');
var eventTool = require('patterns/tx-event');

var ROTATION_DEFAULT = [0, 0, 0];
var ROTATION_STEP = Math.PI / 180 * 30;
var ROTATION_CCW_STEP = [0, ROTATION_STEP, 0];
var ROTATION_CW_STEP = [0, -ROTATION_STEP, 0];

var SCALE_DEFAULT = 1;
var SCALE_STEP = 0.25;
var SCALE_MAX = 4;
var SCALE_MIN = 0.25;

var TRANSITION_DURATION = 300;

var EVENT_RENDER = 'maprender';

var CAMERA_TOP_POSITION = [0, 500, 0];
var CAMERA_TOP_ROTATION = [-1.57069, 0, 0];
var CAMERA_PERSPECTIVE_POSITION = [0, 200, 350];
var CAMERA_PERSPECTIVE_ROTATION = [-0.5191, 0, 0];

var renderer = void 0;
var width = void 0;
var height = void 0;

var scene = void 0;

var camera = void 0;
var cameraStatus = void 0;

var light = void 0;

var world = void 0;

var object = void 0;

/* Get */

function getMapRotation() {
  return [object.rotation.x, object.rotation.y, object.rotation.z];
}

function getMapScale() {
  return object.scale.x;
}

/* Map Actions */

function renderMap() {
  renderer.render(scene, camera);
  triggerRenderEvent();
}

function rotateMap(angles) {
  var _object$rotation;

  (_object$rotation = object.rotation).set.apply(_object$rotation, _toConsumableArray(angles));
  renderMap();
}

function rotateMapCCW() {
  animation.go(TRANSITION_DURATION, getMapRotation(), ROTATION_CCW_STEP, rotateMap, true);
}

function rotateMapCW() {
  animation.go(TRANSITION_DURATION, getMapRotation(), ROTATION_CW_STEP, rotateMap, true);
}

function zoomMap(factor) {
  factor = factor > SCALE_MAX ? SCALE_MAX : factor;
  factor = factor < SCALE_MIN ? SCALE_MIN : factor;
  object.scale.set(factor, factor, factor);
  renderMap();
}

function zoomInMap() {
  animation.go(TRANSITION_DURATION, getMapScale(), SCALE_STEP, zoomMap, true);
}

function zoomOutMap() {
  animation.go(TRANSITION_DURATION, getMapScale(), -SCALE_STEP, zoomMap, true);
}

function scaleRotateMap(anglesFactor) {
  zoomMap(anglesFactor.pop());
  rotateMap(anglesFactor);
  renderMap();
}

function resetMap() {
  var startValues = [].concat(_toConsumableArray(getMapRotation()), [getMapScale()]);
  var targetValues = [].concat(ROTATION_DEFAULT, [SCALE_DEFAULT]);
  animation.go(TRANSITION_DURATION, startValues, targetValues, scaleRotateMap);
}

/* Views */

function positionRotateCamera(positionRotation) {
  camera.position.set(positionRotation[0], positionRotation[1], positionRotation[2]);
  camera.rotation.set(positionRotation[3], positionRotation[4], positionRotation[5]);
  renderMap();
}

function moveCameraTop() {
  var startValues = [].concat(CAMERA_PERSPECTIVE_POSITION, CAMERA_PERSPECTIVE_ROTATION);
  var targetValues = [].concat(CAMERA_TOP_POSITION, CAMERA_TOP_ROTATION);
  animation.go(TRANSITION_DURATION, startValues, targetValues, positionRotateCamera);
}

function moveCameraPerspective() {
  var startValues = [].concat(CAMERA_TOP_POSITION, CAMERA_TOP_ROTATION);
  var targetValues = [].concat(CAMERA_PERSPECTIVE_POSITION, CAMERA_PERSPECTIVE_ROTATION);
  animation.go(TRANSITION_DURATION, startValues, targetValues, positionRotateCamera);
}

function toggleTopDownView() {
  if (cameraStatus) {
    moveCameraTop();
    cameraStatus = false;
  } else {
    moveCameraPerspective();
    cameraStatus = true;
  }
}

function togglePanoramaView() {
  panorama.toggle();
}

/* Map Events */

function triggerRenderEvent() {
  var data = {
    camera: camera,
    width: width,
    height: height
  };
  eventTool.trigger(document, EVENT_RENDER, false, 'UIEvent', data);
}

/* Map Initialization */

function setupMap(properties) {
  renderer = properties.renderer;
  scene = properties.scene;
  camera = properties.camera;
  light = properties.light;
  world = properties.world;
  object = properties.object;

  width = renderer.domElement.width;
  height = renderer.domElement.height;
  cameraStatus = true;
  return Promise.resolve();
}

function initializeMap(locations) {
  return canvas.init(locations).then(setupMap).then(renderMap);
}

/* Interface */

exports.init = initializeMap;
exports.getRotation = getMapRotation;
exports.getScale = getMapScale;
exports.render = renderMap;
exports.rotate = rotateMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoom = zoomMap;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.reset = resetMap;
exports.toggleTopView = toggleTopDownView;
exports.togglePanorama = togglePanoramaView;

},{"./animation":3,"./canvas":4,"./panorama":6,"patterns/tx-event":8}],6:[function(require,module,exports){
/* jshint browser:true */

'use strict';

function togglePanorama() {
  console.log('Panorama');
}

exports.toggle = togglePanorama;

},{}],7:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = function (html) {
  var element = document.createElement('div');
  element.innerHTML = html;
  return element.firstChild;
};

},{}],8:[function(require,module,exports){
/* jshint browser:true */

'use strict';

/* Event Data */

function setData(event, data) {
  event.data = data;
  return event;
}

function getData(event) {
  return event.data;
}

/* Event Binding */

function bind(object, type, callback) {
  object.addEventListener(type, callback);
}

function unbind(object, type, callback) {
  object.removeEventListener(type, callback);
}

/* Event Trigger */

function triggerCreateEvent(object, eventName, propagate, eventType, data) {
  var event = document.createEvent(eventType);
  if (data) {
    setData(event, data);
  }
  event.initEvent(eventName, propagate, false);
  object.dispatchEvent(event);
}

function triggerCreateEventObject(object, eventName, propagate, data) {
  var event = document.createEventObject();
  if (data) {
    setData(event, data);
  }
  object.fireEvent('on' + eventName, event);
}

function trigger(object, eventName, propagate, eventType, data) {
  propagate = propagate || false;
  eventType = eventType || 'MouseEvents';
  if (document.createEvent) {
    triggerCreateEvent(object, eventName, propagate, eventType, data);
  } else {
    triggerCreateEventObject(object, eventName, propagate, data);
  }
}

/* Event Target */

function target(event) {
  return event.target;
}

/* Interface */

exports.getData = getData;
exports.bind = bind;
exports.unbind = unbind;
exports.trigger = trigger;
exports.target = target;

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
/* jshint browser:true */

'use strict';

function toggleHelp() {
  console.log('Help');
}

exports.toggle = toggleHelp;

},{}],12:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventTool = require('patterns/tx-event');

module.exports = function (map, locations) {

  var KEY_ACTIONS = {
    32: locations.toggle,
    37: map.rotateCCW,
    39: map.rotateCW,
    38: map.zoomIn,
    40: map.zoomOut
  };

  /* Interactions */

  function onKeyDown(event) {
    var key = event.keyCode;
    if (KEY_ACTIONS[key]) {
      event.preventDefault();
      event.stopPropagation();
      KEY_ACTIONS[key]();
    }
  }

  /* Initialization */

  eventTool.bind(document, 'keydown', onKeyDown);
};

},{"patterns/tx-event":8}],13:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventTool = require('patterns/tx-event');

var CATCHER_ID = 'locations';

var ROTATION_STEP = 0.005;
var SCALE_STEP = 0.01;

module.exports = function (map) {

  var catcher = void 0;

  var startPosition = void 0;
  var startRotation = void 0;

  /* Interactions */

  function onMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(function (_) {
      var currentPosition = event.clientX;
      var currentAngle = startRotation[1] + (startPosition - currentPosition) * ROTATION_STEP;
      var currentRotation = [startRotation[0], currentAngle, startRotation[2]];
      map.rotate(currentRotation);
    });
  }

  function onMouseUp() {
    eventTool.unbind(document, 'mousemove', onMouseMove);
    eventTool.unbind(document, 'mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    event.preventDefault();
    startPosition = event.clientX;
    startRotation = map.getRotation();
    eventTool.bind(document, 'mousemove', onMouseMove);
    eventTool.bind(document, 'mouseup', onMouseUp);
  }

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    var startScale = map.getScale();
    var deltaScale = event.deltaY > 0 ? SCALE_STEP : -SCALE_STEP;
    map.zoom(startScale + deltaScale * 2);
  }

  /* Inititalization */

  catcher = document.getElementById(CATCHER_ID);
  eventTool.bind(catcher, 'mousedown', onMouseDown);
  eventTool.bind(catcher, 'wheel', onWheel);
  return Promise.resolve();
};

},{"patterns/tx-event":8}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventTool = require('patterns/tx-event');

var CATCHER_ID = 'locations';

var ROTATION_STEP = 0.005;
var SCALE_STEP = 0.01;

module.exports = function (map) {

  var catcher = void 0;

  var startPosition = void 0;
  var startRotation = void 0;
  var startDistance = void 0;
  var startScale = void 0;

  /* Utilities */

  function calculateDistance(touches) {
    return Math.sqrt(Math.pow(touches[1].clientX - touches[0].clientX, 2) + Math.pow(touches[1].clientY - touches[0].clientY, 2));
  }

  /* Actions */

  function singleTouchMove(event) {
    requestAnimationFrame(function (_) {
      var currentPosition = event.touches[0].clientX;
      var currentAngle = startRotation[1] + (startPosition - currentPosition) * ROTATION_STEP;
      var currentRotation = [startRotation[0], currentAngle, startRotation[2]];
      map.rotate(currentRotation);
    });
  }

  function doubleTouchMove(event) {
    requestAnimationFrame(function (_) {
      var currentDistance = calculateDistance(event.touches);
      var currentScale = startScale + (currentDistance - startDistance) * SCALE_STEP;
      map.zoom(currentScale);
    });
  }

  function singleTouchStart(event) {
    startPosition = event.touches[0].clientX;
    startRotation = map.getRotation();
  }

  function doubleTouchStart(event) {
    startDistance = calculateDistance(event.touches);
    startScale = map.getScale();
  }

  /* Interactions */

  function onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length > 1) {
      doubleTouchStart(event);
    } else {
      singleTouchStart(event);
    }
  }

  function onTouchMove(event) {
    event.preventDefault();
    if (event.touches.length > 1) {
      doubleTouchMove(event);
    } else {
      singleTouchMove(event);
    }
  }

  /* Inititalization */

  catcher = document.getElementById(CATCHER_ID);
  eventTool.bind(catcher, 'touchstart', onTouchStart, true);
  eventTool.bind(catcher, 'touchmove', onTouchMove, true);
  return Promise.resolve();
};

},{"patterns/tx-event":8}],16:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var control = require('./control');
var toggle = require('./toggle');
var display = require('./display');
var keyboard = require('./keyboard');
var mouse = require('./mouse');
var touch = require('./touch');
var help = require('./help');

// const WESTWORLD_ID = 'westworld';
var LOCATIONS_ID = 'showLocations';
var PANORAMA_ID = 'panorama';
var ROTATE_CCW_ID = 'rotateCCW';
var ROTATE_CW_ID = 'rotateCW';
var ZOOM_IN_ID = 'zoomIn';
var ZOOM_OUT_ID = 'zoomOut';
var RESET_ID = 'reset';
var TOP_DOWN_ID = 'topDown';
var FULL_SCREEN_ID = 'fullScreen';
var HELP_ID = 'help';

module.exports = function (locations, map) {

  function controlPanel() {
    // toggle(WESTWORLD_ID, _ => {});
    toggle(LOCATIONS_ID, locations.toggle);
    toggle(TOP_DOWN_ID, map.toggleTopView);
    // toggle(PANORAMA_ID, map.togglePanorama);
    control(ROTATE_CCW_ID, map.rotateCCW);
    control(ROTATE_CW_ID, map.rotateCW);
    control(ZOOM_OUT_ID, map.zoomOut);
    control(ZOOM_IN_ID, map.zoomIn);
    control(RESET_ID, map.reset);
    toggle(FULL_SCREEN_ID, display.toggle);
    control(HELP_ID, help.toggle);
  }

  /* UI Initialization */

  controlPanel();
  keyboard(map, locations);
  mouse(map);
  touch(map);
};

},{"./control":9,"./display":10,"./help":11,"./keyboard":12,"./mouse":13,"./toggle":14,"./touch":15}],17:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var map = require('map/map');
var locations = require('locations/locations');
var ui = require('ui/ui');

locations.init().then(map.init).then(function (_) {
  return ui(locations, map);
});

},{"locations/locations":2,"map/map":5,"ui/ui":16}]},{},[17]);
