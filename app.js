
/**
 * Module dependencies.
 */

var express = require('express')
  , users = require('./controllers/UserController.js')
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

app.get('/', users.profile);
app.get('/signup', users.signup);
app.post('/signup', users.createUser);
app.get('/signin', users.signin);
app.post('/signin', users.setUser);
app.get('/signout', users.signout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
