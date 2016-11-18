/* jshint browser:true */

'use strict';

let map = require('map/map');
let locations = require('locations/locations');
let ui = require('ui/ui');

locations.init();
map.init();
ui(map, locations);
