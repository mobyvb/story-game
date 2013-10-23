var User = require('../models/User.js');
var Game = require('../models/Game.js');
var Sentence = require('../models/Sentence.js');

exports.index = function(req, res) {
  User.findOne({username:req.session.username}, function(err, user) {
    var games = [];
    var errors = req.session.errors;
    req.session.errors = {};
    if(req.session.username) {
      if(user.games.length) {
        user.games.forEach(function(gameId, index, array) {
          Game.findById(gameId, function(err, game) {
            Sentence.find({game:gameId})
            .sort({created_at:'desc'})
            .limit(1)
            .exec(function(err, sentence) {
              games.push({
                id:gameId,
                sentence:sentence[0].content,
                currentPlayer:game.players[game.currentPlayer],
                players:game.players
              });
              if(index+1 === array.length) {
                res.render('user', {user:user, games:games, errors:errors});
              }
            });
          });
        });
      }
      else {
        res.render('user', {user:user, games:[], errors:errors})
      }
    }
    else {
      res.render('index', {errors:errors});
    }
  });
};

exports.signup = function(req, res) {
  new User({username: req.body.username, password: req.body.password}).save(function(err) {
    if(err) {
      console.log(err);
      res.redirect('/');
    }
    else {
      res.redirect('/');
    }
  });
};

exports.signin = function(req, res) {
  User.findOne({username:req.body.username}, function(err, user) {
    user.comparePassword(req.body.password, function(err, isMatch) {
      if(err) {
        console.log(err);
        res.redirect('/');
      }
      else if(isMatch) {
        req.session.username = user.username;
        res.redirect('/');
      }
      else {
        req.session.errors = {signin:['incorrect username or password']};
        res.redirect('/');
      }
    });
  });
};

exports.signout = function(req, res) {
  req.session.username = undefined;
  res.redirect('/');
};

exports.addFriend = function(req, res) {
  var currUserName = req.session.username;
  var friendName = req.body.username;
  User.findOne({username:friendName}, function(err, friend) {
    if(err) console.log(err);
    else if(friend) {
      User.findOne({username:currUserName}, function(err, currUser) {
        if(err) console.log(err);
        else {
          if(currUser.friends.indexOf(friendName) === -1) {
            currUser.friends.push(friendName);
            currUser.save();
            res.redirect('/');
          }
          else {
            req.session.errors = {friends:['already friends with ' + friendName]};
            res.redirect('/');
          }
        }
      });
    }
    else {
      req.session.errors = {friends:['there is no user named ' + friendName]};
      res.redirect('/');
    }
  });
};