/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

const CATCHER_ID = 'locations';

const ROTATION_STEP = 0.005;
const SCALE_STEP = 0.01;

module.exports = map => {

  let catcher;

  let startPosition;
  let startRotation;
  let startDistance;
  let startScale;

  /* Utilities */

  function calculateDistance(touches) {
    return Math.sqrt(Math.pow((touches[1].clientX - touches[0].clientX), 2) + Math.pow((touches[1].clientY - touches[0].clientY), 2));
  }

  /* Actions */

  function singleTouchMove(event) {
    requestAnimationFrame(_ => {
      let currentPosition = event.touches[0].clientX;
      let currentAngle = startRotation[1] + (startPosition - currentPosition) * ROTATION_STEP;
      let currentRotation = [startRotation[0], currentAngle, startRotation[2]];
      map.rotate(currentRotation);
    });
  }

  function doubleTouchMove(event) {
    requestAnimationFrame(_ => {
      let currentDistance = calculateDistance(event.touches);
      let currentScale = startScale + (currentDistance - startDistance) * SCALE_STEP;
      map.zoom(currentScale);
    });
  }

  function singleTouchStart(event) {
    startPosition = event.touches[0].clientX;
    startRotation = map.getRotation();
  }

  function doubleTouchStart(event) {
    startDistance = calculateDistance(event.touches);
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
