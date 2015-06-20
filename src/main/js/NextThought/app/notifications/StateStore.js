Ext.define('NextThought.app.notifications.StateStore', {
	extend: 'NextThought.common.StateStore',


	setURL: function(url, lastViewed) {
		this.NOTABLE_URL = url;
		this.LAST_VIEWED = lastViewed;

		this.setLoaded();
	},


	getURL: function() {
		var me = this;

		return me.onceLoaded()
			.then(function() {
				return me.NOTABLE_URL;
			});
	},


	getLastViewed: function() {
		var me = this;

		return me.onceLoaded()
			.then(function() {
				return me.LAST_VIEWED;
			});
	}
});
