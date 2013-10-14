var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var GameSchema = new Schema({
  players: { type: Array, required: true, default: [] },
  turnsPer: {type: Number, required: true, min: 1, default: 1},
  currentPlayer: {type: Number, required: true, min: 0, default: 0},
  turnsElapsed: {type: Number, required: true, min: 0, default: 0}
});

module.exports = mongoose.model('Game', GameSchema);