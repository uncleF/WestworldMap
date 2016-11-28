/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const CATCHER_ID = 'locations';

const TOUCH_THRESHOLD = 120;

let downTouches;
let downDistance;

function calculateDeltaPosition(touchesMove) {
  return downTouches[0].clientX - touchesMove[0].clientX;
}

function calculateDistance(touches) {
  return Math.sqrt(Math.pow((touches[1].clientX - touches[0].clientX), 2) + Math.pow((touches[1].clientY - touches[0].clientY), 2));
}

function onSingleToucheMove(touchesMove) {
  let delta = calculateDeltaPosition(touchesMove);
  eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', {delta: delta});
}

function onDoubleTouchMove(touchesMove) {
  let deltaPosition = calculateDeltaPosition(touchesMove);
  let distance = calculateDistance(touchesMove);
  if (distance <= TOUCH_THRESHOLD) {
    eventManager.trigger(document, uiEvents.pan, false, 'UIEvent', {delta: deltaPosition});
  } else {
    eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', {distance: distance});
  }
}

function onGesture(event) {
  requestAnimationFrame(_ => {
    if (downTouches.length === 1) {
      onSingleToucheMove(event.touches);
    } else {
      onDoubleTouchMove(event.touches);
    }
  });
}

function onTouchEnd(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'touchmove', onGesture);
  eventManager.unbind(document, 'touchend', onTouchEnd);
}

function onTouchStart(event) {
  downTouches = event.touches;
  downDistance = calculateDistance(event.touches);
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvents.snap, false, 'UIEvent');
  eventManager.bind(document, 'touchmove', onGesture);
  eventManager.bind(document, 'touchend', onTouchEnd);
}

module.exports = _ => {
  let catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'touchstart', onTouchStart, false);
};
