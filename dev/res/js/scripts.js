(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser:true */

'use strict';

function rotateMapCCW() {
  console.log('Rotate CCW');
}

function rotateMapCW() {
  console.log('Rotate CW');
}

function zoomInMap() {
  console.log('Zoom In');
}

function zoomOutMap() {
  console.log('Zoom Out');
}

function toggleFullScreenMap() {
  console.log('Full Screen');
}

function initializeMap() {
  console.log('Map Initialized');
}

exports.init = initializeMap;
exports.rotateCCW = rotateMapCCW;
exports.rotateCW = rotateMapCW;
exports.zoomIn = zoomInMap;
exports.zoomOut = zoomOutMap;
exports.toggleFullScreen = toggleFullScreenMap;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./control":2,"./toggle":5}],4:[function(require,module,exports){
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

},{"./toggle":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var drawer = require('./drawer');
var controls = require('./controls');

module.exports = function (map) {

  drawer();
  controls(map);
};

},{"./controls":3,"./drawer":4}],7:[function(require,module,exports){
/* jshint browser:true */

'use strict';

var map = require('map/map');
var ui = require('ui/ui');

map.init();
ui(map);

},{"map/map":1,"ui/ui":6}]},{},[7]);
