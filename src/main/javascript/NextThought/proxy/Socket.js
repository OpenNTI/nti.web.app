Ext.define('NextThought.proxy.Socket', {
	singleton: true,
	isDebug: true,
	mixins: { observable: 'Ext.util.Observable' },

	constructor: function() {
		var me = this;
		me.mixins.observable.constructor.call(me);
		Ext.apply(me, {
			disconnectStats: {
				count:0
			},
			socket: null,
			control: {
				//'connect': function(){me.onConnect.apply(me, arguments);},
				'serverkill': function() {me.onKill.apply(me, arguments);},
				'error': function() {me.onError.apply(me, arguments);},
				'disconnect': function() {me.onDisconnect.apply(me, arguments);}
			}
		});

		window.onbeforeunload = Ext.Function.createSequence(
			window.onbeforeunload || function(){},
			function(){ me.tearDownSocket(); });
	},

	/**
	 * Set up a task that will check io availability every second until it becomes
	 * available, then call setupSocket.
	 *
	 * @param username
	 * @param password
	 */
	ensureSocketAvailable: function() {
		var task;

		task = {
			run: function(){
				if (window.io) {
					Ext.TaskManager.stop(task);
					this.setup();
				}
			},
			scope: this,
			interval: 1000
		};

		Ext.TaskManager.start(task);
	},


	wrapHandler: function(handler, name){
		return function(){
				try{
					handler.apply(this, arguments);
				}
				catch(e){
					console.error('Caught an uncaught exception when taking action on', name, Globals.getError(e));
				}
		};
	},

	register: function(newControl) {
		var k, x, f;
		for (k in newControl) {
			if (newControl.hasOwnProperty(k)) {
				//We don't want uncaught errors killing the sequence
				f = this.wrapHandler(newControl[k], k);
				//if there's already a callback registered, sequence it.
				x = this.control[k];
				this.control[k] = x ? Ext.Function.createSequence(x, f) : f;

				if(this.socket) {
					this.socket.on(k, this.control[k]);
				}
			}
		}
	},


	/**
	 * Attempts to create a socket connection to the dataserver for this user.
	 *
	 * @param username
	 * @param password
	 */
	setup: function() {
		if (!window.io) {//if no io, then call ensure to wait until io is available
			this.ensureSocketAvailable();
			return;
		}

		var me = this,
			socket = io.connect(getURL()),
			k;

		if(this.isDebug && !socket.emit.chained) {
			socket.emit = Ext.Function.createSequence(
				socket.emit,
				function(){console.debug('socket.emit:',arguments);}
			);
			socket.emit.chained = true;

			socket.onPacket = Ext.Function.createSequence(
				function(){ console.debug('socket.onPacket: args:'+JSON.stringify(arguments)); },
				socket.onPacket
			);
		}

		for (k in this.control) {
			if(this.control.hasOwnProperty(k)) {
				socket.on(k, this.control[k]);
			}
		}

		this.socket = socket;
	},

	emit: function() {
		if (this.socket) {
			this.socket.emit.apply(this.socket, arguments);
		}
		else if(this.isDebug) {
			console.debug('dropping emit, socket is down');
		}
	},

	/**
	 * Destroy the socket.
	 */
	tearDownSocket: function(){
		var s = this.socket;

		if(s) {
			delete this.socket;
			s.removeAllListeners();
			s.disconnect();
			//also can use s.socket.disconnectSync to synchronously disconnect, if you get extra messages after.
		}
	},


	onError: function() {
		//TODO if we get called during handshake thats it, the socket is kaput.
		//Attempt to reconnect with an exponential backoff.
		if(this.isDebug) {
			console.error('ERROR: socket error'+JSON.stringify(arguments));
		}
	},

	onKill: function() {
		if(this.isDebug){
			console.debug( 'server kill' );
		}
		this.tearDownSocket();
	},

	onDisconnect: function() {
		var ds = this.disconnectStats;
		ds.count ++;
		if(this.isDebug) {
			console.debug('Socket Disconnect ' + JSON.stringify(arguments) + ' count '+ds.count);
		}
	}

},
function() {
	window.Socket = NextThought.proxy.Socket;
}
);
