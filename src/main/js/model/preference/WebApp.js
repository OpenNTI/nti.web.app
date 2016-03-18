var Ext = require('extjs');
var PreferenceBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.preference.WebApp', {
	extend: 'NextThought.model.preference.Base',

	fields: [
		{name: 'preferFlashVideo', type: 'bool'},
		{name: 'useHighContrast', type: 'bool'}
	],

	getResourceUrl: function() {
		var base = this.callParent(arguments);

		return base + '/WebApp';
	}
});
