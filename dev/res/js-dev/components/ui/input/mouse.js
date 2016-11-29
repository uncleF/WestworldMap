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
      x: event.clientX - downPosition.clientX,
      y: event.clientY - downPosition.clientY
    };
    let position = {
      clientX: event.clientX,
      clientY: event.clientY
    };
    event.preventDefault();
    event.stopPropagation();
    eventManager.trigger(document, MOUSE_EVENTS[button], false, 'UIEvent', {delta: delta, startPosition: downPosition, currentPosition: position});
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
  requestAnimationFrame(_ => {
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

module.exports = _ => {
  let catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'mousedown', onMouseDown, false);
  eventManager.bind(catcher, 'wheel', onWheel, false);
  eventManager.bind(catcher, 'contextmenu', onContextMenu, false);
};
