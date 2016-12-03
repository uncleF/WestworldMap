(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var createNode = require('patterns/tx-createNode');

var TEMPLATE_NAME_PHOLDER = '{{ NAME }}';
var TEMPLATE_DESC_PHOLDER = '{{ DESC }}';
var TEMPLATE = '<a href="#" class="location">\n                    <span class="locationInfo">\n                      <span class="locationName">' + TEMPLATE_NAME_PHOLDER + '</span>\n                      <span class="locationDescription">' + TEMPLATE_DESC_PHOLDER + '</span>\n                    </span>\n                  </a>';

var LOCATION_HIDDEN_CLASS = 'location-is-hidden';

module.exports = function (locationData) {

  var dom = void 0;
  var name = void 0;
  var description = void 0;
  var picture = void 0;
  var position = void 0;

  /* Get */

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

  function getLocationDOM() {
    return dom;
  }

  function getLocation() {
    return {
      name: getLocationName(),
      description: getLocationDescription(),
      picture: getLocationPicture()
    };
  }

  /* Actions */

  function hideLocation() {
    getLocationDOM().classList.add(LOCATION_HIDDEN_CLASS);
  }

  function showLocation() {
    getLocationDOM().classList.remove(LOCATION_HIDDEN_CLASS);
  }

  function projectLocation(newPosition) {
    if (newPosition.visibility) {
      showLocation();
    } else {
      hideLocation();
    }
    getLocationDOM().style.transform = 'translateY(50%) translateX(' + newPosition.position.x + 'px) translateY(' + newPosition.position.y + 'px) translateZ(0)';
  }

  /* Initialization */

  function createLocationDOM() {
    var html = TEMPLATE.replace(TEMPLATE_NAME_PHOLDER, getLocationName()).replace(TEMPLATE_DESC_PHOLDER, getLocationDescription());
    dom = createNode(html);
  }

  name = locationData.name;
  description = locationData.description;
  picture = locationData.picture;
  position = locationData.position;

  createLocationDOM();

  /* Interface */

  return {
    info: getLocation,
    name: getLocationName,
    picture: getLocationPicture,
    position: getLocationPosition,
    dom: getLocationDOM,
    project: projectLocation
  };
};

},{"patterns/tx-createNode":6}],2:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var mapLocation = require('./location');
var eventManager = require('patterns/tx-event');
var download = require('utilities/download');
var uiEvents = require('ui/uiEvents');

var LOCATIONS_DATA_URL = '/data/locations.json';

var LOCATIONS_ID = 'locations';
var ACTIVE_CLASS_NAME = 'locations-is-active';

module.exports = function (_) {

  var dom = void 0;
  var locations = void 0;

  /* Get */

  function getDOM() {
    return dom;
  }

  function getLocations() {
    return locations;
  }

  /* Actions */

  function toggleLocations() {
    getDOM().classList.toggle(ACTIVE_CLASS_NAME);
  }

  function projectLocations(event) {
    locations.forEach(function (currentLocation, index) {
      return currentLocation.project(event.data.newPositions[index]);
    });
  }

  function generateMapLocations() {
    return getLocations().map(function (mapLocation) {
      return mapLocation.position();
    });
  }

  /* Inititalization */

  function onMapRender(event) {
    requestAnimationFrame(function (_) {
      projectLocations(event);
    });
  }

  function onLocationsChange() {
    toggleLocations();
  }

  function initializeEvents() {
    eventManager.bind(document, 'maprender', onMapRender);
    eventManager.bind(document, uiEvents.locations, onLocationsChange);
  }

  function appendLocations() {
    var container = document.createDocumentFragment();
    getLocations().forEach(function (currentLocation) {
      return container.appendChild(currentLocation.dom());
    });
    getDOM().appendChild(container);
  }

  function initilizeLocations(data) {
    dom = document.getElementById(LOCATIONS_ID);
    locations = data.map(function (locationData) {
      return mapLocation(locationData);
    });
  }

  function initialization(data) {
    initilizeLocations(data);
    appendLocations();
    initializeEvents();
    return generateMapLocations();
  }

  return download(LOCATIONS_DATA_URL).then(initialization);
};

},{"./location":1,"patterns/tx-event":7,"ui/uiEvents":20,"utilities/download":21}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');
var errorMessages = require('ui/errorMessages');

