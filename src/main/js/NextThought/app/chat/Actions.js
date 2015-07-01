Ext.define('NextThought.app.chat.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.login.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.model.PresenceInfo',
		'NextThought.util.Parsing'
	],


	constructor: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		var store = this.ChatStore;


		if (window.Service && !store.loading && !store.hasFinishedLoad) {
			this.onLogin();
		} else if (!window.Service) {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var me = this,
			socket = me.ChatStore.getSocket();

		me.ChatStore.setLoaded();

		socket.register({
			'chat_setPresenceOfUsersTo': me.handleSetPresence.bind(me),
			'chat_recvMessage': me.onMessage.bind(me)

		});

		socket.onSocketAvailable(me.onSessionReady, me);

		me.mon(me.LoginStore, 'will-logout', function(callback) {
			me.changePresence('unavailable', null, null, callback);
		});
	},


	onSessionReady: function() {
		console.log('Chat onSessionReady');

		var me = this;

		//TODO: Get all the active chats out of temp storage and restore them

		$AppConfig.Preferences.getPreference('ChatPresence/Active')
			.then(function(value) {
				if (value) {
					me.changePresence(value.get('type'), value.get('show'), value.get('status'));
				} else {
					me.changePresence('available');
				}
			});
	},


	handleSetPresence: function(msg) {
		var me = this, key,
			store = me.ChatStore, value;

		for (key in msg) {
			if (msg.hasOwnProperty(key)) {
				value = ParseUtils.parseItems([msg[key]])[0];
				store.setPresenceOf(key, value, this.changePresence.bind(this));
			}
		}
	},


	changePresence: function(type, show, status, c) {
		var socket = this.ChatStore.getSocket(),
			username = $AppConfig.username,
			newPresence = (type && type.isPresenceInfo) ? type : NextThought.model.PresenceInfo.createPresenceInfo(username, type, show, status),
			callback = c ? c : function() {};

		if (!newPresence.isOnline()) {
			this.ChatStore.setMySelfOffline();
		}

		socket.emit('chat_setPresence', newPresence.asJSON(), callback);
	},


	onMessage: function(msg, opts) {
		var me = this, args = Array.prototype.slice.call(arguments),
				m = ParseUtils.parseItems([msg])[0],
				channel = m.get('channel'),
				cid = m.get('ContainerId'),
				w = this.ChatStore.getChatWindow(cid);

		if (!w) {
			this.rebuildWindow(cid, function() {
				me.onMessage.apply(me, args);
			});
			return;
		}

		this.channelMap[channel].call(this, m, opts || {});

		if (channel !== 'STATE') {
			// NOTE: We don't want state channel notifications to trigger showing the window initially or adding
			// notification counts, only when an actual message is sent should we do this.
			w.notify(msg);
			/*if (!w.minimized && !w.isVisible() && w.hasBeenAccepted()) {
				w.show();
			}
			else {
				w.notify();
			}*/
		}
	},


	startChat: function(users, containerId) {
		var ri, m;

		if (!containerId) {
			containerId = Globals.CONTENT_ROOT;
		}

		if(!Ext.isArray(users)) {
			users = users && users.isModel ? users.getName() : users;
			users = [users];
		}

		users.push($AppConfig.username);
		users = Ext.unique(users);

		ri = this.ChatStore.getRoomInfo(users, containerId);
		if (ri) {
			this.ChatStore.showChatWindow(ri);
		}
		else {
			//If there were no existing rooms, create a new one.
			m = new NextThought.model.RoomInfo({
				'Occupants': users,
				'ContainerId': containerId
			});

			this.ChatStore.showChatWindow(m);
		}

	}
});
