var Game = require('../models/Game.js');
var Sentence = require('../models/Sentence.js');
var User = require('../models/User.js');

var smsClient = require('twilio');
var smtpTransport = require('nodemailer').createTransport('SMTP',{
  service: 'Gmail',
  auth: {
    user: 'mvb.story.game@gmail.com',
    pass: process.env.ADMIN_GMAIL_PASS
  }
});

exports.index = function(req, res) {
  User.findOne({username:req.session.username}, function(err, user) {
    var games = [];
    var errors = req.session.errors;
    req.session.errors = {};
    if(req.session.username) {
      if(user.games.length) {
        for(var i=0; i<user.games.length; i++) {
          Game.findById(user.games[i], function(err, game) {
            var turnsLeft = game.players.length*game.turnsPer - game.turnsElapsed;
            var gameData = {
              id:game._id,
              currentPlayer:game.players[game.currentPlayer],
              players:game.players,
              turnsLeft:turnsLeft,
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
                  res.render('gamelist', {user:user, games:games, errors:errors});
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
                  res.render('gamelist', {user:user, games:games, errors:errors});
                }
              });
            }
          });
        }
      }
      else {
        res.render('gamelist', {user:user, games:[], errors:errors})
      }
    }
    else {
      res.render('index', {errors:errors});
    }
  });
};

exports.showGame = function(req, res) {

}

exports.createGame = function(req, res) {
  var players = [];
  var friends = req.body.friends;
  if(friends) {
    if(typeof friends === 'object') players = friends;
    else players = [friends];
    players = shuffle(players);
    players.unshift(req.session.username);
    var turnsPer = ~~req.body.turnsPer;
    if(turnsPer >= 1) {
      new Game({players:players, turnsPer:turnsPer}).save(function(err, game) {
        if(err) {
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
    }
    else {
      req.session.errors = {newgame:['turns per player must be a number that is one or greater']};
      res.redirect('/');
    }
  }
  else {
    req.session.errors = {newgame:['you must add at least one other player']};
    res.redirect('/');
  }
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

            var nextPlayerName = game.players[game.currentPlayer];
            User.findOne({username:nextPlayerName}, function(err, user) {
              if(user.email) {
                var mailOptions = {
                  from: 'Story Game <mvb.story.game@gmail.com>', // sender address
                  to: user.email, // list of receivers
                  subject: 'It\'s your turn!', // Subject line
                  text: 'Hey, ' + nextPlayerName + '! ' + currentPlayerName + ' just submitted a sentence for a story you\'re participating in, and now it\'s your turn. Go to http://mvb-story-game.herokuapp.com to continue the story.'
                };

                smtpTransport.sendMail(mailOptions, function(error, response) {
                  if(error) {
                    console.log(error);
                  }
                  else {
                    console.log('message sent: ' + response.message);
                  }
                });
              }
              if(user.phone) {
                smsClient.sendMessage({
                  to:'+'+user.phone,
                  from: '+18036102184',
                  body: 'Hey, ' + nextPlayerName + '! ' + currentPlayerName + ' just submitted a sentence for a story you\'re participating in, and now it\'s your turn.'
                });
              }
            });

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