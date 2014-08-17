Ext.define('NextThought.model.courses.CourseInstanceSharingScopes', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'DefaultSharingScopeNTIID', type: 'string'},
		{name: 'Items', type: 'collectionItem'}
	],


	getDefaultSharing: function() {
		return this.get('DefaultSharingScopeNTIID');
	},


	getScope: function(name) {
		//I assume this will always be a singular item, not an array/set of items...
		//as in Public will map to a singular entity (a Community so far in my poking...)
		return this.getFieldItem('Items', name);
	}
});
