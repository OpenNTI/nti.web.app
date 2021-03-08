const Ext = require('@nti/extjs');
const Base = require('internal/legacy/model/Base');

require('internal/legacy/proxy/Preference');

module.exports = exports = Ext.define(
	'NextThought.model.preference.Base',
	{
		extend: 'Ext.data.Model',
		idProperty: 'Class',

		fields: [
			{ name: 'Class', type: 'String', persist: false },
			{ name: 'MimeType', type: 'String', useNull: false },
		],

		subPreferences: [],
		proxy: { type: 'preference', reader: 'json' },

		getResourceUrl: function () {
			return $AppConfig.Preferences.baseUrl;
		},

		save: function (ops) {
			let {
				callback = null,
				onlyChanges = false,
				...opsWithoutCallback
			} = ops || {};
			var me = this,
				url = me.getResourceUrl(),
				updated = onlyChanges ? me.getChanges() : me.asJSON(),
				request = Ext.apply(
					{
						url: url,
						method: 'PUT',
						jsonData: updated,
						callback: function (req, success) {
							if (success) {
								me.commit();
								me.fireEvent('changed', me);
								Ext.callback(callback || null);
							}
						},
					},
					opsWithoutCallback
				);

			Ext.Ajax.request(request);
		},
	},
	function () {
		this.borrow(Base, ['asJSON']);
	}
);
