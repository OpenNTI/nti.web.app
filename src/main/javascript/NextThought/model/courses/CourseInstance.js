Ext.define('NextThought.model.courses.CourseInstance', {
	extend: 'NextThought.model.Base',

	isBundle: true,
	isCourse: true,

	requires: [
		'NextThought.model.courses.AssignmentCollection',
		'NextThought.model.courses.CourseInstanceBoard',
		'NextThought.store.courseware.Navigation',
		'NextThought.store.courseware.ToCBasedOutline'
	],

	mixins: {
		'BundleLike': 'NextThought.mixins.BundleLike',
		'PresentationResources': 'NextThought.mixins.PresentationResources'
	},

	fields: [
		{ name: 'Bundle', type: 'singleItem', mapping: 'ContentPackageBundle'},
		{ name: 'Discussions', type: 'singleItem', persist: false },
		{ name: 'Outline', type: 'singleItem', persist: false },

		{ name: 'Scopes', type: 'auto', mapping: 'LegacyScopes' },
		{ name: 'SharingScopes', type: 'singleItem'},

		{ name: 'TotalEnrolledCount', type: 'int'},
		{ name: 'TotalEnrolledCountOpen', type: 'int', mapping: 'TotalLegacyOpenEnrolledCount'},
		{ name: 'TotalEnrolledCountForCredit', type: 'int', mapping: 'TotalLegacyForCreditEnrolledCount'},

		//UI propertied
		{ name: 'Preview', type: 'bool', persist: false},
		{ name: 'isCourse', type: 'bool', defaultValue: true, persist: false },
		{ name: 'cover', type: 'string', persist: false, defaultValue: 'missing-notset.png'},
		{ name: 'thumb', type: 'string', persist: false, defaultValue: 'missing.png'}
	],


	asUIData: function() {
		var e = this.getCourseCatalogEntry(),
			author = ((e && e.get('Instructors')) || [])[0],
			bundle = this.get('Bundle').asUIData(),
			data = {
				id: this.getId(),
				isCourse: true,
				author: author && author.get('Name'),
				title: e && e.get('Title'),
				label: e && e.get('ProviderUniqueID'),
				icon: e && e.get('icon'),
				thumb: e && e.get('thumb')
			};

		ObjectUtils.clean(bundle);//make sure falsy values are "undefined" before the applyIf()
		return Ext.applyIf(bundle, data);
	},


	getDefaultAssetRoot: function() {
		var location = this.getLocationInfo(),
			root = location && location.root;

		if (!root) {
			console.error('No location root for course');
			return '';
		}

		return getURL(root).concatPath('/presentation-assets/webapp/v1/');
	},


	__precacheEntry: function() {
		var p = this.precachePromise,
			me = this,
			Cls = NextThought.model.courses.CourseCatalogEntry;

		if (!p) {
			this.precachePromise = new Promise(function(fulfill, reject) {
				var url = me.getLink('CourseCatalogEntry');

				if (!url) {
					return reject('Course Instance (' + me.getId() + ') has a null link for "CourseCatalogEntry".');
				}

				Cls.load(null, {
					url: url,
					callback: function(rec) {
						me.__courseCatalogEntry = rec;
						if (rec) {
							rec.get('Links').getRelLink('CourseInstance').href = me.get('href');
							me.set('Preview', rec.get('Preview'));
							rec.set('enrolled', true);//if we come from here, we are enrolled.
							me.afterEdit(['NTIID']);//let views know the record "changed".
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
			temp = this.getLocationInfo();
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


	isExpired: function() {
		var c = this.getCourseCatalogEntry();
		return c && c.isExpired();
	},


	getLocationInfo: function() {
		var locationInfo = this.get('Bundle').getLocationInfo();

		if (locationInfo) {
			locationInfo.isCourse = true;
			//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
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
		return s.filter(function(v) {return !Ext.isEmpty(v);});
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
			var o = this.get('Outline'),
				me = this;

			this._outlinePromise = o.getContents()
					.done(function() {
						o.navStore = me.getNavigationStore();
						return o;
					});

		}

		return this._outlinePromise;
	},


	getAssignmentHistory: function() {
		var me = this;

		function getLink(rel, e) { return e.getLink(rel) || me.getLink(rel); }

		return this.getWrapper()
			.then(function(e) {
				return Service.request(getLink('AssignmentHistory', e))
					.then(function(txt) {
						return ParseUtils.parseItems(txt)[0];
					})
					.fail(function(reason) {
						if (reason && reason.status === 404) {
							return NextThought.model.courseware.UsersCourseAssignmentHistory.getEmpty();
						}

						return Promise.reject(reason);
					});
			});
	},


	getAssignments: function() {
		if (this.getAssignmentsPromise) { return this.getAssignmentsPromise; }

		var me = this,
			roster = me.getLink('CourseEnrollmentRoster');

		me.getAssignmentsPromise = Promise.all([
			Service.request(me.getLink('AssignmentsByOutlineNode')),
			Service.request(me.getLink('NonAssignmentAssessmentItemsByOutlineNode')),
			me.getLink('GradeBook') ? me._getGradeBook() : Promise.resolve()
		])
			.done(function(json) {
				var assignments = Ext.decode(json[0], true),
					nonAssignments = Ext.decode(json[1], true),
					gradeBook = json[2];

				return NextThought.model.courses.AssignmentCollection.fromJson(
						assignments, nonAssignments, roster, gradeBook, me.getLink('AssignmentHistory'));
			});

		return me.getAssignmentsPromise;
	},


	_getGradeBook: function() {
		if (!this._gradebookPromise) {
			var p, link = this.getLink('GradeBook');

			if (link) {
				p = Service.request(link)
						.done(function(json) { return ParseUtils.parseItems(json)[0]; });
			} else {
				p = Promise.reject('Not present');
			}

			this._gradebookPromise = p;
		}
		return this._gradebookPromise;
	},


	fireNavigationEvent: function(eventSource) {
		var me = this;

		return new Promise(function(fulfill) {
			eventSource.fireEvent('course-selected', me, function() {
				fulfill();
			});
		});
	},


	getDiscussionBoard: function() {
		var b = this.get('Discussions');
		return b ? Promise.resolve(b) : Promise.reject('No board');
	},


	represents: function(catalogEntry) {
		var cceId = catalogEntry.getId(),
			cceHref = catalogEntry.get('href'),
			cce = this.getCourseCatalogEntry();

		return cce ?
			   cce.getId() === cceId :
			   this.getLink('CourseCatalogEntry') === cceHref;
	},


	containsNTIID: function(id) {
		return this.get('Bundle').containsNTIID(id);
	}
});
