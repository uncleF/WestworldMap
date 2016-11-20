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

function getLocations() {
  return locations;
}

function getLocationsDOM() {
  return dom;
}

function setLocationsDOM() {
  dom = document.getElementById(LOCATIONS_ID);
}

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
  getLocationsDOM().appendChild(container);
}

function setupLocations() {
  locations = locationsData.map(function (locationData) {
    return location(locationData);
  });
  appendLocations();
}

function setupEvents() {
  eventTool.bind(document, 'maprender', translateLocations);
}

function initializeLocations() {
  setLocationsDOM();
  setupLocations();
  setupEvents();
}

exports.init = initializeLocations;
exports.toggle = toggleLocations;
exports.locations = getLocations;

},{"./location":1,"patterns/tx-event":8}],3:[function(require,module,exports){
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
var CAMERA_POSITION = { x: 0, y: 200, z: 350 };
var CAMERA_ROTATION = { x: 100, y: 0, z: 0 };

var LIGHT_POSITION = { x: 0, y: 150, z: 500 };
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

var locations = void 0;

function setupCanvas() {
  holderDOM = document.getElementById(CANVAS_HOLDER_ID);
  width = holderDOM.clientWidth;
  height = holderDOM.clientHeight;
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, castShadows: true });
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
  camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
  camera.rotation.set(CAMERA_ROTATION.x, CAMERA_ROTATION.y, CAMERA_ROTATION.z);
  scene.add(camera);
}

function setupLights() {
  light = new THREE.PointLight(LIGHT_COLOR);
  light.position.set(LIGHT_POSITION.x, LIGHT_POSITION.y, LIGHT_POSITION.z);
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

function addObject(geometry) {
  object = new THREE.Object3D();
  object.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
  addLocationPoints();
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

function inititalizeCanvas(locationsInstance) {
  locations = locationsInstance;
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
var panorama = require('./panorama');
var eventTool = require('patterns/tx-event');

var ROTATION_STEP = 0.5235;
var ZOOM_STEP = 0.35;
var ZOOM_MAX = 4;
var ZOOM_MIN = 0.25;
var TRANSITION_DURATION = 500;

var EVENT_RENDER = 'maprender';
var EVENT_TYPE = 'UIEvent';

var renderer = void 0;
var scene = void 0;
var camera = void 0;
var light = void 0;
var object = void 0;

var width = void 0;
var height = void 0;

function getMapRotation() {
  return object.rotation.y;
}

function getMapScale() {
  return object.scale.x;
}

function rotateMap(angle) {
  object.rotation.set(0, angle, 0);
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
  factor = factor > ZOOM_MAX ? ZOOM_MAX : factor;
  factor = factor < ZOOM_MIN ? ZOOM_MIN : factor;
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

function resetMap() {
  animation.stop();
  animation.go(TRANSITION_DURATION, object.scale.x, 1 - getMapScale(), zoomMap);
}

function toggleMapPanorama() {
  panorama.toggle();
}

function showTopDownMapView() {
  console.log('Top-Down View');
}

function triggerRenderEvent() {
  var data = {
    camera: camera,
    width: width,
    height: height
  };
  eventTool.trigger(document, EVENT_RENDER, false, EVENT_TYPE, data);
}

function renderMap() {
  renderer.render(scene, camera);
  triggerRenderEvent();
}

function setMapSize() {
  width = renderer.domElement.width;
  height = renderer.domElement.height;
}

function setupMap(properties) {
  renderer = properties.renderer;
  scene = properties.scene;
  camera = properties.camera;
  light = properties.light;
  object = properties.object;

  setMapSize();
  return Promise.resolve();
}

function initializeMap(locations) {
  canvas.init(locations).then(setupMap).then(renderMap);
}

exports.init = initializeMap;
exports.rotate = rotateMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.angle = getMapRotation;
exports.zoom = zoomMap;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.reset = resetMap;
exports.panorama = toggleMapPanorama;
exports.topDown = showTopDownMapView;
exports.scale = getMapScale;

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
    9: locations.toggle,
    37: map.rotateCCW,
    39: map.rotateCW,
    38: map.zoomIn,
    40: map.zoomOut
  };

  function onKeyDown(event) {
    var key = event.keyCode;
    if (KEY_ACTIONS[key]) {
      event.preventDefault();
      event.stopPropagation();
      KEY_ACTIONS[key]();
    }
  }

  eventTool.bind(document, 'keydown', onKeyDown);
};

},{"patterns/tx-event":8}],13:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var eventTool = require('patterns/tx-event');

