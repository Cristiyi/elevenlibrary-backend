var mongoose = require('mongoose');
var BookSchema = new mongoose.Schema({
  unqId: String,
  isbn: String,
  name: String,
  category: String,
  publisher: String,
  author: String,
  pageCount: Number,
  price: String,
  desc: String,
  image: String,
  count: Number,

  status: Number, //0-free,1-reserved,2-borrowed
  intrID: String,
  applyTime: Date,
  borrowTime: Date,
  returnTime: Date,

  likes: [String], // Likes
  rates: [{ intrID: String, value: Number }], // Rates
  comments: [{ intrID: String, content: String, time: Date }], // Comments
});

module.exports = mongoose.model('Book', BookSchema);
