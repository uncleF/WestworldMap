/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const KEY_EVENTS = {
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
  let keyCode = event.keyCode;
  if (KEY_EVENTS[keyCode]) {
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, KEY_EVENTS[keyCode], false, 'UIEvent');
  }
}

module.exports = _ => {
  eventManager.bind(document, 'keydown', onKeyDown);
};
