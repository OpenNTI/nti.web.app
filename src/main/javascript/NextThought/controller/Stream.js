Ext.define('NextThought.controller.Stream', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.proxy.Socket',
		'NextThought.util.Parsing'
	],

	stores: [
		'Stream'
	],

	models: [
		'Change',
		'PageInfo'
	],

	views: [],

	refs: [],

	init: function() {
		this.application.on('session-ready', this.onSessionReady, this);
	},

	onSessionReady: function() {
		//Load page and root stream stores...
		var ss = this.getStreamStore();

		Service.getPageInfo(Globals.CONTENT_ROOT,
			//success:
			function(pageInfo) {
				var url = pageInfo.getLink(Globals.RECURSIVE_STREAM);

				ss.proxy.proxyConfig.url = url;

				// There will be one store per view. This will just be a coordination store.
				// Socket events will add to here. And it is the responsibility of the
				// subsequent stores to listen for those adds.
				ss.setProxy({type: 'memory', url: url});
				ss.load(); //technically this is just firing an event "beforeload" that the substores use to get the resolved url.
			},
			//failure:
			function() {
				console.error('Could not load Stream Store!', arguments);
			},
			this);
	},



	//refresher: this is called in the UserData controller in the socket change event handler.
	incomingChange: function(change) {
		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}

		var item = change.get('Item'),
			store = this.getStreamStore();

		//add it to the root stream store, why the heck not?
		if (!item || item.mimeType.indexOf('redaction') < 0) {
			store.add(change);

			//reapply the stores filters
			if (store.isFiltered()) {
				store.filter();
			}
		}
	}
});