var GEOMETRY_URL = '/models/placeholder.json';

var CANVAS_HOLDER_ID = 'map';

var CAMERA_POSITION = [0, 200, -350];
var CAMERA_ANGLE = 45;
var CAMERA_NEAR = 0.1;
var CAMERA_FAR = 1000;

var LIGHT_POSITION = [0, 150, 500];
var LIGHT_COLOR = 0xFFFFFF;

module.exports = function (locationsData) {

  var width = void 0;
  var height = void 0;

  var dom = void 0;

  var renderer = void 0;

  var scene = void 0;

  var camera = void 0;
  var cameraAngle = void 0;
  var cameraAspect = void 0;
  var cameraNear = void 0;
  var cameraFar = void 0;

  var light = void 0;

  var raycaster = void 0;

  var object = void 0;

  var points = void 0;

  /* Initialization */

  function setupCanvas() {
    dom = document.getElementById(CANVAS_HOLDER_ID);
    width = dom.clientWidth;
    height = dom.clientHeight;
    return Promise.resolve();
  }

  function setupRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, castShadows: true });
      renderer.setSize(width, height);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(errorMessages.webGlInactive);
    }
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

  function setupRaycaster() {
    raycaster = new THREE.Raycaster();
  }

  function addLocationPoint(position) {
    var _point$position;

    var locationGeometry = new THREE.BoxGeometry(5, 5, 5);
    var locationMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0 });
    var point = new THREE.Mesh(locationGeometry, locationMaterial);
    (_point$position = point.position).set.apply(_point$position, _toConsumableArray(position));
    object.add(point);
    return point;
  }

  function addLocationPoints() {
    points = locationsData.map(addLocationPoint);
  }

  function addObject(geometry) {
    object = new THREE.Object3D();
    object.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
    addLocationPoints();
    scene.add(object);
  }

  function setupObject() {
    return new Promise(function (resolve, reject) {
      var loader = new THREE.JSONLoader();
      loader.load(GEOMETRY_URL, function (geometry) {
        addObject(geometry);
        resolve();
      }, function (request) {
        eventManager(document, uiEvents.progress, { total: request.total, loaded: request.loaded });
      }, function (error) {
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
    setupLights();
    setupRaycaster();
    return Promise.resolve();
  }

  function returnCanvasInterface() {
    return {
      renderer: renderer,
      scene: scene,
      camera: camera,
      light: light,
      raycaster: raycaster,
      object: object,
      points: points
    };
  }

  return setupCanvas().then(setupRenderer).then(setupBase).then(setupObject).then(setupDOM).then(returnCanvasInterface);
};

},{"patterns/tx-event":7,"ui/errorMessages":12,"ui/uiEvents":20}],5:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var eventManager = require('patterns/tx-event');
var canvas = require('./canvas');
var animation = require('./animation');
var uiEvents = require('ui/uiEvents');

var RENDER_EVENT = 'maprender';

var TRANSITION_DURATION = 300;

var CAMERA_TOP_POSITION = [0, 500, 0];
var CAMERA_TOP_ROTATION = [-1.57069, 0, -3.14159];
var CAMERA_PERSPECTIVE_POSITION = [0, 200, -350];
var CAMERA_PERSPECTIVE_ROTATION = [-2.62244, 0, -3.14159];

var PAN_STEP = 50;
var PAN_LEFT_STEP = [-PAN_STEP, 0, 0];
var PAN_RIGHT_STEP = [PAN_STEP, 0, 0];
var PAN_RATIO = 0.35;

var ROTATION_DEFAULT = [0, 0, 0];
var ROTATION_STEP = Math.PI / 180 * 30;
var ROTATION_CCW_STEP = [0, ROTATION_STEP, 0];
var ROTATION_CW_STEP = [0, -ROTATION_STEP, 0];

var SCALE_DEFAULT = 1;
var SCALE_STEP = 0.25;
var SCALE_MAX = 4;
var SCALE_MIN = 0.25;
var SCALE_RATIO = 0.0075;

module.exports = function (locationsData) {

  var width = void 0;
  var height = void 0;
  var halfWidth = void 0;
  var halfHeight = void 0;

  var renderer = void 0;

  var scene = void 0;
  var snap = void 0;

  var camera = void 0;

  var light = void 0;

  var raycaster = void 0;

  var object = void 0;

  var points = void 0;

  var view = void 0;

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
    return view ? CAMERA_TOP_POSITION : CAMERA_PERSPECTIVE_POSITION;
  }

  function getSnap() {
    return snap;
  }

  /* Utilities */

  function calculateRotationFromDelta(data) {
    var rotation = getSnap().mapRotation.slice(0);
    var startVector = {
      x: data.startPosition.clientX - halfWidth,
      y: halfHeight - data.startPosition.clientY
    };
    var currentVector = {
      x: data.currentPosition.clientX - halfWidth,
      y: halfHeight - data.currentPosition.clientY
    };
    rotation[1] -= Math.atan2(currentVector.x, currentVector.y) - Math.atan2(startVector.x, startVector.y);
    return rotation;
  }

  function calculatePositionFromDelta(delta) {
    var position = getSnap().cameraPosition.slice(0);
    position[0] += delta.x * -PAN_RATIO;
    return position;
  }

  function calculateScaleFromDistance(delta) {
    return getSnap().mapScale + delta * SCALE_RATIO;
  }

  function calculatePointProjection(point) {
    var projection = new THREE.Vector3();
    projection.setFromMatrixPosition(point.matrixWorld).project(camera);
    return projection;
  }

  function calculateLocationPosition(point) {
    var projection = calculatePointProjection(point);
    var position = {
      x: Math.round((projection.x + 1) * halfWidth),
      y: Math.round((-projection.y + 1) * halfHeight)
    };
    var positionNDC = new THREE.Vector2(position.x / width * 2 - 1, -position.y / height * 2 + 1);
    raycaster.setFromCamera(positionNDC, camera);
    return {
      position: position,
      visibility: raycaster.intersectObjects(object.children)[0].object === point
    };
  }

  function calculateLocationsPositions() {
    return points.map(calculateLocationPosition);
  }

  function calculateHalves() {
    halfWidth = width / 2;
    halfHeight = height / 2;
  }

  /* Map Actions */

  function renderMap() {
    renderer.render(scene, camera);
    eventManager.trigger(document, RENDER_EVENT, false, 'UIEvent', { newPositions: calculateLocationsPositions() });
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

  function panCamera(position) {
    var _camera$position;

    (_camera$position = camera.position).set.apply(_camera$position, _toConsumableArray(position));
    renderMap();
  }

  function panCameraLeft() {
    animation.go(TRANSITION_DURATION, getCameraPosition(), PAN_LEFT_STEP, panCamera, true);
  }

  function panCameraRight() {
    animation.go(TRANSITION_DURATION, getCameraPosition(), PAN_RIGHT_STEP, panCamera, true);
  }

  /* Scene Actions */

  function transformScene(transformation) {
    var _camera$position2, _object$rotation2;

    (_camera$position2 = camera.position).set.apply(_camera$position2, _toConsumableArray(transformation.slice(0, 3)));
    (_object$rotation2 = object.rotation).set.apply(_object$rotation2, _toConsumableArray(transformation.slice(3, 6)));
    object.scale.set(transformation[6], transformation[6], transformation[6]);
    renderMap();
  }

  function resetScene() {
    var startValues = [].concat(_toConsumableArray(getCameraPosition()), _toConsumableArray(getMapRotation()), [getMapScale()]);
    var targetValues = [].concat(_toConsumableArray(getCameraDefaultPosition()), _toConsumableArray(getMapDefaultRotation()), [SCALE_DEFAULT]);
    animation.go(TRANSITION_DURATION, startValues, targetValues, transformScene);
  }

  function snapScene() {
    snap = {
      mapRotation: getMapRotation(),
      mapScale: getMapScale(),
      cameraPosition: getCameraPosition()
    };
  }

  function resizeScene() {
    width = window.innerWidth;
    height = window.innerHeight;
    calculateHalves();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /* Views */

  function transformCamera(positionRotation) {
    var _camera$position3, _camera$rotation;

    (_camera$position3 = camera.position).set.apply(_camera$position3, _toConsumableArray(positionRotation.slice(0, 3)));
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
    if (!view) {
      moveCameraTop();
    } else {
      moveCameraPerspective();
    }
    view = !view;
  }

  /* Map Initialization */

  function onTopDown() {
    toggleTopDownView();
  }

  function onRotate(event) {
    var rotation = calculateRotationFromDelta(event.data);
    rotateMap(rotation);
  }

  function onRotateCCW(event) {
    rotateMapCCW();
  }

  function onRotateCW(event) {
    rotateMapCW();
  }

  function onPan(event) {
    var position = calculatePositionFromDelta(event.data.delta);
    panCamera(position);
  }

  function onPanLeft() {
    panCameraLeft();
  }

  function onPanRight() {
    panCameraRight();
  }

  function onZoom(event) {
    var scale = calculateScaleFromDistance(event.data.delta);
    scaleMap(scale);
  }

  function onZoomIn(event) {
    zoomInMap();
  }

  function onZoomOut(event) {
    zoomOutMap();
  }

  function onReset() {
    resetScene();
  }

  function onSnap() {
    snapScene();
  }

  function onResize(event) {
    requestAnimationFrame(function (_) {
      resizeScene();
      renderMap();
    });
  }

  function initializeEvents() {
    eventManager.bind(document, uiEvents.topDown, onTopDown);
    eventManager.bind(document, uiEvents.rotate, onRotate);
    eventManager.bind(document, uiEvents.rotateCCW, onRotateCCW);
    eventManager.bind(document, uiEvents.rotateCW, onRotateCW);
    eventManager.bind(document, uiEvents.pan, onPan);
    eventManager.bind(document, uiEvents.panLeft, onPanLeft);
    eventManager.bind(document, uiEvents.panRight, onPanRight);
    eventManager.bind(document, uiEvents.zoom, onZoom);
    eventManager.bind(document, uiEvents.zoomIn, onZoomIn);
    eventManager.bind(document, uiEvents.zoomOut, onZoomOut);
    eventManager.bind(document, uiEvents.snap, onSnap);
    eventManager.bind(document, uiEvents.reset, onReset);
    eventManager.bind(window, 'resize', onResize);
  }

  function setupMap(properties) {
    renderer = properties.renderer;
    scene = properties.scene;
    camera = properties.camera;
    light = properties.light;
    raycaster = properties.raycaster;
    object = properties.object;
    points = properties.points;
    var _renderer$domElement = renderer.domElement;
    width = _renderer$domElement.width;
    height = _renderer$domElement.height;

    view = false;
    calculateHalves();
    initializeEvents();
    renderMap();
  }

  return canvas(locationsData).then(setupMap);
};

},{"./animation":3,"./canvas":4,"patterns/tx-event":7,"ui/uiEvents":20}],6:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = function (html) {
  var element = document.createElement('div');
  element.innerHTML = html;
  return element.firstChild;
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

function enterFullScreen() {
  document.documentElement.requestFullscreen();
}

function exitFullScreen() {
  document.exitFullscreen();
}

function onUIFullscreen() {
  if (!document.fullscreenElement) {
    enterFullScreen();
  } else {
    exitFullScreen();
  }
}

module.exports = function (_) {
  eventManager.bind(document, uiEvents.fullscreen, onUIFullscreen);
};

},{"patterns/tx-event":7,"ui/uiEvents":20}],9:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var ERROR_ID = 'error';
var ERROR_MESSAGE_ID = 'errorMessage';
var ERROR_ACTIVE_CLASS_NAME = 'error-is-active';

