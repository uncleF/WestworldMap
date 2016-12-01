/* jshint browser: true */
/* global Modernizr */

'use strict';

function onSuccess(worker) {
  console.log('Service worker successfully installed with the scope of: ' + worker.scope);
}

function onFailure(error) {
  console.log('Failed to install service worker. ' + error);
}

module.exports = _ => {
  if (Modernizr.serviceworker) {
    navigator.serviceWorker.register('/service.js')
      .then(onSuccess)
      .catch(onFailure);
  }
};
