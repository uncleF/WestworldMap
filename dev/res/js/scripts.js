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

},{"patterns/tx-createNode":7}],2:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var mapLocation = require('./location');
var eventManager = require('patterns/tx-event');
var download = require('utilities/download');
var uiEvents = require('ui/uiEvents');
var mapEvents = require('map/mapEvents');

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
    eventManager.trigger(document, mapEvents.locations, false);
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

},{"./location":1,"map/mapEvents":6,"patterns/tx-event":8,"ui/uiEvents":21,"utilities/download":23}],3:[function(require,module,exports){
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

var GEOMETRY_URL = '/models/noDetails.json';

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
        eventManager.trigger(document, uiEvents.progress, false, 'UIEvent', { total: request.total, loaded: request.loaded });
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

},{"patterns/tx-event":8,"ui/errorMessages":13,"ui/uiEvents":21}],5:[function(require,module,exports){
/* jshint browser:true */
/* global THREE */

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var eventManager = require('patterns/tx-event');
var canvas = require('map/canvas');
var animation = require('map/animation');
var uiEvents = require('ui/uiEvents');
var mapEvents = require('map/mapEvents');

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
    eventManager.trigger(document, mapEvents.topDown, false);
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

},{"map/animation":3,"map/canvas":4,"map/mapEvents":6,"patterns/tx-event":8,"ui/uiEvents":21}],6:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = {
  locations: 'map:locationschange',
  topDown: 'map:maptopdownchange',
  fullscreen: 'map:fullscreenchange'
};

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

var eventManager = require('patterns/tx-event');
var uiEvents = require('ui/uiEvents');
var mapEvents = require('map/mapEvents');

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
  eventManager.trigger(document, mapEvents.fullscreen, false);
}

module.exports = function (_) {
  eventManager.bind(document, uiEvents.fullscreen, onUIFullscreen);
};

},{"map/mapEvents":6,"patterns/tx-event":8,"ui/uiEvents":21}],10:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var ERROR_ID = 'error';
var ERROR_MESSAGE_ID = 'errorMessage';
var ERROR_ACTIVE_CLASS_NAME = 'error-is-active';

exports.show = function (error) {
  document.getElementById(ERROR_MESSAGE_ID).textContent = error;
  document.getElementById(ERROR_ID).classList.toggle(ERROR_ACTIVE_CLASS_NAME);
};

},{}],11:[function(require,module,exports){
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

},{"patterns/tx-event":8,"ui/uiEvents":21}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = {
  webGl: 'I am sorry but your browser doesn’t seem to support all the necessary technologies to display this site properly.',
  webGlInactive: 'I am sorry but your browser doesn’t seem to support all the necessary technologies to display this site properly.',
  download: 'Something didn\'t download'
};

},{}],14:[function(require,module,exports){
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

},{"patterns/tx-event":8}],15:[function(require,module,exports){
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

},{"patterns/tx-event":8,"ui/uiEvents":21}],16:[function(require,module,exports){
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

},{"patterns/tx-event":8,"ui/uiEvents":21}],17:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var control = require('./control');
var toggle = require('./toggle');
var uiEvents = require('ui/uiEvents');
var mapEvents = require('map/mapEvents');

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
  toggle(LOCATIONS_ID, uiEvents.locations, mapEvents.locations);
  toggle(TOP_DOWN_ID, uiEvents.topDown, mapEvents.topDown);
  control(ROTATE_CCW_ID, uiEvents.rotateCCW);
  control(ROTATE_CW_ID, uiEvents.rotateCW);
  control(ZOOM_OUT_ID, uiEvents.zoomOut);
  control(ZOOM_IN_ID, uiEvents.zoomIn);
  control(RESET_ID, uiEvents.reset);
  toggle(FULL_SCREEN_ID, uiEvents.fullscreen, mapEvents.fullscreen);
  control(HELP_SHOW_ID, uiEvents.help);
  control(HELP_CLOSE_ID, uiEvents.help);
};

},{"./control":14,"./toggle":18,"map/mapEvents":6,"ui/uiEvents":21}],18:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventManager = require('patterns/tx-event');

var ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

function onClick(event, uiEvent, dom, activeClass) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvent, false, 'UIEvent');
}

function onMapEvent(dom, activeClass) {
  dom.classList.toggle(activeClass);
}

module.exports = function (id, uiEvent, mapEvent) {
  var dom = document.getElementById(id);
  var activeClass = '' + id + ACTIVE_CLASS_NAME_SUFFIX;
  eventManager.bind(dom, 'click', function (event) {
    return onClick(event, uiEvent, dom, activeClass);
  });
  eventManager.bind(dom, 'touchstart', function (event) {
    return onClick(event, uiEvent, dom, activeClass);
  });
  eventManager.bind(document, mapEvent, function (event) {
    return onMapEvent(dom, activeClass);
  });
};

},{"patterns/tx-event":8}],19:[function(require,module,exports){
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

},{"patterns/tx-event":8,"ui/uiEvents":21}],20:[function(require,module,exports){
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

},{"ui/elements/display":9,"ui/elements/error":10,"ui/elements/help":11,"ui/elements/loader":12,"ui/input/keyboard":15,"ui/input/mouse":16,"ui/input/panel":17,"ui/input/touch":19}],21:[function(require,module,exports){
/* jshint browser:true */

'use strict';

module.exports = {
  locations: 'ui:locationschange',
  topDown: 'ui:maptopdownchange',
  rotate: 'ui:maprotate',
  rotateCCW: 'ui:mapccwrotate',
  rotateCW: 'ui:mapcwrotate',
  pan: 'ui:mappan',
  panLeft: 'ui:mappanleft',
  panRight: 'ui:mappanright',
  zoom: 'ui:mapzoom',
  zoomIn: 'ui:mapzoomin',
  zoomOut: 'ui:mapzoomout',
  reset: 'ui:mapreset',
  snap: 'ui:scenesnap',
  fullscreen: 'ui:fullscreenchange',
  help: 'ui:helpchange',
  progress: 'ui:progressupdate'
};

},{}],22:[function(require,module,exports){
/* jshint browser: true */
/* global Modernizr */

'use strict';

function onSuccess(worker) {
  console.log('Service worker successfully installed with the scope of: ' + worker.scope);
}

function onFailure(error) {
  console.log('Failed to install service worker. ' + error);
}

module.exports = function (_) {
  if (Modernizr.serviceworker) {
    navigator.serviceWorker.register('/service.js').then(onSuccess).catch(onFailure);
  }
};

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
/* jshint browser: true */
/* global Modernizr */

'use strict';

var es6Promise = require('es6-promise');

module.exports = function (_) {

  if (!Modernizr.promises) {
    es6Promise.polyfill();
  }
};

},{"es6-promise":26}],25:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var polyfills = require('utilities/polyfills');
var cache = require('utilities/cache');
var locations = require('locations/locations');
var map = require('map/map');
var ui = require('ui/ui');

polyfills();
cache();
locations().then(map).then(ui.init).catch(ui.error);

},{"locations/locations":2,"map/map":5,"ui/ui":20,"utilities/cache":22,"utilities/polyfills":24}],26:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.5
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":27}],27:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[25]);
