const Ext = require('@nti/extjs');

require('../proxy/reader/Json');
require('../filter/FilterGroup');
require('../filter/Filter');
require('internal/legacy/model/Hit');

module.exports = exports = Ext.define('NextThought.store.Hit', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.Hit',
	autoLoad: false,
	groupField: 'GroupingField',

	proxy: {
		type: 'nti',
		reader: {
			type: 'nti',
			root: 'Items',
		},
	},

	loadRecords: function (records, options) {
		var response = Ext.JSON.decode(options.response.responseText, true),
			me = this;
		if (response) {
			this.queryString = response.Query;
			this.phraseSearch = response.PhraseSearch;
			if (this.phraseSearch !== undefined) {
				// Until we decide we want to replum all the search stuff to take an
				// additional parameter add it from the root to each record.
				Ext.each(records, function (record) {
					record.set('PhraseSearch', me.phraseSearch);
				});
			}
		}

		return this.callParent(arguments);
	},
});
