/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const CATCHER_ID = 'locations';

const TOUCH_THRESHOLD = 120;

function calculateDeltaPosition(touchesStart, touchesMove) {
  return touchesStart[0].clientX - touchesMove[0].clientX;
}

function calculateDistance(touches) {
  return Math.sqrt(Math.pow((touches[1].clientX - touches[0].clientX), 2) + Math.pow((touches[1].clientY - touches[0].clientY), 2));
}

function onSingleToucheMove(touchesStart, touchesMove) {
  let delta = calculateDeltaPosition(touchesStart, touchesMove);
  eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', {delta: delta});
}

function onDoubleTouchMove(touchesStart, touchesMove) {
  let deltaPosition = calculateDeltaPosition(touchesStart, touchesMove);
  let distance = calculateDistance(touchesMove);
  if (distance <= TOUCH_THRESHOLD) {
    eventManager.trigger(document, uiEvents.pan, false, 'UIEvent', {delta: deltaPosition});
  } else {
    eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', {distance: distance});
  }
}

function onGesture(event, touches, distance) {
  requestAnimationFrame(_ => {
    if (touches.length === 1) {
      onSingleToucheMove();
    } else {
      onDoubleTouchMove();
    }
  });
}

function onTouchEnd(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'touchmove');
  eventManager.unbind(document, 'touchend', onTouchEnd);
}

function onTouchStart(event) {
  let touches = event.touches;
  let distance = calculateDistance(touches);
  event.preventDefault();
  event.stopPropagation();
  eventManager.bind(document, 'touchmove', event => onGesture(event, touches, distance));
  eventManager.bind(document, 'touchend', onTouchEnd);
}

module.exports = _ => {
  let catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'touchstart', onTouchStart, false);
};
