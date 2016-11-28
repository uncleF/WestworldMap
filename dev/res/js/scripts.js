(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var animation = void 0;

/* Easing */

function cubicInOut(fraction) {
  return fraction < 0.5 ? 4 * Math.pow(fraction, 3) : (fraction - 1) * (2 * fraction - 2) * (2 * fraction - 2) + 1;
}

/* Utilities */

function calculateDeltaValue(value1, value2) {
  return value2 - value1;
}

function calculateDeltaValues(startValues, targetValues) {
  if (typeof startValues === 'number') {
    return calculateDeltaValue(startValues, targetValues);
  } else {
    return startValues.map(function (value, index) {
      return calculateDeltaValue(startValues[index], targetValues[index]);
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

},{}],2:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

var CANVAS_HOLDER_ID = 'map';

var SCENE_URL = '/res/models/placeholder.json';

var CAMERA_POSITION = [0, 200, -350];
var CAMERA_ANGLE = 45;
var CAMERA_NEAR = 0.1;
var CAMERA_FAR = 1000;

var LIGHT_POSITION = [0, 150, 500];
var LIGHT_COLOR = 0xFFFFFF;

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

var object = void 0;
var objectGeometry = void 0;

/* Get */

function getProperties() {
  return {
    renderer: renderer,
    scene: scene,
    camera: camera,
    light: light,
    object: object
  };
}

/* Initialization */

function setCanvasSize() {
  width = holderDOM.clientWidth;
  height = holderDOM.clientHeight;
}

function setupCanvas() {
  holderDOM = document.getElementById(CANVAS_HOLDER_ID);
  setCanvasSize();
}

function setRendererSize(width, height) {
  renderer.setSize(width, height);
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, castShadows: true });
  setRendererSize(width, height);
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

function addObject() {
  object = new THREE.Object3D();
  object.add(new THREE.Mesh(objectGeometry, new THREE.MeshNormalMaterial()));
  addLocationPoints();
  scene.add(object);
}

function setupObject() {
  return new Promise(function (resolve, reject) {
    var loader = new THREE.JSONLoader();
    loader.load(SCENE_URL, function (geometry) {
      objectGeometry = geometry;
      addObject();
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

},{}],3:[function(require,module,exports){
/* jshint browser:true */

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var eventManager = require('patterns/tx-event');
var canvas = require('./canvas');
var animation = require('./animation');
var uiEvents = require('./uiEvents');

module.exports = function (locationsData) {

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

  var PAN_STEP = 50;

  var CAMERA_TOP_POSITION = [0, 500, 0];
  var CAMERA_TOP_ROTATION = [-1.57069, 0, -3.14159];
  var CAMERA_PERSPECTIVE_POSITION = [0, 200, -350];
  var CAMERA_PERSPECTIVE_ROTATION = [-2.62244, 0, -3.14159];

  var renderer = void 0;
  var width = void 0;
  var height = void 0;

  var scene = void 0;

  var camera = void 0;
  var cameraStatus = void 0;
  var cameraSnapshotPosition = void 0;

  var light = void 0;

  var object = void 0;

  /* Get */

  function getMapRotation() {
    return [object.rotation.x, object.rotation.y % (Math.PI * 2), object.rotation.z];
  }

  function getMapDefaultRotation() {
    return [ROTATION_DEFAULT[0], Math.round(object.rotation.y / (Math.PI * 2)) * Math.PI * 2, ROTATION_DEFAULT[2]];
  }

  function getMapScale() {
    return object.scale.x;
  }

  function getCameraPosition() {
    return [camera.position.x, camera.position.y, camera.position.z];
  }

  function getCameraDefaultPosition() {
    return cameraStatus ? CAMERA_PERSPECTIVE_POSITION : CAMERA_TOP_POSITION;
  }

  /* Map Actions */

  function renderMap() {
    renderer.render(scene, camera);
    eventManager.trigger(document, EVENT_RENDER, false, 'UIEvent', { camera: camera, width: width, height: height });
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

  function scaleMap(factor) {
    factor = factor > SCALE_MAX ? SCALE_MAX : factor;
    factor = factor < SCALE_MIN ? SCALE_MIN : factor;
    object.scale.set(factor, factor, factor);
    renderMap();
  }

  function zoomInMap() {
    animation.go(TRANSITION_DURATION, getMapScale(), SCALE_STEP, scaleMap, true);
  }

  function zoomOutMap() {
    animation.go(TRANSITION_DURATION, getMapScale(), -SCALE_STEP, scaleMap, true);
  }

  /* Camera Actions */

  function shiftCamera(position) {
    camera.position.x = position;
    renderMap();
  }

  function panCamera(distance) {
    var position = cameraSnapshotPosition[0] + distance;
    shiftCamera(position);
  }

  function panCameraLeft() {
    animation.go(TRANSITION_DURATION, getCameraPosition()[0], -PAN_STEP, shiftCamera, true);
  }

  function panCameraRight() {
    animation.go(TRANSITION_DURATION, getCameraPosition()[0], PAN_STEP, shiftCamera, true);
  }

  /* Scene Actions */

  function sceneSnapshot() {
    cameraSnapshotPosition = getCameraPosition();
  }

  function changeScene(transformation) {
    var _camera$position, _object$rotation2;

    (_camera$position = camera.position).set.apply(_camera$position, _toConsumableArray(transformation.slice(0, 3)));
    (_object$rotation2 = object.rotation).set.apply(_object$rotation2, _toConsumableArray(transformation.slice(3, 6)));
    object.scale.set(transformation[6], transformation[6], transformation[6]);
    renderMap();
  }

  function resetScene() {
    var startValues = [].concat(_toConsumableArray(getCameraPosition()), _toConsumableArray(getMapRotation()), [getMapScale()]);
    var targetValues = [].concat(_toConsumableArray(getCameraDefaultPosition()), _toConsumableArray(getMapDefaultRotation()), [SCALE_DEFAULT]);
    animation.go(TRANSITION_DURATION, startValues, targetValues, changeScene);
  }

  /* Views */

  function transformCamera(positionRotation) {
    var _camera$position2, _camera$rotation;

    (_camera$position2 = camera.position).set.apply(_camera$position2, _toConsumableArray(positionRotation.slice(0, 3)));
    (_camera$rotation = camera.rotation).set.apply(_camera$rotation, _toConsumableArray(positionRotation.slice(3)));
    renderMap();
  }

  function moveCameraTop() {
    var startValues = [].concat(_toConsumableArray(getCameraPosition()), CAMERA_PERSPECTIVE_ROTATION);
    var targetValues = [].concat(CAMERA_TOP_POSITION, CAMERA_TOP_ROTATION);
    animation.go(TRANSITION_DURATION, startValues, targetValues, transformCamera);
  }

  function moveCameraPerspective() {
    var startValues = [].concat(_toConsumableArray(getCameraPosition()), CAMERA_TOP_ROTATION);
    var targetValues = [].concat(CAMERA_PERSPECTIVE_POSITION, CAMERA_PERSPECTIVE_ROTATION);
    animation.go(TRANSITION_DURATION, startValues, targetValues, transformCamera);
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

  /* Map Initialization */

  function setupMap(properties) {
    renderer = properties.renderer;
    scene = properties.scene;
    camera = properties.camera;
    light = properties.light;
    object = properties.object;
    var _renderer$domElement = renderer.domElement;
    width = _renderer$domElement.width;
    height = _renderer$domElement.height;

    cameraStatus = true;
    return Promise.resolve();
  }

  return canvas.init(locationsData).then(setupMap).then(uiEvents).then(renderMap);
};

},{"./animation":1,"./canvas":2,"./uiEvents":4,"patterns/tx-event":8}],4:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

module.exports = function (tasks) {

  /* UI Events */

  eventManager.bind(document, uiEvents.topDown, tasks.topDown);
  eventManager.bind(document, uiEvents.mapuirotate, tasks.mapuirotate);
  eventManager.bind(document, uiEvents.mapuiccwrotate, tasks.mapuiccwrotate);
  eventManager.bind(document, uiEvents.mapuicwrotate, tasks.mapuicwrotate);
  eventManager.bind(document, uiEvents.mapuipan, tasks.mapuipan);
  eventManager.bind(document, uiEvents.mapuipanleft, tasks.mapuipanleft);
  eventManager.bind(document, uiEvents.mapuipanright, tasks.mapuipanright);
  eventManager.bind(document, uiEvents.mapuizoom, tasks.mapuizoom);
  eventManager.bind(document, uiEvents.mapuizoomin, tasks.mapuizoomin);
  eventManager.bind(document, uiEvents.mapuizoomout, tasks.mapuizoomout);
  eventManager.bind(document, uiEvents.reset, tasks.reset);

  /* Window Events */

  eventManager.bind(window, 'resize', tasks.resize);
};

},{"patterns/tx-event":8,"ui/uiEvents":18}],5:[function(require,module,exports){
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

},{"patterns/tx-createNode":7}],6:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var mapLocation = require('./mapLocation');
var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var LOCATIONS_ID = 'locations';
var ACTIVE_CLASS_NAME = 'locations-is-active';

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

module.exports = function (_) {

  var dom = void 0;
  var locations = void 0;

  function toggleLocations() {
    dom.classList.toggle(ACTIVE_CLASS_NAME);
  }

  function translateLocations(event) {
    locations.forEach(function (currentLocation) {
      currentLocation.project(event.data);
    });
  }

  function appendLocations() {
    var container = document.createDocumentFragment();
    locations.forEach(function (currentLocation) {
      container.appendChild(currentLocation.dom());
    });
    dom.appendChild(container);
  }

  function generateMapLocations() {}

  function initializeEvents() {
    eventManager.bind(document, 'maprender', translateLocations);
    eventManager.bind(document, uiEvents.locations, toggleLocations);
  }

  function initilizeLocations() {
    dom = document.getElementById(LOCATIONS_ID);
    locations = locationsData.map(function (locationData) {
      return mapLocation(locationData);
    });
  }

  initilizeLocations();
  appendLocations();
  initializeEvents();
  return Promise.resolve(generateMapLocations());
};

},{"./mapLocation":5,"patterns/tx-event":8,"ui/uiEvents":18}],7:[function(require,module,exports){
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

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

function enterFullScreen() {
  document.documentElement.webkitRequestFullscreen();
}

function exitFullScreen() {
  document.webkitExitFullscreen();
}

function onUIFullscreen() {
  if (!document.webkitFullscreenElement) {
    enterFullScreen();
  } else {
    exitFullScreen();
  }
}

module.exports = function (_) {
  eventManager.bind(document, uiEvents.fullscreen, onUIFullscreen);
};

},{"patterns/tx-event":8,"ui/uiEvents":18}],10:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

function onUIHelp() {
  console.log('Help');
}

module.exports = function (_) {
  eventManager.bind(document, uiEvents.help, onUIHelp);
};

},{"patterns/tx-event":8,"ui/uiEvents":18}],11:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');

function onClick(event, uiEvent) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvent, false, 'UIEvent');
}

