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
        for(var i=0; i<user.games.length; i++) {
          Game.findById(user.games[i], function(err, game) {
            var gameData = {
              id:game._id,
              currentPlayer:game.players[game.currentPlayer],
              players:game.players,
              finished:game.finished
            };
            if(game.finished) {
              Sentence.find({game:game._id})
              .sort({created_at:'asc'})
              .exec(function(err, sentences) {
                var content = '';
                sentences.forEach(function(sentence) {
                  content += sentence.content + ' ';
                });

                gameData.content = content;
                games.push(gameData);
                if(games.length === user.games.length) {
                  res.render('user', {user:user, games:games, errors:errors});
                }
              });
            }
            else {
              Sentence.find({game:game._id})
              .sort({created_at:'desc'})
              .limit(1)
              .exec(function(err, sentence) {
                gameData.sentence = sentence[0] ? sentence[0].content : null;
                games.push(gameData);
                if(games.length === user.games.length) {
                  res.render('user', {user:user, games:games, errors:errors});
                }
              });
            }
          });
        }
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
      if(err.code===11000) {
        req.session.errors = {signup:[req.body.username + ' already exists']};
      }
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
    if(user) {
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
    }
    else {
      req.session.errors = {signin:[req.body.username + ' doesn\'t exist']};
      res.redirect('/');
    }
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
