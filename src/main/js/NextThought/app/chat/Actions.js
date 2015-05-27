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


		if (window.Service && !store.loading && !store.hasFinishedLoading) {
			this.onLogin();
		} else if (!window.Service) {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var socket = this.ChatStore.getSocket();

		this.ChatStore.setLoaded();

		socket.register({
			'chat_setPresenceOfUsersTo': this.handleSetPresence.bind(this)
		});

		socket.onSocketAvailable(this.onSessionReady, this);
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
			store = me.ChatStore;

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
	}
});
