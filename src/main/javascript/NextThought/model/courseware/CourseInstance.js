Ext.define('NextThought.model.courseware.CourseInstance', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Discussions', type: 'singleItem', persist: false }
	],


	getAvailableCourses: function() {
		if (!this.availableStore) {
			this.availableStore = Ext.getStore('courseware.AvailableCourses');
		}
		return this.availableStore;
	},


	getCourseCatalogEntry: function() {
		var links = this.get('Links'),
			href = links && links.getRelHref('CourseCatalogEntry'),
			all = href && this.getAvailableCourses(),
			course;

		if (href && all) {
			course = all.findRecord('href', href, 0, false, true, true);
		}

		return course;
	}
});
