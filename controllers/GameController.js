var Game = require('../models/Game.js');
var Sentence = require('../models/Sentence.js');
var User = require('../models/User.js');

var smsClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
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
      res.redirect('/');
    }
  });
};

exports.showGame = function(req, res) {
  var errors = req.session.errors;
  req.session.errors = {};
  Game.findById(req.params.id, function(err, game) {
    if(game) {
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
          res.render('game', {user:req.session.username, game:gameData, errors:errors});
        });
      }
      else {
        if(!req.session.username || req.session.username!==gameData.currentPlayer) {
          res.redirect('/games');
        }
        Sentence.find({game:game._id})
        .sort({created_at:'desc'})
        .limit(1)
        .exec(function(err, sentence) {
          gameData.sentence = sentence[0] ? sentence[0].content : null;
          res.render('game', {user:req.session.username, game:gameData, errors:errors});
        });
      }
    }
    else {
      res.redirect('/');
    }
  });
}

exports.createGameForm = function(req, res) {
  var errors = req.session.errors;
  req.session.errors = {};
  User.findOne({username:req.session.username}, function(err, user) {
    if(err || !user) {
      res.redirect('/');
    }
    else {
      res.render('newgame', {errors:errors, user:user})
    }
  });
};

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
          res.redirect('/games');
        }
        else {
          players.forEach(function(player) {
            User.findOne({username:player}, function(err, user) {
              if(user.username !== req.session.username) {
                if(user.email) {
                  var mailOptions = {
                    from: 'Story Game <mvb.story.game@gmail.com>', // sender address
                    to: user.email, // list of receivers
                    subject: 'You\'ve been added to a game!', // Subject line
                    text: 'Hey, ' + user.username + '! You have just been added to a new game by ' + req.session.username + '.'
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
                    body: 'Hey, ' + user.username + '! You have just been added to a new game by ' + req.session.username + '.'
                  });
                }
              }
              user.games.push(game._id);
              user.save();
            });
          });

          res.redirect('/game/'+game._id);
        }
      });
    }
    else {
      req.session.errors = {newgame:['turns per player must be a number that is one or greater']};
      res.redirect('/newgame');
    }
  }
  else {
    req.session.errors = {newgame:['you must add at least one other player']};
    res.redirect('/newgame');
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
            res.redirect('/game/'+game._id);
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
                  text: 'Hey, ' + nextPlayerName + '! ' + currentPlayerName + ' just submitted a sentence for a story you\'re participating in, and now it\'s your turn. http://stories.mobyvb.com/game/'+game._id
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
                  body: 'Hey, ' + nextPlayerName + '! ' + currentPlayerName + ' just submitted a sentence for a story you\'re participating in, and now it\'s your turn. http://stories.mobyvb.com/game/'+game._id
                });
              }
            });

            res.redirect('/games');
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