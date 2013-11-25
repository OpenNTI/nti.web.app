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
	},


	getNavigationStore: function() {
		var temp;
		if (!this.store) {
			//This function is wrapping the temporary stop-gap...
			temp = this.__getLocationInfo();
			this.store = new NextThought.store.courseware.Navigation({data: temp.toc});
		}

		return this.store;
	},


	__getLocationInfo: function() {
		return ContentUtils.getLocation(this.getCourseCatalogEntry().get('ContentPackageNTIID'));
	}
});