exports.show = function (error) {
  document.getElementById(ERROR_MESSAGE_ID).textContent = error;
  document.getElementById(ERROR_ID).classList.toggle(ERROR_ACTIVE_CLASS_NAME);
};

},{}],10:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var HELP_ID = 'help';
var ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

function onUIHelp(dom, activeClass) {
  dom.classList.toggle(activeClass);
}

module.exports = function (_) {
  var dom = document.getElementById(HELP_ID);
  var activeClass = '' + HELP_ID + ACTIVE_CLASS_NAME_SUFFIX;
  eventManager.bind(document, uiEvents.help, function (_) {
    return onUIHelp(dom, activeClass);
  });
};

},{"patterns/tx-event":7,"ui/uiEvents":20}],11:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var LOADER_ID = 'loader';
var LOADER_HIDDEN_CLASS = LOADER_ID + '-is-hidden';

function removeLoader() {
  document.getElementById(LOADER_ID).classList.add(LOADER_HIDDEN_CLASS);
}

function showLoader() {
  document.getElementById(LOADER_ID).classList.remove(LOADER_HIDDEN_CLASS);
}

exports.show = showLoader;
exports.remove = removeLoader;

},{}],12:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = {
  webGl: 'I am sorry but your browser doesn’t seem to support all the necessary technologies to display this site properly.',
  webGlInactive: 'I am sorry but your browser doesn’t seem to support all the necessary technologies to display this site properly.',
  download: 'Something didn\'t download'
};

},{}],13:[function(require,module,exports){
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
  eventManager.bind(dom, 'touchstart', function (event) {
    return onClick(event, uiEvent);
  });
};

},{"patterns/tx-event":7}],14:[function(require,module,exports){
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

},{"patterns/tx-event":7,"ui/uiEvents":20}],15:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var CATCHER_ID = 'locations';

