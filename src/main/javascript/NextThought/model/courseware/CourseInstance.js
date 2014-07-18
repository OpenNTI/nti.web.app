Ext.define('NextThought.model.courseware.CourseInstance', {
	extend: 'NextThought.model.Base',

	isBundle: true,
	isCourse: true,

	requires: [
		'NextThought.store.courseware.Navigation',
		'NextThought.store.courseware.ToCBasedOutline'
	],

	mixins: {
		'PresentationResources': 'NextThought.mixins.PresentationResources'
	},

	fields: [
		{ name: 'isCourse', type: 'bool', defaultValue: true, persist: false },
		{ name: 'Discussions', type: 'singleItem', persist: false },
		{ name: 'Outline', type: 'singleItem', persist: false },
		{ name: 'TotalEnrolledCount', type: 'int'},
		{ name: 'Scopes', type: 'auto' },

		{ name: 'Preview', type: 'bool', persist: false},
		//UI propertied
		{ name: 'cover', type: 'string', persist: false, defaultValue: 'missing-notset.png'},
		{ name: 'thumb', type: 'string', persist: false, defaultValue: 'missing.png'}
	],


	asUIData: function() {
		var e = this.getCourseCatalogEntry(),
			instructors = e && e.get('Instructors'),
			author = instructors && instructors[0];

		//if (!e) {
			//console.warn('CourseCatalogEntry for', this, 'has not been preloaded yet.');
		//}

		return {
			id: this.getId(),
			isCourse: true,
			title: (e && e.get('Title')) || 'Missing Catalog Entry',
			label: (e && e.get('ProviderUniqueID')) || '---',
			icon: this.get('cover'),
			thumb: this.get('cover'),
			author: author && author.get('Name')
		};
	},


	getDefaultAssetRoot: function() {
		var location = this.__getLocationInfo(),
			root = location && location.root;

		if (!root) {
			console.error('No location root for course');
			return '';
		}

		return getURL(root).concatPath('/presentation-assets/webapp/v1/');
	},


	setLibraryImage: function() {
		var me = this;

		me.getImgAsset('thumb').then(function(url) { me.set('thumb', url); });

		me.getImgAsset('landing')
			.then(function(url) {
				me.set('cover', url);
			})
			.fail(function() {
				var e = me.getCourseCatalogEntry();

				console.error('No well known path for this course: ', e);

				me.set('cover', e ? e.get('thumbnail') : 'missing-entry.png');
			});
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

						Library.onceLoaded()
							.then(me.setLibraryImage.bind(me));


						me.afterEdit(['NTIID']);//let views know the record "changed".

						if (rec) {
							me.set('Preview', rec.get('Preview'));
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
						if ((reason || '').substr(0, 3) === '404') {
							return NextThought.model.courseware.UsersCourseAssignmentHistory.getEmpty();
						}
						throw reason;
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

				return NextThought.model.courseware.AssignmentCollection.fromJson(
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

		return this.__precacheEntry()
				.done(function() {
					return new Promise(function(fulfill) {
						eventSource.fireEvent('course-selected', me, function() {
							fulfill();
						});
					});
				})
				.fail(function(reason) {
					console.error(reason);
					throw reason;//don't let the fact that we log the error "unfail" the chain.
				});
	},


	getDiscussionBoard: function() {
		var b = this.get('Discussions');
		return b ? Promise.resolve(b) : Promise.reject('No board');
	}
});
