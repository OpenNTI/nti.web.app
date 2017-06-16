var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.stream.components.BasePage', {
	extend: 'Ext.container.Container',

	ISCHANGE: /change$/,

	inheritableStatics: {
		MIME_TO_CMP: {},

		registerItem: function (mimeTypes, cmp) {
			if (!Array.isArray(mimeTypes)) {
				mimeTypes = [mimeTypes];
			}

			var me = this;

			mimeTypes.forEach(function (mimeType) {
				me.MIME_TO_CMP[mimeType] = cmp;
			});
		}
	},

	layout: 'none',


	unwrapRecord: function (record) {
		if (this.ISCHANGE.test(record.get('MimeType'))) {
			return record.getItem();
		}

		return record;
	},


	getForMimeType: function (mimeType) {
		return this.self.MIME_TO_CMP[mimeType];
	},


	prependItems: function (records) {
		records.reverse().forEach((record) => this.prependItem(record));
	},


	prependItem: function (/*record*/) {}
});
