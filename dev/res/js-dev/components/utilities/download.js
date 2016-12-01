/* jshint browser: true */

'use strict';

module.exports = url => {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.addEventListener('load', (event) => {
      let data = JSON.parse(event.target.responseText);
      resolve(data);
    });
    request.addEventListener('error', _ => {
      reject();
    });
    request.open('GET', url);
    request.send();
  });
};
