var States = require('./states');

var GameState = function(SocektIO) {
	var _SECONDS_BEFOR_ROUND = 10 * 1000;
	var _SECONDS_ON_ROUND = 60 * 1000;
	var _rooms = [];
	var _SIZES_FOR_PLAYERS = [];
	_SIZES_FOR_PLAYERS[1] = {'rows' : 2, 'cols' : 8};
	_SIZES_FOR_PLAYERS[2] = {'rows' : 4, 'cols' : 8};
	_SIZES_FOR_PLAYERS[3] = {'rows' : 8, 'cols' : 8};

	SocektIO.on('connection', function (socket) {
		console.log("connect user = " + socket.id);
		initializationSocket(socket);
	});

	function _addInRoom(numPlayers) {
		var freeRoom = null;
		for (var i = 0; i < _rooms.length; ++i) 
			if (!_rooms[i].isFull() && _rooms[i].maxPlayers() === numPlayers && !_rooms[i].isRunning()) {
				freeRoom = _rooms[i];
				break;
			}

		if (freeRoom == null) {
			freeRoom = new States.Room(_rooms.length.toString(), numPlayers, _SECONDS_ON_ROUND,
			 _SIZES_FOR_PLAYERS[numPlayers].rows, _SIZES_FOR_PLAYERS[numPlayers].cols);
			_rooms.push(freeRoom);
		}
		return freeRoom;
	}

	function _startCountdown(room) {
		SocektIO.to(room.number()).emit("start_countdown", {'seconds' : _SECONDS_BEFOR_ROUND});
		setTimeout(_startGame, _SECONDS_BEFOR_ROUND, room);
	}

	function _startGame(room) {
		room.setRunning(true);
		var field = room.field();
		SocektIO.to(room.number()).emit("start_game", {'rows': field.rows(), 'cols' : field.cols(),  'field' : field});
		setTimeout(_gameOver, _SECONDS_ON_ROUND, room);
	}

	function _gameOver(room) {
		room.setRunning(false);
		var field = room.field();
		SocektIO.to(room.number()).emit("game_over", {'scoreGreen': field.green(), 'scoreRed': field.red()});
		var clients = io.sockets.clients(room.number());
		var numOfRoom = room.number();
		for (var i = 0; i < clients.length; ++i) {
			clients[i].leave(numOfRoom);
			_disjoin(clients[i]);
		}
		_rooms.splice(_rooms.indexOf(room), 1);
	}

	function _joinResponse(socket, success, numPlayers, playerColor) {
		socket.emit("join_response", {'success' : success,  'numPlayers' : numPlayers,  'playerColor' : playerColor});
	}

	function _playerJoinedBroadcast(socket, playerColor) {
		var playerRoom = socket.player.room().number();
		socket.to(playerRoom).emit("player_joined", {'playerColor' : playerColor});
	}

	function _playerDisjoinedBroadcast(socket, playerColor) {
		var playerRoom = socket.player.room().number();
		socket.to(playerRoom).emit("player_disjoined", {'playerColor' : playerColor});
	}
	

	function _clickResponse(socket, success, x, y, newColor) {
		socket.emit("click_response", {'success' : success, 'x' : x, 'y' : y, 'newColor' : newColor});
	}

	function _clickedBroadcast(socket, x, y, newColor) {
		var room = socket.player.room().number();
		socket.emit("clicked", {'x' : x, 'y' : y, 'newColor' : newColor});
	}

	function _disjoin(socket) {
		socket.player.setJoined(false);
		socket.emit("disjoin", {});
	}

	function initializationSocket(socket) {
		socket.on("join_request", function (data) {
			console.log("join_request from " + this.id);
			if (_SIZES_FOR_PLAYERS[data.numPlayers] == undefined) {
				_joinResponse(this, false, 0, 0);
				return;
			}

			if (this.player == undefined) {
				this.player =  new States.Player(this);
				this.player.setJoined(true);
			}

			var room = _addInRoom(data.numPlayers);
			room.addPlayer(this.player);
			socket.join(room.number());
			var col = this.player.color();
			_joinResponse(this, true, data.numPlayers,  col);
			_playerJoinedBroadcast(this, col);

			if (room.isFull())
				_startCountdown(room);
		});

		
		socket.on("disjoin_request", function() { 
			var player = this.player;
			_playerDisjoinedBroadcast(this, player.color());
			player.setJoined(false);
			player.room.removePlayer(player);
		});

		socket.on("disconnect", function() {
			var player = this.player;
			if (player.isJoined()) {
				_playerDisjoinedBroadcast(this, player.color());
				player.setJoined(false);
			}
			this.player.room().removePlayer(player);
			console.log("disconn user = " + this.id);
		});

		socket.on("click_request", function(data) {
			console.log("click_request " + data.x + " " + data.y);
			var x = data.x;
			var y = data.y;
			var roomOfPlayer = this.player.room();
			var field = roomOfPlayer.field();
			if (x >= 0 && y >= 0 && x < field.rows() && y < field.cols() && roomOfPlayer.isRunning()) {
				var newColor = field.invertColor(x, y);
				_clickResponse(this, true, x, y, newColor);
				_clickedBroadcast(this, x, y, newColor);
			} else
				_clickResponse(this, false, 0, 0, 0);
		});
	}
};

exports.GameState = GameState;