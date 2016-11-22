/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

const CATCHER_ID = 'locations';

const PAN_STEP = 0.35;

const ROTATION_STEP = -0.005;

const SCALE_STEP = 0.01;
const SCALE_THRESHOLD = 120;

module.exports = map => {

  let catcher;

  let startPosition;
  let startRotation;
  let startDistance;
  let startScale;

  /* Utilities */

  function calculateDistance(startPosition, currentPosition) {
    return Math.sqrt(Math.pow((currentPosition.clientX - startPosition.clientX), 2) + Math.pow((currentPosition.clientY - startPosition.clientY), 2));
  }

  /* Actions */

  function singleTouchMove(event) {
    requestAnimationFrame(_ => {
      let currentPosition = event.touches[0].clientX;
      let currentAngle = startRotation[1] + (currentPosition - startPosition) * ROTATION_STEP;
      let currentRotation = [startRotation[0], currentAngle, startRotation[2]];
      map.rotate(currentRotation);
    });
  }

  function doubleTouchScale(currentDistance) {
    let currentScale = startScale + (currentDistance - startDistance) * SCALE_STEP;
    map.zoom(currentScale);
  }

  function doubleTouchPan(event) {
    let currentDistance = (event.touches[0].clientX - startPosition) * PAN_STEP;
    map.pan(currentDistance);
  }

  function doubleTouchMove(event) {
    requestAnimationFrame(_ => {
      let currentDistance = calculateDistance(event.touches[0], event.touches[1]);
      if (currentDistance > SCALE_THRESHOLD) {
        doubleTouchScale(currentDistance);
      } else {
        doubleTouchPan(event);
      }
    });
  }

  function singleTouchStart(event) {
    startPosition = event.touches[0].clientX;
    startRotation = map.getRotation();
  }

  function doubleTouchStart(event) {
    map.snapshot();
    startPosition = event.touches[0].clientX;
    startDistance = calculateDistance(event.touches[0], event.touches[1]);
    startScale = map.getScale();
  }

  /* Interactions */

  function onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length > 1) {
      doubleTouchStart(event);
    } else {
      singleTouchStart(event);
    }
  }

  function onTouchMove(event) {
    event.preventDefault();
    if (event.touches.length > 1) {
      doubleTouchMove(event);
    } else {
      singleTouchMove(event);
    }
  }

  /* Inititalization */

  catcher = document.getElementById(CATCHER_ID);
  eventTool.bind(catcher, 'touchstart', onTouchStart, true);
  eventTool.bind(catcher, 'touchmove', onTouchMove, true);
  return Promise.resolve();

};
