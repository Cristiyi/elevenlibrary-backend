var mongoose = require('mongoose');
var Log = new mongoose.Schema({
  time: {type: Date, default: Date.now},
  url: String,
  req: {},
  err: {}
});

module.exports = mongoose.model('Log', Log);

