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

  function onMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(_ => {
      let currentPosition = event.clientX;
      let currentAngle = startAngle + (startPosition - currentPosition) * ROTATION_STEP;
      map.rotate(currentAngle);
    });
  }

  function onMouseUp() {
    eventTool.unbind(document, 'mousemove', onMouseMove);
    eventTool.unbind(document, 'mouseup', onMouseUp);
  }

  function initializeMouseMove() {
    eventTool.bind(document, 'mousemove', onMouseMove);
    eventTool.bind(document, 'mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    event.preventDefault();
    startPosition = event.clientX;
    startAngle = map.angle();
    initializeMouseMove();
  }

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    let startScale = map.scale();
    let deltaScale = event.deltaY > 0 ? SCALE_STEP : -SCALE_STEP;
    map.zoom(startScale + deltaScale * 2);
  }

  container = document.getElementById(CONTAINER_ID);
  eventTool.bind(container, 'mousedown', onMouseDown);
  eventTool.bind(container, 'wheel', onWheel);

};
