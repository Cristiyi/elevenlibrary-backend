var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  name: String,
  intrID: String,
  pwd: String,
  phone: Number,
  borrowedBooks: [{unqId: String, name: String}]
});

module.exports = mongoose.model('User', UserSchema);