module.exports = function (id, uiEvent) {
  var dom = document.getElementById(id);
  eventManager.bind(dom, 'click', function (event) {
    return onClick(event, uiEvent);
  });
};

},{"patterns/tx-event":8}],12:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var KEY_EVENTS = {
  32: uiEvents.locations,
  49: uiEvents.topDown,
  33: uiEvents.rotateCCW,
  34: uiEvents.rotateCW,
  37: uiEvents.panLeft,
  39: uiEvents.panRight,
  38: uiEvents.zoomIn,
  40: uiEvents.zoomOut
};

function onKeyDown(event) {
  var keyCode = event.keyCode;
  if (KEY_EVENTS[keyCode]) {
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, KEY_EVENTS[keyCode], false, 'UIEvent');
  }
}

module.exports = function (_) {
  eventManager.bind(document, 'keydown', onKeyDown);
};

},{"patterns/tx-event":8,"ui/uiEvents":18}],13:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var CATCHER_ID = 'locations';

var MOUSE_EVENTS = {
  0: uiEvents.rotate,
  2: uiEvents.pan
};

function onMouseMove(event, position) {
  requestAnimationFrame(function (_) {
    var button = event.button;
    var delta = {
      x: position.x - event.clientX,
      y: position.y - event.clientY
    };
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, MOUSE_EVENTS[button], false, 'UIEvent', { delta: delta });
  });
}

