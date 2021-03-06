/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const CATCHER_ID = 'locations';

const TOUCH_THRESHOLD = 120;

let downTouches;
let downDistance;

function calculateDistance(touches) {
  return Math.sqrt(Math.pow((touches[1].clientX - touches[0].clientX), 2) + Math.pow((touches[1].clientY - touches[0].clientY), 2));
}

function onSingleToucheMove(event) {
  requestAnimationFrame(_ => eventManager.trigger(document, uiEvents.rotate, false, 'UIEvent', {startPosition: downTouches[0], currentPosition: event.touches[0]}));
}

function onDoubleToucheMove(event) {
  requestAnimationFrame(_ => {
    let delta = {
      x: downTouches[0].clientX - event.touches[0].clientX,
      y: downTouches[0].clientY - event.touches[0].clientY
    };
    eventManager.trigger(document, uiEvents.pan, false, 'UIEvent', {delta: delta});
  });
}

function onPinch(event) {
  requestAnimationFrame(_ => {
    let delta = calculateDistance(event.touches) - downDistance;
    eventManager.trigger(document, uiEvents.zoom, false, 'UIEvent', {delta: delta});
  });
}

function onTouchEnd(event) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.unbind(document, 'touchmove', onSingleToucheMove);
  eventManager.unbind(document, 'touchmove', onDoubleToucheMove);
  eventManager.unbind(document, 'touchmove', onPinch);
  eventManager.unbind(document, 'touchend', onTouchEnd);
}

function onTouchStart(event) {
  downTouches = event.touches;
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvents.snap, false, 'UIEvent');
  if (event.touches.length === 1) {
    eventManager.bind(document, 'touchmove', onSingleToucheMove);
  } else {
    downDistance = calculateDistance(event.touches);
    eventManager.unbind(document, 'touchmove', onSingleToucheMove);
    if (downDistance <= TOUCH_THRESHOLD) {
      eventManager.bind(document, 'touchmove', onDoubleToucheMove);
    } else {
      eventManager.bind(document, 'touchmove', onPinch);
    }
  }
  eventManager.bind(document, 'touchend', onTouchEnd);
}

module.exports = _ => {
  let catcher = document.getElementById(CATCHER_ID);
  eventManager.bind(catcher, 'touchstart', onTouchStart, false);
};
