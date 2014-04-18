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
		this.notificationStore = NextThought.store.Stream.create({
			storeId: 'notifications',
			autoLoad: false,
			pageSize: 50,
			proxy: {
				type: 'rest',
				pageParam: undefined,
				limitParam: 'batchSize',
				startParam: 'batchBefore',
				reader: {
					type: 'nti',
					root: 'Items',
					totalProperty: 'TotalItemCount'
				},
				headers: {
					'Accept': 'application/vnd.nextthought.collection+json'
				},
				model: 'NextThought.model.Change'
			}
		});

		this.application.on('session-ready', this.onSessionReady, this);
	},

	onSessionReady: function() {
		var store = this.notificationStore;
		Service.getPageInfo(Globals.CONTENT_ROOT,
				//success:
				function(pageInfo) {
					var url = pageInfo.getLink(Globals.MESSAGE_INBOX);
					if (!url) {
						console.error('No Notifications url');
						url = 'bad-notifications-url';
					}

					store.lastViewed = new Date(0);

					Service.request(url + '/lastViewed')
							.then(function(lastViewed) {
								store.lastViewed = new Date(parseFloat(lastViewed) * 1000);
							})
							.fail(function() {
								console.warn('Could not resolve notification`s lastViewed');
							})
							.then(function() {
								store.proxy.proxyConfig.url = url;
								store.url = store.proxy.url = url;

								console.debug('Loading notifications: ' + url);
								store.load();
							});
				},
				//failure:
				function() {
					console.error('Could not setup notifications!');
				},
				this);
	},



	//refresher: this is called in the UserData controller in the socket change event handler.
	incomingChange: function(change) {
		var store = this.notificationStore;
		if (!store) { return; }
		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}

		if (change.isNotable()) {
			store.add(change);
		}
	}
});
