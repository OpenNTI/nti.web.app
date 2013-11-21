Ext.define('NextThought.view.courseware.Collection', {
	extend: 'NextThought.view.library.Collection',
	alias: 'widget.course-collection',

	hidden: true, //don't show this component unless the courseware controller says it can show.
	courseList: true,
	store: 'courseware.EnrolledCourses',
	cls: 'courses',


	getAvailableCourses: function() {
		if (!this.availableStore) {
			this.availableStore = Ext.getStore('courseware.AvailableCourses');
		}
		return this.availableStore;
	},


	getCourseCatalogEntry: function(record) {
		var instance = record && record.get('CourseInstance'),
			links = instance && instance.get('Links'),
			href = links && links.getRelHref('CourseCatalogEntry'),
			all = href && this.getAvailableCourses(),
			course;

		if (href && all) {
			course = all.findRecord('href', href, 0, false, true, true);
		}

		return course;
	},


	prepareData: function(data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments)),
			course = this.getCourseCatalogEntry(record),
			libraryEntry;

		if (course) {
			libraryEntry = Library.getTitle(course.get('ContentPackageNTIID'));
			Ext.apply(i, {
				icon: libraryEntry && libraryEntry.get('icon'),
				title: course.get('Title'),
				courseName: course.get('ProviderUniqueID')
			});
		}

		return i;
	},


	getContentNTIID: function(record) {
		var course = this.getCourseCatalogEntry(record);
		if (!course) {
			alert('An error occured.');
			Ext.Error.raise('No Course related!?!');
		}

		return course.get('ContentPackageNTIID');
	}
});
