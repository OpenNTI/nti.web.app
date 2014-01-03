Ext.define('NextThought.model.courseware.CourseInstance', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.store.courseware.Navigation',
		'NextThought.store.courseware.ToCBasedOutline'
	],

	fields: [
		{ name: 'isCourse', type: 'bool', defaultValue: true, persist: false },
		{ name: 'Discussions', type: 'singleItem', persist: false },
		{ name: 'Outline', type: 'singleItem', persist: false },
		{ name: 'TotalEnrolledCount', type: 'int'}
	],


	asUIData: function() {
		var e = this.getCourseCatalogEntry();

		if (!e) {
			console.warn('CourseCatalogEntry for', this, 'has not been preloaded yet.');
		}

		return {
			id: this.getId(),
			isCourse: true,
			title: (e && e.get('Title')) || 'Missing Catalog Entry',
			label: (e && e.get('ProviderUniqueID')) || '---',
			icon: (e && e.get('icon')) || 'missing-icon.png'
		};
	},


	__precacheEntry: function() {
		var p = this.precachePromise,
			me = this,
			Cls = NextThought.model.courseware.CourseInstance;

		if (!p) {
			p = this.precachePromise = new Promise();

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
		}

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
				this.navStore = new NextThought.store.courseware.Navigation({
					tocNodes: new NextThought.store.courseware.ToCBasedOutline({data: temp.toc}),
					outlinePromise: this.getOutline()
				});
			}
		}

		return this.navStore;
	},


	__getLocationInfo: function() {
		var c = this.getCourseCatalogEntry(),
			locationInfo = ContentUtils.getLocation(c && c.get('ContentPackageNTIID'));
		//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
		if (locationInfo) {
			locationInfo.courseInstance = this;
		}

		return locationInfo;
	},


	getScope: function() {
		return [];
	},


	getRoster: function() {
		var p = new Promise(),
			r = this.getLink('CourseEnrollmentRoster');

		if (!r) {
			p.fulfill(null);
		} else {
			Service.request(r)
					.done(function(txt) {
						var j = Ext.decode(txt, true);
						p.fulfill(j && j.Items);
					})
					.fail(function(reason) {
						p.reject(reason);
					});
		}

		return p;
	},


	getWrapper: function() {
		var p = new Promise(),
			id = this.getId();

		this.stores.forEach(function(o) {
			if (o.isModel) {
				p.fulfill(o);
				return false;
			}
		});

		if (!p.isResolved()) {
			return CourseWareUtils.resolveCourseInstanceContainer(id);
		}

		return p;
	},


	getOutline: function() {
		//cache outline
		var p = new Promise(),
			o = this.get('Outline'),
			me = this;

		o.getContents()
				.fail(function(reason) { p.reject(reason); })
				.done(function() {
					o.navStore = me.getNavigationStore();
					p.fulfill(o);
				});

		return p;
	},


	fireNavigationEvent: function(eventSource, callback) {
		var me = this;

		return this.__precacheEntry()
				.done(function() {
					eventSource.fireEvent('course-selected', me, callback);
				})
				.fail(function(reason) {
					console.error(reason);
				});
	}
});
