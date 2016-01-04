//models/index.js
if(!global.hasOwnProperty('db')){
	
	var mongoose = require('mongoose');
	
	var dbName = 'eternote'
	
	//the application is executed on the local machine...
	//mongoose.connect('mongodb://localhost/'+dbName);
	mongoose.connect('mongodb://admin:1234@ds041683.mongolab.com:41683/'+dbName);
	global.db = {
		mongoose:mongoose,
		//modelos
		Nota:require('./Nota')(mongoose)
		
		//agregar mas modelos aqui
	};
}

module.exports = global.db;