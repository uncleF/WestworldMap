/* jshint browser:true */

'use strict';

const character = require('./character');

module.export = characterData => {

  let list;
  let dom;

  function createCharacterList() {
    console.log('Create Character List');
  }

  function createCharactersDOM() {
    console.log('Create Characters DOM');
  }

  function updateCharacterList() {
    console.log('Update Character List');
  }

  function getCharacterList() {
    return list;
  }

  function getDOM() {
    return dom;
  }

  function initializeCharacters() {
    list = createCharacterList();
    dom = createCharactersDOM();
  }

  initializeCharacters();

  return {
    update: updateCharacterList,
    list: getCharacterList,
    dom: getDOM
  };

};
