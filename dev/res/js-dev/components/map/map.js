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
