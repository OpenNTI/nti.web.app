Ext.define('NextThought.app.windows.StateStore', {
	extend: 'NextThought.common.StateStore',

	statics: {
		MIME_TO_CMP: {},

		register: function(mimeType, cmp) {
			this.MIME_TO_CMP[mimeType] = cmp;
		}
	},


	getComponentForMimeType: function(type) {
		return this.self.MIME_TO_CMP[type];
	},


	fireShowWindow: function(object, path, el) {
		this.fireEvent('show-window', object, path, el);
	}
});
