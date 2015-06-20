Ext.define('NextThought.app.stream.components.BasePage', {
	extend: 'Ext.container.Container',

	inheritableStatics: {
		MIME_TO_CMP: {},

		registerItem: function(mimeType, cmp) {
			this.MIME_TO_CMP[mimeType] = cmp;
		}
	},

	layout: 'none'
});
