/* jshint browser:true */

'use strict';

let mapLocations = require('mapLocations/mapLocations');
let map = require('map/map');
let ui = require('ui/ui');

mapLocations()
  .then(map)
  .then(ui);
