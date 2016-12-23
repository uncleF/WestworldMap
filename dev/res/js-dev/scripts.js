/* jshint browser:true */

'use strict';

// let cache = require('utilities/cache');
let polyfills = require('utilities/polyfills');
let locations = require('locations/locations');
let map = require('map/map');
let ui = require('ui/ui');

// cache();
polyfills();
locations()
  .then(map)
  .then(ui.init)
  .catch(ui.error);