var MOUSE_EVENTS = {
  0: uiEvents.rotate,
  2: uiEvents.pan
};

var downPosition = void 0;

function onMouseMove(event) {
  requestAnimationFrame(function (_) {
    var button = event.button;
    var delta = {
      x: downPosition.clientX - event.clientX,
      y: downPosition.clientY - event.clientY
    };
    var position = {
      clientX: event.clientX,
      clientY: event.clientY
    };
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, MOUSE_EVENTS[button], false, 'UIEvent', { delta: delta, startPosition: downPosition, currentPosition: position });
  });
}

function onMouseUp(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'mousemove', onMouseMove);
  eventManager.unbind(document, 'mouseup', onMouseUp);
}

function onMouseDown(event) {
  event.preventDefault();
  event.stopPropagation();
  downPosition = {
    clientX: event.clientX,
    clientY: event.clientY
  };
  eventManager.trigger(document, uiEvents.snap, false, 'UIEvent');
  eventManager.bind(document, 'mousemove', onMouseMove);
  eventManager.bind(document, 'mouseup', onMouseUp);
}

function onWheel(event) {
  requestAnimationFrame(function (_) {
    event.preventDefault();
    event.stopPropagation();
    if (event.deltaY > 0) {
      eventManager.trigger(document, uiEvents.zoomOut, false, 'UIEvent');
    } else if (event.deltaY < 0) {
      eventManager.trigger(document, uiEvents.zoomIn, false, 'UIEvent');
    }
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

},{"patterns/tx-event":7,"ui/uiEvents":20}],16:[function(require,module,exports){
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
var HELP_SHOW_ID = 'showHelp';
var HELP_CLOSE_ID = 'closeHelp';

module.exports = function (_) {
  toggle(LOCATIONS_ID, uiEvents.locations);
  toggle(TOP_DOWN_ID, uiEvents.topDown);
  control(ROTATE_CCW_ID, uiEvents.rotateCCW);
  control(ROTATE_CW_ID, uiEvents.rotateCW);
  control(ZOOM_OUT_ID, uiEvents.zoomOut);
  control(ZOOM_IN_ID, uiEvents.zoomIn);
  control(RESET_ID, uiEvents.reset);
  toggle(FULL_SCREEN_ID, uiEvents.fullscreen);
  control(HELP_SHOW_ID, uiEvents.help);
  control(HELP_CLOSE_ID, uiEvents.help);
};

},{"./control":13,"./toggle":17,"ui/uiEvents":20}],17:[function(require,module,exports){
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
  eventManager.bind(dom, 'click', function (event) {
    return onClick(event, uiEvent, dom, activeClass);
  });
  eventManager.bind(dom, 'touchstart', function (event) {
    return onClick(event, uiEvent, dom, activeClass);
  });
};

},{"patterns/tx-event":7}],18:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');

