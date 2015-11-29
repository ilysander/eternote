var express = require('express');
var router = express.Router();
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var jsrender = require('node-jsrender');


var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var texts = [];

server.listen( port, function() {
	console.log("Web server listening on port " + port);
});

app.use('/resources', express.static(path.join(__dirname, '../frontend', 'resources')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

jsrender.express('html', app);
app.set('view engine', 'html');

jsrender.loadFileSync('#noteTemplate', './frontend/note.html');

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

router.get('/:id', function(req, res) {
	var id = req.params.id;
	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	var text;
	texts.forEach(function(text2) {
		if (text2.id == id) {
			text = text2;
			return;
		}
	});

	if (text === undefined) {
		var text = {id: id, text: ''}
		createText(text);
	}

	res.end(jsrender.render['#noteTemplate'](text));
});

io.on('connection', function (socket) {
	socket.on('change', function(text) {
		updateText(text);
		socket.broadcast.emit('change', { text: text.text });
	});
});

function updateText(text) {
	texts.forEach(function(text2) {
		if (text2.id == text.id) {
			text2.text = text.text
			return;
		}
	});
};

function createText(text) {
	texts.push(text);
};