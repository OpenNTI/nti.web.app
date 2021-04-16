const { getServer } = require('@nti/web-client');

module.exports = exports = {
	get socket() {
		return getServer().getWebSocketClient();
	},

	get on() {
		const { socket } = this;
		return socket.addListener.bind(socket);
	},

	get onSocketAvailable() {
		const { socket } = this;
		return socket.onSocketAvailable.bind(socket);
	},

	get register() {
		const { socket } = this;
		return socket.register.bind(socket);
	},

	get send() {
		const { socket } = this;
		return socket.send.bind(socket);
	},
};
