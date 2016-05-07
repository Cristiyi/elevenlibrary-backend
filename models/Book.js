var mongoose = require('mongoose');
var BookSchema = new mongoose.Schema({
	unqId: String,
	isbn: String,
	name: String,
	status: Number,//0-free,1-reserved,2-borrowed
	applyTime: Date,
	borrowTime: Date,
	returnTime: Date,
	intrID: String,
	borrower : [{intrID: String, name: String }]
});

module.exports = mongoose.model('Book', BookSchema);

