var User = require('../models/User.js');

exports.profile = function(req, res) {
  User.findOne({username:req.session.username}, function(err, user) {
    res.render('index', {title: 'story game', user: user});
  });
};

exports.signup = function(req, res) {
  res.render('signup', { title: 'Sign Up' });
};

exports.createUser = function(req, res) {
  new User({username: req.body.username, password: req.body.password}).save(function(err) {
    if(err) res.render('signup', {title: 'Sign Up', errors:true})
    else {
      res.render('signin', {title: 'Sign in'});
    }
  });
};

exports.signin = function(req, res) {
  res.render('signin', { title: 'Sign in' });
};

exports.setUser = function(req, res) {
  User.findOne({username:req.body.username}, function(err, user) {
    user.comparePassword(req.body.password, function(err, isMatch) {
      if(err) res.render('signin', {title: 'Sign in', errors:true});
      else {
        req.session.username = user.username;
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