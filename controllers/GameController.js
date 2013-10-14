var Game = require('../models/Game.js');
var Sentence = require('../models/Sentence.js');

exports.index = function(req, res) {

};

exports.createGame = function(req, res) {
  var players = [];
  var friends = req.body.friends;
  if(typeof friends === 'object') players = friends;
  else players = [friends];
  players.push(req.session.username);
  players = shuffle(players);

  new Game({players:players, turnsPer:req.body.turnsPer, currentPlayer:0, turnsElapsed:0}).save(function(err) {
    if(err) {
      console.log(err);
      res.redirect('/');
    }
    else {
      res.redirect('/');
    }
  });
};

exports.addSentence = function(req,res) {

};

var shuffle = function(arr) {
  var newArr = [];
  while(arr.length) {
    var index = Math.floor((Math.random()*arr.length));
    newArr.push(arr[index]);
    arr.splice(index, 1);
  }
  return newArr;
};