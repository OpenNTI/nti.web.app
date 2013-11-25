Ext.define('NextThought.model.courseware.CourseInstanceEnrollment', {
	extend: 'NextThought.model.Base',

	idProperty: 'href',
	fields: [
		{ name: 'CourseInstance', type: 'singleItem', persist: false }
	],


	getCourseCatalogEntry: function() {
		return this.get('CourseInstance').getCourseCatalogEntry();
	}
});
