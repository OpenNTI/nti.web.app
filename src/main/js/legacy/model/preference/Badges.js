const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.preference.Badges', {
	extend: 'NextThought.model.preference.Base',

	fields: [
		{name: 'Course', type: 'Future'}
	],

	getResourceUrl: function () {
		var base = this.callParent(arguments);

		return base + '/Badges';
	}
});
