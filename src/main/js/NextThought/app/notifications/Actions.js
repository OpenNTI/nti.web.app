Ext.define('NextThought.app.notifications.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.login.StateStore',
		'NextThought.app.notifications.StateStore',
		'NextThought.app.userdata.StateStore',
		'NextThought.model.Change'
	],


	constructor: function() {
		this.callParent(arguments);

		this.NotificationsStore = NextThought.app.notifications.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();
		this.UserDataStore = NextThought.app.userdata.StateStore.getInstance();

		this.mon(this.UserDataStore, 'incomingChange', this.incomingChange, this);

		if (window.Service && !store.loading && !store.hasFinishedLoad) {
			this.doLogin();
		} else {
			this.mon(this.LoginStore, 'login-ready', this.doLogin.bind(this));
		}
	},


	doLogin: function() {
		var store = this.NotificationsStore;

		Service.getPageInfo(Globals.CONTENT_ROOT)
			.then(function(pageInfo) {
				var url = pageInfo.getLink(Globals.MESSAGE_INBOX),
					lastViewed = new Date(0);

				if (!url) {
					console.error('No Notifications url');
					url = 'bad-notifications-url';
				}

				Service.request(url + '/lastViewed')
					.then(function(_lastViewed) {
						//we get this back in seconds so convert it to millis
						lastViewed = new Date(parseFloat(_lastViewed) * 1000);
					})
					.fail(function() {
						console.warn('Could not resolve notifications lastViewed');
					})
					.always(function() {
						store.buildStore(url, lastViewed);
					});
			}, function() {
				console.error('Could not setup notifications!');
			});
	},

	incomingChange: function(change) {
		var me = this;

		this.NotificationsStore.getStore().then(function(store) {
			if (!store) { return; }
			if (!change.isModel) {
				 change = ParseUtils.parseItems([change])[0];
			}

			if (change.isNotable()) {
				 if (/^DELETE/i.test(change.get('ChangeType'))) {
					  me.NotificationsStore.removeRecord(change);
					  return;
				 }

				 me.NotificationsStore.addRecord(change);
			}
		});
	}
});
