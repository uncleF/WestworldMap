/* jshint browser:true */

'use strict';

let map = require('map/map');
let locations = require('locations/locations');
let ui = require('ui/ui');

locations.init();
map.init(locations.locations());
ui(map, locations);
