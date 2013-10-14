var User = require('../models/User.js');

exports.index = function(req, res) {
  User.findOne({username:req.session.username}, function(err, user) {
    res.render('index', {title: 'story game', user: user});
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
            console.log('already friends');
          }
        }
      });
    }
    else {
      console.log('user doesn\'t exist');
    }
  });
};