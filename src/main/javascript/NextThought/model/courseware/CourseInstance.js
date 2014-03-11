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
		{ name: 'TotalEnrolledCount', type: 'int'},
		{ name: 'Scopes', type: 'auto' }
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
			icon: (e && e.get('thumbnail')) || 'missing-icon.png'
		};
	},


	__precacheEntry: function() {
		var p = this.precachePromise,
			me = this,
			Cls = NextThought.model.courseware.CourseCatalogEntry;

		if (!p) {
			this.precachePromise = new Promise(function(fulfill, reject) {

				Cls.load(null, {
					url: me.getLink('CourseCatalogEntry'),
					callback: function(rec) {
						me.__courseCatalogEntry = rec;
						me.afterEdit(['NTIID']);//let views know the record "changed".

						if (rec) {
							rec.set('enrolled', true);//if we come from here, we are enrolled.
							fulfill(rec);
						} else {
							reject('No Record, See logs');
						}
					}
				});
			});

			p = this.precachePromise;
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
				this.navStore.courseInstance = this;
			}
		}

		return this.navStore;
	},


	getContentPackageNTIID: function() {
		var c = this.getCourseCatalogEntry();
		return c && c.get('ContentPackageNTIID');
	},


	isExpired: function() {
		var c = this.getCourseCatalogEntry();
		return c && c.isExpired();
	},


	__getLocationInfo: function() {
		var locationInfo = ContentUtils.getLocation(this.getContentPackageNTIID());
		//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
		if (locationInfo) {
			locationInfo.courseInstance = this;
		}

		return locationInfo;
	},


	getPublicScope: function() { return this.getScope('public'); },
	getRestrictedScope: function() { return this.getScope('restricted'); },//i don't think this is used


	getScope: function(scope) {
		var s = (this.get('Scopes') || {})[scope] || '';
		if (typeof s === 'string') {
			s = s.split(' ');
		}
		return s;
	},


	getWrapper: function() {
		var p, s = this.stores,
			id = this.getId(), found = false;

		p = new Promise(function(fulfill, reject) {
			s.forEach(function(o) {
				if (o.isModel) {
					fulfill(o);
					found = true;
					return false;
				}
			});
			if (!found) {
				reject('not found');
			}
		});

		if (!found) {
			return CourseWareUtils.resolveCourseInstanceContainer(id);
		}

		return p;
	},


	getOutline: function() {
		//cache outline
		if (!this._outlinePromise) {
			var p = this._outlinePromise = PromiseFactory.make(),
				o = this.get('Outline'),
				me = this;

			o.getContents()
					.fail(function(reason) { p.reject(reason); })
					.done(function() {
						o.navStore = me.getNavigationStore();
						p.fulfill(o);
					});
		}

		return this._outlinePromise;
	},


	getAssignmentHistory: function() {
		var p = PromiseFactory.make(),
			me = this;

		function getLink(rel, e) { return e.getLink(rel) || me.getLink(rel); }

		this.getWrapper()
			.done(function(e) {
				Service.request(getLink('AssignmentHistory', e))
					.done(function(txt) {
						var history = ParseUtils.parseItems(txt)[0];

						p.fulfill(history);
					})
					.fail(function(reason) {
						if ((reason || '').substr(0, 3) === '404') {
							p.fulfill(NextThought.model.courseware.UsersCourseAssignmentHistory.getEmpty());
							return;
						}
						p.reject(reason);
					});
			})
			.fail(function(reason) {
				p.reject(reason);
			});

		return p;
	},


	getAssignments: function() {
		if (this.getAssignmentsPromise) { return this.getAssignmentsPromise; }

		var p = PromiseFactory.make(), me = this,
			roster = me.getLink('CourseEnrollmentRoster');
		Promise.pool(
			Service.request(me.getLink('AssignmentsByOutlineNode')),
			Service.request(me.getLink('NonAssignmentAssessmentItemsByOutlineNode')),
			me.getLink('GradeBook') ? me._getGradeBook() : Promise.resolve()
		)
			.done(function(json) {
				var assignments = Ext.decode(json[0], true),
					nonAssignments = Ext.decode(json[1], true),
					gradeBook = json[2];
				p.fulfill(NextThought.model.courseware.AssignmentCollection.fromJson(
						assignments, nonAssignments, roster, gradeBook, me.getLink('AssignmentHistory')));
			})
			.fail(function(reason) {
				p.reject(reason);
			});

		me.getAssignmentsPromise = p;

		return me.getAssignmentsPromise;
	},


	_getGradeBook: function() {
		if (!this._gradebookPromise) {
			var p = this._gradebookPromise = PromiseFactory.make(),
				link = this.getLink('GradeBook');

			if (link) {
				Service.request(link)
						.done(function(json) { p.fulfill(ParseUtils.parseItems(json)[0]); })
						.fail(function(r) { p.reject(r); });
			} else {
				p.reject('Not present');
			}
		}
		return this._gradebookPromise;
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
