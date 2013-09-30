
/*
 * GET home page.
 */

var User = require('../models/user.js');
var Post = require('../models/post.js');

exports.index = function(req, res) {
  // User.find(function(err, users) {
  //   res.send(users);
  // });
  Post.find(function(err, posts) {
    res.send(posts);
  });
  // res.render('index', { title: 'story game' });
};

exports.signup = function(req, res) {
  res.render('signup', { title: 'Sign Up' });
};

exports.createUser = function(req, res) {
  new User({username: req.body.username, password: req.body.password}).save(function(err) {
    if(err) res.render('signup', {title: 'Sign Up', errors:true})
    else res.render('index', {title: 'story game'});
  });
};

exports.createPost = function(req, res) {
  User.find(function(err, users) {
    var user = users[0];
    new Post({body:'hello', user:user}).save(function(err) {
      res.send(user);
    });
  });
};

exports.showPostUser = function(req, res) {
  Post.find(function(err, posts) {
    var post = posts[0];
    User.findById(post.user, function(err, user) {
      res.send(user);
    });
  });
}