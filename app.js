
/**
 * Module dependencies.
 */

var express = require('express')
  , users = require('./controllers/UserController.js')
  , games = require('./controllers/GameController.js')
  , http = require('http')
  , path = require('path');
var mongoose = require('mongoose');

var app = express();

var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/story-game';

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret:'4J6YlRpJhFvgNmg',
  cookie: {maxAge:2*365*24*60*60*1000},
  store: new (require('express-sessions'))({
    storage: 'mongodb',
    instance: mongoose,
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || 27017,
    db: process.env.MONGO_DATABASE || 'story-game',
    collection: 'sessions',
    expire: 2*365*24*60*60*1000
  })
}));
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(uristring);

app.get('/', users.index);
app.get('/profile', users.profile);
app.post('/signup', users.signup);
app.post('/signin', users.signin);
app.get('/signout', users.signout);
app.post('/addfriend', users.addFriend);
app.get('/verify/:code', users.addEmail);
app.post('/addemail', users.addEmail);
app.post('/addphone', users.addPhone);
app.get('/games', games.index);
app.get('/game/:id', games.showGame);
app.get('/newgame', games.createGameForm);
app.post('/newgame', games.createGame);
app.post('/game', games.addSentence);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