function onMouseUp(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'mousemove');
  eventManager.unbind(document, 'mouseup', onMouseUp);
}

function onMouseDown(event) {
  var position = {
    x: event.clientX,
    y: event.clientY
  };
  event.preventDefault();
  event.stopPropagation();
  eventManager.bind(document, 'mousemove', function (event) {
    return onMouseMove(event, position);
  });
  eventManager.bind(document, 'mouseup', onMouseUp);
}

function onWheel(event) {
  requestAnimationFrame(function (_) {
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, uiEvents.zoom, false, 'UIEvent', { delta: event.deltaY });
  });
}

function onContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
}

module.exports = function (_) {
  var catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'mousedown', onMouseDown, false);
  eventManager.bind(catcher, 'wheel', onWheel, false);
  eventManager.bind(catcher, 'contextmenu', onContextMenu, false);
};

},{"patterns/tx-event":8,"ui/uiEvents":18}],14:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var control = require('./control');
var toggle = require('./toggle');
var uiEvents = require('ui/uiEvents');

var LOCATIONS_ID = 'showLocations';
var TOP_DOWN_ID = 'showTopDown';
var ROTATE_CCW_ID = 'rotateCCW';
var ROTATE_CW_ID = 'rotateCW';
var ZOOM_IN_ID = 'zoomIn';
var ZOOM_OUT_ID = 'zoomOut';
var RESET_ID = 'reset';
var FULL_SCREEN_ID = 'fullScreen';
var HELP_ID = 'showHelp';

