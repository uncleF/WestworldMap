/* jshint browser:true */

'use strict';

let polyfills = require('utilities/polyfills');
let cache = require('utilities/cache');
let locations = require('locations/locations');
let map = require('map/map');
let ui = require('ui/ui');

polyfills();
cache();
locations()
  .then(map)
  .then(ui.init)
  .catch(ui.error);
