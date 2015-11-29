$(function(){

	var $text = $('#text');
	var $id = $('#id');
	var socket = io();

	$text.keyup(function(event) {
		socket.emit('change', {id: $id.val(), text: $text.val()});
	});

	socket.on('change', function(data) {
		$text.val(data.text);
	});
});