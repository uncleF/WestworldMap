/* jshint browser:true */
/* global self */
/* global caches */

'use strict';

var CACHE_NAME = 'tx-cache-v1';

var offline = [
  '/',
  '/res/css/styles.min.css',
  '/res/js/scripts.min.js',
  '/scene/scene.json',
  '/data/locations.json'
];

function addAllToCahche(cache) {
  return cache.addAll(offline);
}

function onInstall(event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(addAllToCahche)
  );
}

function onFetch(event) {

  var request = event.request;

  function fetchedFromNetwork(response) {
    var clonedResponse = response.clone();
    caches
      .open(CACHE_NAME)
      .then(function(cache) {
        cache.put(request, clonedResponse);
      });
    return response;
  }

  function queriedCache(cached) {
    var networked = fetch(request).then(fetchedFromNetwork);
    return cached || networked;
  }

  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  } else {
    event.respondWith(caches.match(request).then(queriedCache));
  }

}

self.addEventListener('install', onInstall);

self.addEventListener('fetch', onFetch);
