/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

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

module.exports = _ => {
  eventManager.bind(document, uiEvents.fullscreen, onUIFullscreen);
};