var CATCHER_ID = 'locations';

var TOUCH_THRESHOLD = 100;

var downTouches = void 0;
var downDistance = void 0;

function calculateDistance(touches) {
  return Math.sqrt(Math.pow(touches[1].clientX - touches[0].clientX, 2) + Math.pow(touches[1].clientY - touches[0].clientY, 2));
}

function onSingleToucheMove(event) {
  requestAnimationFrame(function (_) {
    return eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', { startPosition: downTouches[0], currentPosition: event.touches[0] });
  });
}

function onDoubleToucheMove(event) {
  requestAnimationFrame(function (_) {
    var delta = {
      x: downTouches[0].clientX - event.touches[0].clientX,
      y: downTouches[0].clientY - event.touches[0].clientY
    };
    eventManager.trigger(document, uiEvents.pan, false, 'UIEvent', { delta: delta });
  });
}

function onPinch(event) {
  requestAnimationFrame(function (_) {
    var delta = calculateDistance(event.touches) - downDistance;
    eventManager.trigger(document, uiEvents.zoom, false, 'UIEvent', { delta: delta });
  });
}

function onTouchEnd(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'touchmove', onSingleToucheMove);
  eventManager.unbind(document, 'touchmove', onDoubleToucheMove);
  eventManager.unbind(document, 'touchmove', onPinch);
  eventManager.unbind(document, 'touchend', onTouchEnd);
}

