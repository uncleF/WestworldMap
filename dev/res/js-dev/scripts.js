/* jshint browser:true */

'use strict';

let locations = require('locations/locations');
let map = require('map/map');
let ui = require('ui/ui');

locations()
  .then(map)
  .then(ui);
