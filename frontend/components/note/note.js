$(function(){

	var $content = $('#content');
	var $id = $('#id');
	var socket = io();

	socket.emit('join', { textId: $id.val() });

	$content.keyup(function(event) {
		var text = { id: $id.val(), content: $content.val() }
		socket.emit('change', { text: text });
	});

	socket.on('change', function(message) {
		$content.val(message.content);
	});
});