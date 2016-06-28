var mongoose = require('mongoose');
var HistorySchema = new mongoose.Schema({
  intrID: String,
  name: String,
  content: String,
  time: {type: Date, default: Date.now}
});

module.exports = mongoose.model('History', HistorySchema);
