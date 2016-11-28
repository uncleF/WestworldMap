/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const CATCHER_ID = 'locations';

const MOUSE_EVENTS = {
  0: uiEvents.rotate,
  2: uiEvents.pan
};

let downPosition;

function onMouseMove(event) {
  requestAnimationFrame(_ => {
    let button = event.button;
    let delta = {
      x: downPosition.clientX - event.clientX,
      y: downPosition.clientY - event.clientY
    };
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, MOUSE_EVENTS[button], false, 'UIEvent', {delta: delta});
  });
}

function onMouseUp(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'mousemove');
  eventManager.unbind(document, 'mouseup', onMouseUp);
}

function onMouseDown(event) {
  event.preventDefault();
  event.stopPropagation();
  downPosition = {
    clientX: event.clientX,
    clientY: event.clientY
  };
  eventManager.bind(document, 'mousemove', onMouseMove);
  eventManager.bind(document, 'mouseup', onMouseUp);
}

function onWheel(event) {
  requestAnimationFrame(_ => {
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, uiEvents.zoom, false, 'UIEvent', {delta: event.deltaY});
  });
}

function onContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
}

module.exports = _ => {
  let catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'mousedown', onMouseDown, false);
  eventManager.bind(catcher, 'wheel', onWheel, false);
  eventManager.bind(catcher, 'contextmenu', onContextMenu, false);
};
