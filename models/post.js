var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PostSchema = new Schema({
  body: { type: String, required: true },
  user: { type: Schema.ObjectId, required: true }
});

module.exports = mongoose.model('Post', PostSchema);