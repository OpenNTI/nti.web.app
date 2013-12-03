Ext.define('NextThought.model.courseware.CourseInstance', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'isCourse', type: 'bool', defaultValue: true, persist: false },
		{ name: 'Discussions', type: 'singleItem', persist: false }
	],


	asUIData: function() {
		var me = this;
		me._uiData = me._uiData || (function() {
			var e = me.getCourseCatalogEntry();
			return {
				id: me.getId(),
				isCourse: true,
				title: (e && e.get('Title')) || 'Missing Catalog Entry',
				label: (e && e.get('ProviderUniqueID')) || '---',
				icon: (e && e.get('icon')) || 'no-entry.png'
			};
		}());
		return me._uiData;
	},


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
		if (!this.navStore) {
			//This function is wrapping the temporary stop-gap...
			temp = this.__getLocationInfo();
			this.navStore = new NextThought.store.courseware.Navigation({data: temp.toc});
		}

		return this.navStore;
	},


	__getLocationInfo: function() {
		var c = this.getCourseCatalogEntry();
		return ContentUtils.getLocation(c && c.get('ContentPackageNTIID'));
	},


	getScope: function() {
		return [];
	},


	fireNavigationEvent: function(eventSource) {
		eventSource.fireEvent('course-selected', this);
	}
});
