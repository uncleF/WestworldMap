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
