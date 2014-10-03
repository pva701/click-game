var io = require('socket.io').listen(8888);
var States = require('./states');
var GameState = require('./gamestate');

function start() {
	var game = new GameState.GameState(io);
	console.log("server has started");
};

exports.start = start;