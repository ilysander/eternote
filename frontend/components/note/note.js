$.fn.getCursorPosition = function(){
	if(this.lengh == 0) return -1;
	return $(this).getSelectionStart();
}

$.fn.getSelectionStart = function(){
	if(this.lengh == 0) return -1;
	input = this[0];//todo el content

	var pos = input.value.length;//longitud de todo el texto
	if (input.createTextRange) {
		var r = document.selection.createRange().duplicate();
console.log(r);
		r.moveEnd('character', input.value.length);
		if (r.text == '') 
		pos = input.value.length;
		pos = input.value.lastIndexOf(r.text);
	} else if(typeof(input.selectionStart)!="undefined"){
		pos = input.selectionStart;//obtiene la posicion del cursor
		// console.log('input')
		// console.log(input)
		// console.log('pos')
		// console.log(pos);		
	}

	return pos;
}
var ultimoContenido ='';
$(function(){

	var $content = $('#content');
	var $id = $('#id');
	var socket = io();

	socket.emit('join', { textId: $id.val() });

	$content.keyup(function(e) {
		var nota = { id: $id.val(), content: $content.val() }
		socket.emit('change', { text: nota });
	});

	$content.click(function(e) {
		console.log($content.getCursorPosition());
	});
	
	$content.blur(function (e) {
		var ultimoContenidoAux = $content.val();
		if (ultimoContenidoAux == ultimoContenido) {
			console.log('el contenido no ha cambiado');
		}else{
			ultimoContenido = ultimoContenidoAux;
			var nota = { id: $id.val(), content: ultimoContenidoAux }
			socket.emit('update', { text: nota });
			console.log('update');
			
		}
	});

	socket.on('change', function(message) {
		$content.val(message.content);
	});
});