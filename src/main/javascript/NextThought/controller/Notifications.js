Ext.define('NextThought.controller.Notifications', {
	extend: 'Ext.app.Controller',

	requires: [],

	stores: [
		'Stream'
	],

	models: [],

	views: ['account.notifications.Panel'],

	refs: [],

	init: function() {
		this.notificationStore = NextThought.store.Stream.create({storeId: 'notifications'});
		this.application.on('session-ready', this.onSessionReady, this);
	},

	onSessionReady: function() {
		var store = this.notificationStore;
		Service.getPageInfo(Globals.CONTENT_ROOT,
				//success:
				function(pageInfo) {
					var url = pageInfo.getLink(Globals.MESSAGE_INBOX);
					store.url = store.proxy.url = url;
					store.load();
				},
				//failure:
				function() {
					console.error('Could not setup notifications!');
				},
				this);
	},



	//refresher: this is called in the UserData controller in the socket change event handler.
	incomingChange: function(change) {
		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}
	}
});
