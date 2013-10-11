
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret:'something', cookie: {maxAge:2*365*24*60*60*1000}}));
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/story-game');
}

//production only
else if ('production' == app.get('env')) {
  //mongoose.connect('');
}

app.get('/', routes.index);
app.get('/signup', routes.signup);
app.post('/signup', routes.createUser);
app.get('/signin', routes.signin);
app.post('/signin', routes.setUser);
app.get('/signout', routes.signout);
app.get('/session/set/:value', function(req, res) {
  req.session.whatever = req.params.value;
  res.send('sup');
});
app.get('/session/get', function(req, res) {
  res.send(req.session.whatever);
});
app.get('/newpost', routes.createPost);
app.get('/showpostuser', routes.showPostUser);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
