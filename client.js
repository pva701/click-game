var io = require('socket.io-client');
socket = io.connect('http://localhost:8888');

socket.on("join_response", function (data) {
	console.log("join_response = " + data.success + " " + data.numPlayers + " " + data.playerColor);
});

socket.on("start_countdown", function(data) {
	console.log("start_countdown");
});

socket.on("start_game", function(data) {
	console.log("start_game");
});

socket.on("player_disjoined", function(data) {
	console.log("player_disjoined color = " + data.playerColor);
});

socket.on("player_joined", function(data) {
	console.log("player joined");
});

socket.emit("join_request", {'numPlayers' : 1});

socket.on("click_response", function(data) {
	console.log(data.success);
});

socket.emit("click_request", {'x' : 1, 'y' : 1});

console.log("started");