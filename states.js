
function Player(socket) {
	this._socket = socket;
	this._color = 0;
	this._joined = false;
	this._room = null;
};

Player.prototype = {
	setColor: function(col) {
		this._color = col;
	},

	color: function() {
		return this._color;
	},

	socket: function() {
		return this._socket;
	},

	setJoined: function(join) {
		this._joined = join;
	},

	isJoined: function() {
		return this._joined;
	},

	setRoom: function(room) {
		this._room = room;
	},

	room: function() {
		return this._room;
	}
};

function Field(rows, cols) {
	this._rows = rows;
	this._cols = cols;
	this._red = 0;
	this._green = 0;
	this.RED_COLOR = 1;
	this.GREEN_COLOR = 2;
	this._field = [];
	for (var i = 0; i < rows; ++i) {
		this._field[i] = [];
		for (var j = 0; j < cols; ++j) {
			if (Math.random() < 0.5) 
				this._field[i][j] = this.RED_COLOR;
			else 
				this._field[i][j] = this.GREEN_COLOR;
		}
	}
};

Field.prototype = {
	rows: function () {
		return this._rows;
	},

	cols: function() {
		return this._cols;
	},

	green: function() {
		return this._green;
	},

	red: function() {
		return this._red;
	},

	invertColor: function(x, y) {
		if (this._field[x][y] === this.RED_COLOR)
			this._field[x][y] = this.GREEN_COLOR;
		else
			this._field[x][y] = this.RED_COLOR;
	}
};

function Room(number, maxPlayers, length, rows, cols) {
	this._running = false;
	this._numOfGreenPlayers = 0;
	this._numOfRedPlayers = 0;
	this._field = new Field(rows, cols);
	this._number = number;
	this._maxPlayers = maxPlayers;
	this._length = length;
};

Room.prototype = {
	isRunning: function () {
		return this._running;
	},

	setRunning: function (running) {
		this._running = running;
	},

	isFull: function() {
		return (this._numOfRedPlayers + this._numOfGreenPlayers) === 2 * this._maxPlayers;
	},

	number: function() {
		return this._number;
	},

	length: function () {
		return this._length;
	},

	maxPlayers: function() {
		return this._maxPlayers;
	},

	field: function() {
		return this._field;
	},

	addPlayer: function(player) {
		var retColor;
		console.log("add player " + this._numOfRedPlayers + " " + this._numOfGreenPlayers);
		if (this._numOfGreenPlayers > this._numOfRedPlayers) {
			retColor = this._field.RED_COLOR;
			this._numOfRedPlayers++;
		} else {
			retColor = this._field.GREEN_COLOR;
			this._numOfGreenPlayers++;
		}
		player.setColor(retColor);
		player.setRoom(this);
		return retColor;
	},

	removePlayer: function(player) {
		if (player.color() === this._field.RED_COLOR)
			this._numOfRedPlayers--;
		else
			this._numOfGreenPlayers--;
	}
};

exports.Player = Player;
exports.Room = Room;
exports.Field = Field;