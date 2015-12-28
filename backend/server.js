var express = require('express');
var router = express.Router();
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var jsrender = require('node-jsrender');
var uuid = require('node-uuid');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

var sockets = [];

// simulating table "texts"
var texts = [];

server.listen( port, function() {
	console.log("Web server listening on port " + port);
});

app.use('/assets', express.static(path.join(__dirname, '../frontend', 'assets')));
app.use('/components', express.static(path.join(__dirname, '../frontend', 'components')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

jsrender.express('html', app);
app.set('view engine', 'html');

jsrender.loadFileSync('#noteTemplate', path.join(__dirname, '../frontend', 'components', 'note', 'note.html'));

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../frontend', 'components', 'index', 'index.html'));
});

router.get('/:id', function(req, res) {
	var id = req.params.id;

	getText(id, function(text) {
		if (text === undefined) {
			text = { id: id, content: '' }
			createText(text);
		}

		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		res.end(jsrender.render['#noteTemplate'](text));
	});

	
});

io.on('connection', function (socket) {
	var joined = false;

	socket.on('join', function(message) {
		socket.textId = message.textId;
		socket.id = uuid.v1();
		sockets.push(socket);
		joined = true;
	});

	socket.on('change', function(message) {
		notifyContentChanged(socket, message.text);
		updateText(message.text);
	});

	socket.on('disconnect', function() {
		if (joined) {
			sockets.forEach(function(socket2, index) {
				if (socket2.id == socket.id) {
					sockets.splice(index,1);
					return;
				}
			});
		}
	});
});

function notifyContentChanged(socketOrigin, text) {
	sockets.forEach(function(socket) {
		if (socket.textId == text.id && socket.id != socketOrigin.id) {
			socket.emit('change', { content: text.content });
		}
	});
};

function getText(id, callback) {
	var text;
	texts.forEach(function(text2) {
		if (text2.id == id) {
			text = text2;
		}
	});

	callback(text);
}

function updateText(text) {
	texts.forEach(function(text2) {
		if (text2.id == text.id) {
			text2.content = text.content;
		}
	});
};

function createText(text) {
	texts.push(text);
};