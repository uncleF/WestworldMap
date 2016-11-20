/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

const CONTAINER_ID = 'locations';

const ROTATION_STEP = 0.005;
const SCALE_STEP = 0.01;

module.exports = map => {

  let container;

  let startPosition;
  let startAngle;
  let startDistance;
  let startScale;

  function calculateDistance(touches) {
    return Math.sqrt(Math.pow((touches[1].clientX - touches[0].clientX), 2) + Math.pow((touches[1].clientY - touches[0].clientY), 2));
  }

  function doubleTouchMove(event) {
    requestAnimationFrame(_ => {
      let currentDistance = calculateDistance(event.touches);
      let currentScale = startScale + (currentDistance - startDistance) * SCALE_STEP;
      map.zoom(currentScale);
    });
  }

  function singleTouchMove(event) {
    requestAnimationFrame(_ => {
      let currentPosition = event.touches[0].clientX;
      let currentAngle = startAngle + (currentPosition - startPosition) * ROTATION_STEP;
      map.rotate(currentAngle);
    });
  }

  function doubleTouchStart(event) {
    startDistance = calculateDistance(event.touches);
    startScale = map.scale();
  }

  function singleTouchStart(event) {
    startPosition = event.touches[0].clientX;
    startAngle = map.angle();
  }

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

  container = document.getElementById(CONTAINER_ID);
  eventTool.bind(container, 'touchstart', onTouchStart, true);
  eventTool.bind(container, 'touchmove', onTouchMove, true);

};