var CONTAINER_ID = 'locations';

var ROTATION_STEP = 0.005;

module.exports = function (map) {

  var container = void 0;

  var startPosition = void 0;
  var startAngle = void 0;

  function onMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(function (_) {
      var currentPosition = event.clientX;
      var currentAngle = startAngle + (startPosition - currentPosition) * ROTATION_STEP;
      map.rotate(currentAngle);
    });
  }

  function onMouseUp() {
    eventTool.unbind(document, 'mousemove', onMouseMove);
    eventTool.unbind(document, 'mouseup', onMouseUp);
  }

  function initializeMouseMove() {
    eventTool.bind(document, 'mousemove', onMouseMove);
    eventTool.bind(document, 'mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    event.preventDefault();
    startPosition = event.clientX;
    startAngle = map.angle();
    initializeMouseMove();
  }

  container = document.getElementById(CONTAINER_ID);
  eventTool.bind(document, 'mousedown', onMouseDown);
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

var CONTAINER_ID = 'locations';

var ROTATION_STEP = 0.005;
var SCALE_STEP = 0.01;

module.exports = function (map) {

  var container = void 0;

  var startPosition = void 0;
  var startAngle = void 0;
  var startDistance = void 0;
  var startScale = void 0;

  function calculateDistance(touches) {
    return Math.sqrt(Math.pow(touches[1].clientX - touches[0].clientX, 2) + Math.pow(touches[1].clientY - touches[0].clientY, 2));
  }

  function doubleTouchMove(event) {
    requestAnimationFrame(function (_) {
      var currentDistance = calculateDistance(event.touches);
      var currentScale = startScale + (currentDistance - startDistance) * SCALE_STEP;
      map.zoom(currentScale);
    });
  }

  function singleTouchMove(event) {
    requestAnimationFrame(function (_) {
      var currentPosition = event.touches[0].clientX;
      var currentAngle = startAngle + (currentPosition - startPosition) * ROTATION_STEP;
      map.rotate(currentAngle);
    });
  }

  function doubleTouchStart(event) {
    startDistance = calculateDistance(event.touches);
    startScale = map.scale();
  }

  function singleTouchStart(event) {
    startPosition = event.touches[0].clientX;
    startAngle = map.angle();
  }

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

  container = document.getElementById(CONTAINER_ID);
  eventTool.bind(container, 'touchstart', onTouchStart, true);
  eventTool.bind(container, 'touchmove', onTouchMove, true);
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

var WESTWORLD_ID = 'westworld';
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

module.exports = function (map, locations) {

  function inititalizeControlPanel() {
    toggle(WESTWORLD_ID, function (_) {});
    toggle(LOCATIONS_ID, locations.toggle);
    toggle(PANORAMA_ID, map.panorama);
    control(ROTATE_CCW_ID, map.rotateCCW);
    control(ROTATE_CW_ID, map.rotateCW);
    control(ZOOM_IN_ID, map.zoomIn);
    control(ZOOM_OUT_ID, map.zoomOut);
    control(RESET_ID, map.reset);
    toggle(TOP_DOWN_ID, map.topDown);
    toggle(FULL_SCREEN_ID, display.toggle);
    control(HELP_ID, help.toggle);
  }

  inititalizeControlPanel();
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

locations.init();
map.init(locations.locations());
ui(map, locations);

},{"locations/locations":2,"map/map":5,"ui/ui":16}]},{},[17]);
