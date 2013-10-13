var User = require('../models/User.js');

exports.profile = function(req, res) {
  res.render('index', {title: 'story game', user: req.session.user});
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
  User.find({username:req.body.username}, function(err, user) {
    user[0].comparePassword(req.body.password, function(err, isMatch) {
      if(err) res.render('signin', {title: 'Sign in', errors:true});
      else {
        req.session.user = user[0];
        res.redirect('/');
      }
    });
  });
};

exports.signout = function(req, res) {
  req.session.user = undefined;
  res.redirect('/');
};