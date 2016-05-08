var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  name: String,
  intrID: String,
  pwd: String,
  phone: Number
});

module.exports = mongoose.model('User', UserSchema);

