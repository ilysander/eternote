var express = require('express');
var router = express.Router();
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var jsrender = require('node-jsrender');
var uuid = require('node-uuid');
require('./models');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 2000;

var util = require('util');
var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB 5242880
            maxFiles: 100,
            colorize: false,
            timestamp:myTimestamp
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp:myTimestamp
        })
    ],
    exitOnError: false
});
function myTimestamp() {
var time = new Date();
var tiempo = time.toString();
var milis = time.getMilliseconds();

var milisMostrar= '';
if(milis<10){milisMostrar='00'+milis}
else if(milis<100){milisMostrar='0'+milis}
else{milisMostrar=''+milis}

var fechaMostrar = tiempo.toString().substring(4,15);
var horaMostrar = tiempo.toString().substring(16,24);
return fechaMostrar + '|'+horaMostrar+'|'+milisMostrar;
};
module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
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

	getText(id, function(nota) {
		if (nota === undefined|| nota.length ==0) {
			nota = { id: id, content: '' }
			createText(nota);
		}

		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		res.end(jsrender.render['#noteTemplate'](nota));
	});

	
});

 // Handle 404
  app.use(function(req, res) {
      //res.render('404', { url: __dirname + '/public/pages/404.html' });
      //res.send('404: Page not Found', 404);
     //res.send('404: Page not Found', 404);
      logger.error('error 404 no se puede acceder al:'+req.url);
    //  res.sendfile(__dirname + '/public/pages/404.html');
  });
  
  // Handle 500
  app.use(function(err, req, res, next) {
     //res.send('500: Internal Server Error', 500);
      logger.error('error 505 :'+util.inspect(err));
    //  res.sendfile(__dirname + '/public/pages/404.html');
     //res.sendfile(__dirname + '/public/pages/404.html');
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
	
	socket.on('update', function(message) {
		// notifyContentChanged(socket, message.text);
		updateNote(message.text);
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
	// console.log('lista texts');
	// console.log(texts);
	texts.forEach(function(text2) {
		if (text2.id == id) {
			text = text2;
		}
	});
	
	if(text === undefined){
		db.Nota.find({ id: id },function (error,nota) {
		if(error)console.log(error);
		// console.log('busqueda en bd');
		// console.log(nota);
		//si encuentra registros actualiza
		if (nota.length !=0) {
			console.log('nota encontrada en mongo db !!!');
			texts.push(nota[0]);
		}
		callback(nota);
		});
	}else{
		callback(text);
	}
}

function updateText(text) {
	texts.forEach(function(text2) {
		if (text2.id == text.id) {
			text2.content = text.content;
		}
	});
	// db.Nota.update({ id: text.id}, { content: text.content },function (error,nota) {
	// 	console.log('actualizado!');
	// 	console.log(nota);
	// });
};

function updateNote(text) {
	//TODO debe tener atributo fecha para poder updatear el ultimo registro, esta fecha debe
	//actualizarse en el lado de servidor
	
	// texts.forEach(function(text2) {
	// 	if (text2.id == text.id) {
	// 		text2.content = text.content;
	// 	}
	// });
	db.Nota.update({ id: text.id}, { content: text.content },function (error,nota) {
		logger.info('actualizado!');
		// console.log(nota);
	});
};

function createText(nota) {
	texts.push(nota);
	// console.log('createText');
	// console.log(nota);
	var newNota= new db.Nota({
		id:nota.id,
		content:nota.content
	});
	// console.log(newNota);
	newNota.save(function (error,user) {
		if(error)console.log(error);
	});
	
};