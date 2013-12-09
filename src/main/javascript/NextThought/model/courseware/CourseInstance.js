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
				icon: (e && e.get('icon')) || 'missing-icon.png'
			};
		}());
		return me._uiData;
	},


	__precacheEntry: function() {
		var p = new Promise(),
			me = this,
			Cls = NextThought.model.courseware.CourseInstance;

		Cls.load(null, {
			url: me.getLink('CourseCatalogEntry'),
			callback: function(rec) {
				me.__courseCatalogEntry = rec;
				me.afterEdit(['NTIID']);//let views know the record "changed".
				if (rec) {
					p.fulfill(rec);
				} else {
					p.reject('No Record, See logs');
				}
			}
		});

		return p;
	},


	getCourseCatalogEntry: function() {
		return this.__courseCatalogEntry;
	},


	getNavigationStore: function() {
		var temp;
		if (!this.navStore) {
			//This function is wrapping the temporary stop-gap...
			temp = this.__getLocationInfo();
			if (temp && temp.toc) {
				this.navStore = new NextThought.store.courseware.Navigation({data: temp.toc});
			}
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


	getEnrollment: function() {
		var p = new Promise(),
			id = this.getId();

		this.stores.forEach(function(o) {
			if (o.isModel) {
				p.fulfill(o);
				return false;
			}
		});

		if (!p.isResolved()) {
			return Ext.getStore('courseware.EnrolledCourses').findCourseBy(function(r) {
				var i = r && r.get('CourseInstance');
				return i && i.getId() === id;
			});
		}

		return p;
	},


	fireNavigationEvent: function(eventSource) {
		eventSource.fireEvent('course-selected', this);
	}
});
