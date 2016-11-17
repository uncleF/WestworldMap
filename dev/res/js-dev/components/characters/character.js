/* jshint browser:true */

'use strict';

module.exports = characterData => {

  let info;
  let dom;

  function createCharacter() {
    console.log('Create Character');
  }

  function createCharacterDOM() {
    console.log('Create Character DOM');
  }

  function updateCharacter() {
    console.log('Update Character');
  }

  function removeCharacter() {
    info = null;
  }

  function getCharacter() {
    return info;
  }

  function getCharacterName() {
    return info.name;
  }

  function getCharacterPicture() {
    return info.picture;
  }

  function getCharacterHumanity() {
    return info.human;
  }

  function getDOM() {
    return dom;
  }

  function initilizeCharacter() {
    info = createCharacter();
    dom = createCharacterDOM();
  }

  initilizeCharacter(characterData);

  return {
    update: updateCharacter,
    remove: removeCharacter,
    info: getCharacter,
    name: getCharacterName,
    picture: getCharacterPicture,
    human: getCharacterHumanity,
    dom: getDOM
  };

};
