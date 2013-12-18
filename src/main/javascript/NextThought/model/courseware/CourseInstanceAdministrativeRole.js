Ext.define('NextThought.model.courseware.CourseInstanceAdministrativeRole', {
	extend: 'NextThought.model.Base',

	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'RoleName', type: 'string' }
	],


	__precacheEntry: function() {
		return this.get('CourseInstance').__precacheEntry();
	},


	getCourseCatalogEntry: function() {
		return this.get('CourseInstance').getCourseCatalogEntry();
	}
});
