//models/Nota.js

module.exports = function (mongoose) {
	
	var Schema = mongoose.Schema;
	
	//Objeto modelo de Mongoose
	var NotaSchema = new Schema({
		
		//Propiedad id
		id:String, //nombre identificador de la pagina
		content:String
	});
	
	return mongoose.model('Nota',NotaSchema);
}