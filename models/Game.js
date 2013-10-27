var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var GameSchema = new Schema({
  players: {type: Array, required: true, default: []},
  turnsPer: {type: Number, required: true, min: 1, default: 1},
  currentPlayer: {type: Number, required: true, min: 0, default: 0},
  turnsElapsed: {type: Number, required: true, min: 0, default: 0},
  finished: {type: Boolean, default: false}
});

GameSchema.pre('save', function(next) {
  var game = this;

  var numPlayers = game.players.length;
  var maxTurns = numPlayers * game.turnsPer;

  if(game.turnsElapsed >= maxTurns) {
  	game.finished = true;
  	next();
  }
  else {
  	next();
  }
});

module.exports = mongoose.model('Game', GameSchema);
