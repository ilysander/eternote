//models/index.js
if(!global.hasOwnProperty('db')){
	
	var mongoose = require('mongoose');
	
	var dbName = 'eternote'
	
	//the application is executed on the local machine...
	mongoose.connect('mongodb://localhost/'+dbName);
	
	global.db = {
		mongoose:mongoose,
		//modelos
		Nota:require('./Nota')(mongoose)
		
		//agregar mas modelos aqui
	};
}

module.exports = global.db;