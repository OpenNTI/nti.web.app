Ext.define('NextThought.controller.Notifications', {
	extend: 'Ext.app.Controller',

	requires: [],

	stores: [
		'Stream'
	],

	models: [],

	views: [],

	refs: [],

	init: function() {
		this.application.on('session-ready', this.onSessionReady, this);
	},

	onSessionReady: function() {
		//Load page and root stream stores...

		Service.getPageInfo(Globals.CONTENT_ROOT,
				//success:
				function(pageInfo) {
					var url = pageInfo.getLink(Globals.MESSAGE_INBOX);
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
