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

	onSessionReady: function(){
		//Load page and root stream stores...
		var ss = this.getStreamStore();

		$AppConfig.service.getPageInfo(Globals.CONTENT_ROOT,
			//success:
			function(pageInfo){
				var p = ss.getProxy();
				p.extraParams = Ext.apply(p.extraParams||{},{
		            exclude: 'application/vnd.nextthought.redaction'
		        });
				p.url = pageInfo.getLink(Globals.RECURSIVE_STREAM);

				ss.load();
			},
			//failure:
			function(){
				console.error('Could not load Stream Store!', arguments);
			},
			this);
	},



	incomingChange: function(change) {
		if(!change.isModel){
			change = ParseUtils.parseItems([change])[0];
		}

		var item = change.get('Item');

		//add it to the root stream store, why the heck not?
		if(!item || item.mimeType.indexOf('redaction')<0){
			this.getStreamStore().add(change);
		}
	}
});
