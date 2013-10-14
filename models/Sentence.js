var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SentenceSchema = new Schema({
  game: {type: Schema.ObjectId, required: true, index: {unique: true}},
  player: {type: String, required: true},
  content: {type: String, required: true},
  created_at: {type: Date}
});

SentenceSchema.pre('save', function(next) {
  if(!this.created_at) {
    this.created_at = new Date;
  }
  next();
});

module.exports = mongoose.model('Sentence', SentenceSchema);
