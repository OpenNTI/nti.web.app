var Ext = require('extjs');
require('../Base');
require('./CourseInstanceSharingScope');


module.exports = exports = Ext.define('NextThought.model.courses.CourseInstanceSharingScopes', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseinstancesharingscopes',

	fields: [
		{name: 'DefaultSharingScopeNTIID', type: 'string'},
		{name: 'Items', type: 'collectionItem'}
	],


	getDefaultSharing: function () {
		return this.get('DefaultSharingScopeNTIID');
	},


	getScope: function (name) {
		//I assume this will always be a singular item, not an array/set of items...
		//as in Public will map to a singular entity (a Community so far in my poking...)
		return this.getFieldItem('Items', name);
	},


	containsDefault: function () {
		return !!this.getDefaultScope();
	},


	getScopeForId: function (id) {
		var items = this.get('Items') || [], i;

		for (i = 0; i < items.length; i++) {
			if (items[i].getId && items[i].getId() === id) {
				return items[i];
			}
		}

		return null;
	},


	getDefaultScope: function () {
		var defaultId = this.getDefaultSharing();

		return this.getScopeForId(defaultId);
	}
});
