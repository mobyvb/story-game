
/*
 * GET home page.
 */

var User = require('../models/user.js');

exports.index = function(req, res) {
  User.find(function(err, users) {
    res.send(users);
  });
  //res.render('index', { title: 'Express' });
};

exports.signup = function(req, res) {
  res.render('signup', { title: 'Sign Up' });
};

exports.createUser = function(req, res) {
  new User({username: req.body.username, password: req.body.password}).save();
  res.render('index', { title: 'Home' });
};