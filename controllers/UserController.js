var User = require('../models/User.js');
var Game = require('../models/Game.js');
var Sentence = require('../models/Sentence.js');

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
    var errors = req.session.errors;
    var success = req.session.success;
    req.session.errors = {};
    req.session.success = {};
    if(req.session.username) {
      res.redirect('/profile');
    }
    else {
      res.render('index', {errors:errors, success:success});
    }
  });
};

exports.profile = function(req, res) {
  User.findOne({username:req.session.username}, function(err, user) {
    var errors = req.session.errors;
    req.session.errors = {};
    if(req.session.username) {
      res.render('profile', {errors:errors, user:user});
    }
    else {
      res.redirect('/');
    }
  });
}

exports.signup = function(req, res) {
  if(req.body.password !== req.body.confirmPassword) {
    req.session.errors = {signup:['your passwords do not match']};
    res.redirect('/');
  }
  else {
    new User({username: req.body.username.replace(' ', ''), password: req.body.password}).save(function(err) {
      if(err) {
        if(err.code===11000) {
          req.session.errors = {signup:[req.body.username + ' already exists']};
        }
        console.log(err);
        res.redirect('/');
      }
      else {
        req.session.success = {signup:['account successfully created']};
        res.redirect('/');
      }
    });
  }
};

exports.signin = function(req, res) {
  User.findOne({username:req.body.username.replace(' ', '')}, function(err, user) {
    if(user) {
      user.comparePassword(req.body.password, function(err, isMatch) {
        if(err) {
          console.log(err);
          res.redirect('/profile');
        }
        else if(isMatch) {
          req.session.username = user.username;
          res.redirect('/profile');
        }
        else {
          req.session.errors = {signin:['incorrect username or password']};
          res.redirect('/profile');
        }
      });
    }
    else {
      req.session.errors = {signin:[req.body.username + ' doesn\'t exist']};
      res.redirect('/profile');
    }
  });
};

exports.signout = function(req, res) {
  req.session.username = undefined;
  res.redirect('/profile');
};

exports.addFriend = function(req, res) {
  var currUserName = req.session.username;
  var friendName = req.body.username.replace(' ', '');
  if(friendName === currUserName) {
    req.session.errors = {friends:['you can\'t be friends with yourself']};
    res.redirect('/profile');
  }
  else {
    User.findOne({username:friendName}, function(err, friend) {
      if(err) console.log(err);
      else if(friend) {
        User.findOne({username:currUserName}, function(err, currUser) {
          if(err) console.log(err);
          else {
            if(currUser.friends.indexOf(friendName)===-1 && currUser.pendingFriends.indexOf(friendName)===-1) {
              currUser.friends.push(friendName);
              currUser.save();
              friend.pendingFriends.push(currUserName);
              friend.save();
              res.redirect('/profile');
            }
            else if(currUser.pendingFriends.indexOf(friendName) !== -1) {
              var index = currUser.pendingFriends.indexOf(friendName);
              currUser.friends.push(friendName);
              currUser.pendingFriends.splice(index, 1);
              currUser.save();
              res.redirect('/profile');
            }
            else {
              req.session.errors = {friends:['already friends with ' + friendName]};
              res.redirect('/profile');
            }
          }
        });
      }
      else {
        req.session.errors = {friends:['there is no user named ' + friendName]};
        res.redirect('/profile');
      }
    });
  }
};

exports.addEmail = function(req, res) {
  if(req.body.email) {
    if(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(req.body.email)) {
      var emailVerify;
      require('crypto').randomBytes(20, function(ex, buf) {
        emailVerify = buf.toString('hex');
      });

      User.findOne({username:req.session.username}, function(err, user) {
        if(user) {
          user.pendingEmail = req.body.email;
          user.emailVerify = emailVerify;
          user.save();

          var mailOptions = {
            from: 'Story Game <mvb.story.game@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'Verification', // Subject line
            text: 'Hey, ' + user.username + '! Please verify your email by clicking this link: http://mvb-story-game.herokuapp.com/verify/'+emailVerify
          };

          smtpTransport.sendMail(mailOptions, function(error, response) {
            if(error) {
              console.log(error);
            }
            else {
              console.log('message sent: ' + response.message);
            }
          });

          res.redirect('/profile');
        }
        else {
          res.redirect('/profile');
        }
      });
    }
    else {
      req.session.errors = {email:['please enter a valid email']};
      res.redirect('/profile');
    }
  }
  else if(req.params.code) {
    User.findOne({emailVerify:req.params.code}, function(err, user) {
      if(err) {
        console.log(err);
      }
      else if(!user) {
        res.redirect('/profile');
      }
      else {
        user.email = user.pendingEmail;
        user.emailVerify = '';
        user.pendingEmail = '';
        user.save();
        res.redirect('/profile');
      }
    });
  }
}

exports.addPhone = function(req, res) {
  if(req.body.phone) {
    var number = req.body.phone.replace(/\W/g, '');

    if(!/[a-zA-Z]/.test(number) && (number.length === 10 || (number.length===11 && number[0]==='1'))) {
      User.findOne({username:req.session.username}, function(err, user) {
        if(user) {
          if(number.length === 10) number = '1' + number;
          user.phone = number;
          user.save();

          smsClient.sendMessage({
            to:'+'+user.phone,
            from: '+18036102184',
            body: 'You are receiving notifications for the story game.'
          });

          res.redirect('/profile');
        }
        else {
          res.redirect('/profile');
        }
      });
    }
    else {
      req.session.errors = {phone:['please enter a valid US phone number']};
      res.redirect('/profile');
    }
  }
  else {
    req.session.errors = {phone:['please enter a valid phone number']};
    res.redirect('/profile');
  }
}
