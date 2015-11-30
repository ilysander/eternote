$.fn.getCursorPosition = function(){
	if(this.lengh == 0) return -1;
	return $(this).getSelectionStart();
}

$.fn.getSelectionStart = function(){
	if(this.lengh == 0) return -1;
	input = this[0];

	var pos = input.value.length;

	if (input.createTextRange) {
		var r = document.selection.createRange().duplicate();
		r.moveEnd('character', input.value.length);
		if (r.text == '') 
		pos = input.value.length;
		pos = input.value.lastIndexOf(r.text);
	} else if(typeof(input.selectionStart)!="undefined")
	pos = input.selectionStart;

	return pos;
}

$(function(){

	var $content = $('#content');
	var $id = $('#id');
	var socket = io();

	socket.emit('join', { textId: $id.val() });

	$content.keyup(function(e) {
		var text = { id: $id.val(), content: $content.val() }
		socket.emit('change', { text: text });
	});

	$content.click(function(e) {
		console.log($content.getCursorPosition());
	});

	socket.on('change', function(message) {
		$content.val(message.content);
	});
});