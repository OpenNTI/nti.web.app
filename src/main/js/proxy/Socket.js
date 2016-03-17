export default Ext.define('NextThought.proxy.Socket', {
	singleton: true,
	isDebug: $AppConfig.debugSocket,
	isVerbose: $AppConfig.debugSocketVerbosely,
	mixins: { observable: 'Ext.util.Observable' },

	constructor: function() {
		var me = this;
		me.mixins.observable.constructor.call(me);
		Ext.apply(me, {
			disconnectStats: {
				count: 0
			},
			socket: null,
			control: {
				//'connect': function(){me.onConnect.apply(me, arguments);},
				'reconnect': function(){me.onReconnect.apply(me, arguments);},
				'reconnecting': function(){me.onReconnecting.apply(me, arguments);},
				'reconnect_failed': function(){me.onReconnectFailed.apply(me, arguments);},
				'serverkill': function() {me.onKill.apply(me, arguments);},
				'error': function() {me.onError.apply(me, arguments);},
				'disconnect': function() {me.onDisconnect.apply(me, arguments);},
				'connecting': function() {me.onConnecting.apply(me, arguments);},
				'connect': function() {me.onConnected.apply(me, arguments);},
				'connect_failed': function() {me.onConnectFailed.apply(me, arguments);}
			}
		});

		window.onbeforeunload = Ext.Function.createSequence(
			window.onbeforeunload || Ext.emptyFn, function() { me.tearDownSocket(); });
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
			run: function() {
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


	wrapHandler: function(handler, name) {
		return function() {
				try {
					handler.apply(this, arguments);
				}
				catch (e) {
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

				if (this.socket) {
					if (this.isDebug){
						console.debug('registering handler for ', k);
					}
					//this handles sequencing appropriately
					this.socket.on(k, newControl[k]);
				}
				else{
					if (this.isDebug){
						console.debug('chaining handler for ', k, ' because socket not ready');
					}
					//No socket yet so track it (sequencing if necessary) for addition later
					x = this.control[k];
					this.control[k] = x ? Ext.Function.createSequence(x, f) : f;
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
			socket = io.connect(getURL(), {'reconnection delay': $AppConfig.socketReconnectDelay || 2000}),
			k;

		if (this.isDebug && !socket.emit.chained) {
			socket.emit = Ext.Function.createSequence(
				socket.emit,
				function() {console.debug('socket.emit:', arguments);}
			);
			socket.emit.chained = true;

			socket.onPacket = Ext.Function.createSequence(
				function() {
					var o = JSON.stringify(arguments);
					if ((me.isDebug && me.isVerbose) || o !== '{"0":{"type":"noop","endpoint":""}}') {
						console.debug('socket.onPacket: args:' + o);
					}
				},
				socket.onPacket
			);

			if (io.Transport.prototype.onHeartbeat) {
				io.Transport.prototype.onHeartbeat = Ext.Function.createSequence(
					function() {
						me.lastHeartbeat = new Date();
						if (me.isDebug && me.isVerbose) {
							console.debug('Recieved heartbeat from server', me.lastHeartbeat);
						}
					},
					io.Transport.prototype.onHeartbeat
				);
			}
		}

		for (k in this.control) {
			if (this.control.hasOwnProperty(k)) {
				if (this.isDebug){ 
					console.debug('Attaching handler for ', k);
				}
				socket.on(k, this.control[k]);
			}
		}

		this.socket = socket;
		this.fireEvent('socket-available');
	},


	onSocketAvailable: function(fn, scope) {
		if (this.socket) {
			Ext.callback(fn, scope);
			return;
		}
		this.on('socket-available', fn, scope, {single: true});
	},


	emit: function() {
		if (this.socket) {
			try {
				this.socket.emit.apply(this.socket, arguments);
			} catch (e) {
				console.error('No Socket?', e.stack || e.message || e);
			}
		}
		else if (this.isDebug) {
			console.debug('dropping emit, socket is down');
		}
	},

	/**
	 * Destroy the socket.
	 */
	tearDownSocket: function() {
		var s = this.socket;
		try {
			if (s) {
				delete this.socket;
				s.removeAllListeners();
				s.disconnect();
				//also can use s.socket.disconnectSync to synchronously disconnect, if you get extra messages after.
			}
		}
		catch (e) {
			console.error('Could not tear down socket... it may not have existed', e.stack || e.message || e);
		}
	},


	onError: function() {
		//TODO if we get called during handshake thats it, the socket is kaput.
		//Attempt to reconnect with an exponential backoff.
		if (this.isDebug) {
			console.error('ERROR: socket error' + JSON.stringify(arguments));
		}
	},

	onKill: function() {
		if (this.isDebug) {
			console.debug('server kill');
		}
		Ext.defer(this.tearDownSocket, 1, this);//new "thread"
	},

	onDisconnect: function() {
		var ds = this.disconnectStats;
		ds.count++;
		if (this.isDebug) {
			console.debug('Socket Disconnect ' + JSON.stringify(arguments) + ' count ' + ds.count);
		}
	},

	onReconnecting: function(){
		if(this.isDebug){
			console.log('reconnecting', arguments);	
		}	
	},

	onReconnect: function(){
		if(this.isDebug){
			console.log('reconnect', arguments);
		}
	},

	onReconnectFailed: function(){
		console.error('reconnect failed', arguments);
	},

	onConnecting: function(transportName) {
		if (this.isDebug) {
			console.log('Connecting with transport', transportName);
		}
	},

	onConnected: function() {
		var socket = this.socket.socket;

		if (this.sid !== socket.sessionid) {
			console.log('New Socket Session Id: ' + socket.sessionid);
			if (this.sid) {
				this.fireEvent('socket-new-sessionid', this.sid);
			}

			this.sid = socket.sessionid;

		}else {
			console.log('Same Socket Session Id: ' + this.sid);
		}

		if (this.isDebug) {
			console.log('Connected with transport', socket.transport.name);
		}
	},

	onConnectFailed: function() {
		console.error('Socket connection failed', arguments);
	}

});
