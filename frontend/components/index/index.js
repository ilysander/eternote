$(function(){

	var $go = $('#go');
	var $note = $('#note');

	$go.click(function(){
		redirectNote($note.val());
	});

	$note.keypress(function( event ) {
  		if (event.which != 13 || $note.val().trim() == '') {
     		return;
	  	}

	  	redirectNote($note.val());
	});

	function redirectNote(id) {
		window.location = '/' + id;
	}

});