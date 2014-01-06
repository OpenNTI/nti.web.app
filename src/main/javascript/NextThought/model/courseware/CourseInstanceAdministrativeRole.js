Ext.define('NextThought.model.courseware.CourseInstanceAdministrativeRole', {
	extend: 'NextThought.model.Base',

	isAdministrative: true,
	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'RoleName', type: 'string' },
		{ name: 'Status', type: 'string', persist: false, defaultValue: 'ForCredit' }
	],


	__precacheEntry: function() {
		return this.get('CourseInstance').__precacheEntry();
	},


	getCourseCatalogEntry: function() {
		return this.get('CourseInstance').getCourseCatalogEntry();
	}
});
