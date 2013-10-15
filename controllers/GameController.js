var Game = require('../models/Game.js');
var Sentence = require('../models/Sentence.js');
var User = require('../models/User.js');

exports.index = function(req, res) {

};

exports.createGame = function(req, res) {
  var players = [];
  var friends = req.body.friends;
  if(typeof friends === 'object') players = friends;
  else players = [friends];
  players.push(req.session.username);
  players = shuffle(players);

  new Game({players:players, turnsPer:req.body.turnsPer}).save(function(err, game) {
    if(err) {
      console.log(err);
      res.redirect('/');
    }
    else {
      players.forEach(function(player) {
        User.findOne({username:player}, function(err, user) {
          user.games.push(game._id);
          user.save();
        });
      });

      res.redirect('/');
    }
  });
};

exports.addSentence = function(req,res) {
  Game.findById(req.body.gameId, function(err, game) {
    if(err) console.log(err);
    else {
      var currentPlayerName = game.players[game.currentPlayer];
      if(currentPlayerName===req.session.username) {
        new Sentence({
            game:game._id,
            player:currentPlayerName,
            content:req.body.sentence
          }).save(function(err) {
          if(err) {
            console.log(err);
            res.redirect('/');
          }
          else {
            game.currentPlayer++;
            if(game.currentPlayer>=game.players.length) game.currentPlayer = 0;
            game.turnsElapsed++;
            game.save();
            res.redirect('/');
          }
        });
      }
      else console.log('not your turn');
    }
  });
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