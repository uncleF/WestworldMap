/* jshint browser:true */

'use strict';

let animation;

function runAnimation(startTime, duration, value, change, task) {
  animation = requestAnimationFrame(_ => {
    let fraction = (Date.now() - startTime) / duration;
    if (fraction >= 1) {
      task(value + change);
    } else {
      task(value + change * fraction);
      runAnimation(startTime, duration, value, change, task);
    }
  });
}

function stopAnimation() {
  if (animation) {
    cancelAnimationFrame(animation);
  }
}

function go(duration, value, change, task) {
  runAnimation(Date.now(), duration, value, change, task);
}

exports.go = go;
exports.stop = stopAnimation;