function onTouchStart(event) {
  downTouches = event.touches;
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvents.snap, false, 'UIEvent');
  if (event.touches.length === 1) {
    eventManager.bind(document, 'touchmove', onSingleToucheMove);
  } else {
    downDistance = calculateDistance(event.touches);
    eventManager.unbind(document, 'touchmove', onSingleToucheMove);
    if (downDistance <= TOUCH_THRESHOLD) {
      eventManager.bind(document, 'touchmove', onDoubleToucheMove);
    } else {
      eventManager.bind(document, 'touchmove', onPinch);
    }
  }
  eventManager.bind(document, 'touchend', onTouchEnd);
}

module.exports = function (_) {
  var catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'touchstart', onTouchStart, false);
};

},{"patterns/tx-event":7,"ui/uiEvents":20}],19:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var panel = require('ui/input/panel');
var keyboard = require('ui/input/keyboard');
var mouse = require('ui/input/mouse');
var touch = require('ui/input/touch');

var display = require('ui/elements/display');
var help = require('ui/elements/help');
var loader = require('ui/elements/loader');
var error = require('ui/elements/error');

exports.error = error.show;

exports.init = function (locations, map) {

  /* Input Options */

  panel();
  keyboard();
  mouse();
  touch();

  /* UI */

  display();
  help();
  loader.remove();
};

},{"ui/elements/display":8,"ui/elements/error":9,"ui/elements/help":10,"ui/elements/loader":11,"ui/input/keyboard":14,"ui/input/mouse":15,"ui/input/panel":16,"ui/input/touch":18}],20:[function(require,module,exports){
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
  snap: 'sceneuisnap',
  fullscreen: 'fullscreenuichange',
  helpShow: 'helpuichange',
  progress: 'progressuiupdate'
};

},{}],21:[function(require,module,exports){
/* jshint browser: true */

'use strict';

module.exports = function (url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function (event) {
      var data = JSON.parse(event.target.responseText);
      resolve(data);
    });
    request.addEventListener('error', function (error) {
      reject(error);
    });
    request.open('GET', url);
    request.send();
  });
};

},{}],22:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var locations = require('locations/locations');
var map = require('map/map');
var ui = require('ui/ui');
// let cache = require('utilities/cache');

// cache();
locations().then(map).then(ui.init).catch(ui.error);

},{"locations/locations":2,"map/map":5,"ui/ui":19}]},{},[22]);
