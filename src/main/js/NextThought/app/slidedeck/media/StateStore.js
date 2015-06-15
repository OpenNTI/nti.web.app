Ext.define('NextThought.app.slidedeck.media.StateStore', {
	extend: 'NextThought.common.StateStore',

	getContext: function(cmp) {
		if (!this.pageContextMap) {
			this.pageContextMap = {};
		}

		if (cmp) {
			var c = this.pageContextMap;

			if (!c.hasOwnProperty(cmp.id)) {
				cmp.on('destroy', function() {
					delete c[cmp.id];
				});
			}
		
			c[cmp.id] = c[cmp.id] || {};

			return c[cmp.id];
		}

		return this.currentContext;
	}
});
