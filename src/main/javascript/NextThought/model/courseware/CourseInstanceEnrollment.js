Ext.define('NextThought.model.courseware.CourseInstanceEnrollment', {
	extend: 'NextThought.model.Base',

	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false },
		{ name: 'Username', type: 'string' },
		{ name: 'Status', type: 'string', mapping: 'LegacyEnrollmentStatus'}
	],


	__precacheEntry: function() {
		return this.get('CourseInstance').__precacheEntry();
	},


	getCourseCatalogEntry: function() {
		return this.get('CourseInstance').getCourseCatalogEntry();
	}
});
