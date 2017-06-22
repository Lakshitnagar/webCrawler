var mongoose = require('mongoose');

var schema = mongoose.Schema;

var nodeSchema = new schema({
	parentNode: {type:String},
	currentNode: {type:String},
	url: {type:String},
	childNodes: [{type:String}]
});

var model = mongoose.model('node', nodeSchema);

module.exports = model;