module.exports = function (_) {

  /* Panel Initialization */

  toggle(LOCATIONS_ID, uiEvents.locations);
  toggle(TOP_DOWN_ID, uiEvents.topDown);
  control(ROTATE_CCW_ID, uiEvents.rotateCCW);
  control(ROTATE_CW_ID, uiEvents.rotateCW);
  control(ZOOM_OUT_ID, uiEvents.zoomOut);
  control(ZOOM_IN_ID, uiEvents.zoomIn);
  control(RESET_ID, uiEvents.reset);
  toggle(FULL_SCREEN_ID, uiEvents.fullscreen);
  control(HELP_ID, uiEvents.help);
};

},{"./control":11,"./toggle":15,"ui/uiEvents":18}],15:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');

var ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

function onClick(event, uiEvent, dom, activeClass) {
  event.preventDefault();
  event.stopPropagation();
  dom.classList.toggle(activeClass);
  eventManager.trigger(document, uiEvent, false, 'UIEvent');
}

module.exports = function (id, uiEvent) {
  var dom = document.getElementById(id);
  var activeClass = '' + id + ACTIVE_CLASS_NAME_SUFFIX;
  dom.addEventListener('click', function (event) {
    return onClick(event, uiEvent, dom, activeClass);
  });
};

},{"patterns/tx-event":8}],16:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var CATCHER_ID = 'locations';

var TOUCH_THRESHOLD = 120;

function calculateDeltaPosition(touchesStart, touchesMove) {
  return touchesStart[0].clientX - touchesMove[0].clientX;
}

function calculateDistance(touches) {
  return Math.sqrt(Math.pow(touches[1].clientX - touches[0].clientX, 2) + Math.pow(touches[1].clientY - touches[0].clientY, 2));
}

function onSingleToucheMove(touchesStart, touchesMove) {
  var delta = calculateDeltaPosition(touchesStart, touchesMove);
  eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', { delta: delta });
}

function onDoubleTouchMove(touchesStart, touchesMove) {
  var deltaPosition = calculateDeltaPosition(touchesStart, touchesMove);
  var distance = calculateDistance(touchesMove);
  if (distance <= TOUCH_THRESHOLD) {
    eventManager.trigger(document, uiEvents.pan, false, 'UIEvent', { delta: deltaPosition });
  } else {
    eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', { distance: distance });
  }
}

function onGesture(event, touches, distance) {
  requestAnimationFrame(function (_) {
    if (touches.length === 1) {
      onSingleToucheMove();
    } else {
      onDoubleTouchMove();
    }
  });
}

function onTouchEnd(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'touchmove');
  eventManager.unbind(document, 'touchend', onTouchEnd);
}

function onTouchStart(event) {
  var touches = event.touches;
  var distance = calculateDistance(touches);
  event.preventDefault();
  event.stopPropagation();
  eventManager.bind(document, 'touchmove', function (event) {
    return onGesture(event, touches, distance);
  });
  eventManager.bind(document, 'touchend', onTouchEnd);
}

module.exports = function (_) {
  var catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'touchstart', onTouchStart, false);
};

},{"patterns/tx-event":8,"ui/uiEvents":18}],17:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var panel = require('./input/panel');
var keyboard = require('./input/keyboard');
var mouse = require('./input/mouse');
var touch = require('./input/touch');

var display = require('./display');
var help = require('./help');

module.exports = function (locations, map) {

  /* Input Options */

  panel();
  keyboard();
  mouse();
  touch();

  /* UI */

  display();
  help();
};

},{"./display":9,"./help":10,"./input/keyboard":12,"./input/mouse":13,"./input/panel":14,"./input/touch":16}],18:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = {
  locations: 'locationsuichange',
  topDown: 'mapuitopdown',
  rotate: 'mapuirotate',
  rotateCCW: 'mapuiccwrotate',
  rotateCW: 'mapuicwrotate',
  pan: 'mapuipan',
  panLeft: 'mapuipanleft',
  panRight: 'mapuipanright',
  zoom: 'mapuizoom',
  zoomIn: 'mapuizoomin',
  zoomOut: 'mapuizoomout',
  reset: 'mapuireset',
  fullscreen: 'fullscreenuichange',
  help: 'helpuichange'
};

},{}],19:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var mapLocations = require('mapLocations/mapLocations');
var map = require('map/map');
var ui = require('ui/ui');

mapLocations().then(map).then(ui);

},{"map/map":3,"mapLocations/mapLocations":6,"ui/ui":17}]},{},[19]);
