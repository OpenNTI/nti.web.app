Ext.define('NextThought.model.courses.CourseInstance', {
	extend: 'NextThought.model.Base',

	isBundle: true,
	isCourse: true,

	requires: [
		'NextThought.model.courses.AssignmentCollection',
		'NextThought.model.courses.CourseInstanceBoard',
		'NextThought.model.assessment.UsersCourseAssignmentSavepoint',
		'NextThought.store.courseware.Navigation',
		'NextThought.store.courseware.ToCBasedOutline',
		'NextThought.store.courseware.Stream',
        'NextThought.model.PlaylistItemProgress'
	],

	mixins: {
		'BundleLike': 'NextThought.mixins.BundleLike',
		'PresentationResources': 'NextThought.mixins.PresentationResources'
	},

	fields: [
		{ name: 'AnnouncementForums', type: 'auto'},
		{ name: 'ParentAnnouncementForums', type: 'auto'},
		{ name: 'Bundle', type: 'singleItem', mapping: 'ContentPackageBundle'},
		{ name: 'Discussions', type: 'singleItem', persist: false },
		{ name: 'ParentDiscussions', type: 'singleItem', persist: false},
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
			bundle = this.get('Bundle').asUIData(),
			data = {
				id: this.getId(),
				isCourse: true,
				author: e && e.getAuthorLine(),
				title: e && e.get('Title'),
				label: e && e.get('ProviderUniqueID')
			};

		ObjectUtils.clean(bundle);

		bundle = Ext.apply(bundle, data);

		return Ext.applyIf(bundle, {
			icon: e && e.get('icon'),
			thumb: e && e.get('thumb')
		});
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


	//get a count of how many things the user has done in the course
	getCompletionStatus: function() {},


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


	getBackgroundImage: function() {
		return this.get('Bundle').getBackgroundImage();
	},


	getPublicScope: function() { return this.getScope('Public'); },
	getRestrictedScope: function() { return this.getScope('Restricted'); },//i don't think this is used


	getScope: function(scope) {
		var s = (this.get('Scopes') || {})[scope.toLowerCase()] || '';//Old...

		/*if (this.raw.SharingScopes) {
			s = this.get('SharingScopes');
			s = s.getScope(scope);
			if (s && typeof s !== 'string') {
				s = s.get('NTIID');
			}
		}*/

		if (typeof s === 'string') {
			s = s.split(' ');
		}
		return s.filter(function(v) {return !Ext.isEmpty(v);});
	},


	getDefaultSharing: function() {
		var defaultSharing = this.getPublicScope();

		if (this.raw.SharingScopes) {
			defaultSharing = this.get('SharingScopes').getDefaultSharing();
			defaultSharing = defaultSharing ? [defaultSharing] : [];
		}

		return defaultSharing;
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


	shouldShowAssignments: function() {
		//we should only show assignments if there is an assignments by outline node link
		return !!this.getLink('AssignmentsByOutlineNode');
	},

	/**
	 * get the link, and cache the results
	 * @param  {String} link rel of the link to get
	 * @return {Promise}      the request for the link
	 */
	__getAssignmentList: function(link) {
		var promiseName = '__get' + link + 'Promise',
			link;

		if (this[promiseName]) {
			return this[promiseName];
		}

		link = this.getLink(link);

		if (!link) { return Promise.reject('No link'); }

		this[promiseName] = Service.request(link)
								.then(function(response) {
									return Ext.decode(response, true);
								});

		return this[promiseName];
	},


	__getAssignmentsByOutline: function() {
		return this.__getAssignmentList('AssignmentsByOutlineNode');
	},


	__getNonAssignmentsByOutline: function() {
		return this.__getAssignmentList('NonAssignmentAssessmentItemsByOutlineNode');
	},


	__getGradeBook: function() {
		if (this.__getGradeBookPromise) { return this.__getGradeBookPromise; }

		var link = this.getLink('GradeBook');

		//don't reject do it doesn't break the Promise.all
		if (!link) { return Promise.resolve(null); }

		this.__getGradeBookPromise = Service.request({
			url: link,
			timeout: 120000 //2 minutes
		})
			.then(function(json) { return ParseUtils.parseItems(json)[0]; });

		return this.__getGradeBookPromise;
	},


	/**
	 * Retuan an assignment collection with out the gradebook
	 * @return {[type]} [description]
	 */
	getAssignments: function() {
		if (this.__getAssignmentsPromise) { return this.__getAssignmentsPromise; }

		var roster = this.getLink('CourseEnrollmentRoster'),
			history = this.getLink('AssignmentHistory');

		if (!this.getLink('AssignmentsByOutlineNode')) {
			return Promise.resolve(NextThought.model.courses.AssignmentCollection.fromJson(
				{},{},null, null, this.getLink('AssignmentHistory')));
		}

		this.__getAssignmentsPromise = Promise.all([
			this.__getAssignmentsByOutline(),
			this.__getNonAssignmentsByOutline()
		])
			.then(function(results) {
				var assignments = results[0],
					nonAssignment = results[1];

				return NextThought.model.courses.AssignmentCollection.fromJson(
							assignments, nonAssignment, roster, null, history);
			});

		return this.__getAssignmentsPromise;
	},

	/**
	 * Return an assignment collection with the grade book
	 * @return {Promise} Fulfills with the assignment collection
	 */
	getAssignmentsAndGradeBook: function() {
		if (this.__getAssignmentsAndGradeBookPromise) { return this.__getAssignmentsAndGradeBookPromise; }

		var roster = this.getLink('CourseEnrollmentRoster'),
			history = this.getLink('AssignmentHistory');

		if (!this.getLink('AssignmentsByOutlineNode')) {
			return Promise.resolve(NextThought.model.courses.AssignmentCollection.fromJson(
				{},{},null, null, this.getLink('AssignmentHistory')));
		}

		this.__getAssignmentsAndGradeBookPromise = Promise.all([
			this.__getAssignmentsByOutline(),
			this.__getNonAssignmentsByOutline(),
			this.__getGradeBook()
		])
			.then(function(results) {
				var assignments = results[0],
					nonAssignments = results[1],
					gradeBook = results[2];

				return NextThought.model.courses.AssignmentCollection.fromJson(
							assignments, nonAssignments, roster, gradeBook, history);
			});

		return this.__getAssignmentsAndGradeBookPromise;
	},


	getAssignmentSavePoints: function() {
		var p = this.getAssignmentSavePointsPromise,
			link;

		if (!p) {

			p = this.getWrapper()
				.then(function(cce) {
					link = cce.getLink('AssignmentSavepoints');

					if (link) {
						return Service.request(link)
							.then(function(response) {
								return ParseUtils.parseItems(response)[0];
							})
							.fail(function() {
								return NextThought.model.assessment.UsersCourseAssignmentSavepoint.create();
							});
					}

					return Promise.resolve(NextThought.model.assessment.UsersCourseAssignmentSavepoint.create());
				});

			this.getAssignmentSavePointsPromise = p;
		}

		return p;
	},



	fireNavigationEvent: function(eventSource) {
		var me = this;

		return new Promise(function(fulfill) {
			eventSource.fireEvent('course-selected', me, function() {
				fulfill();
			});
		});
	},


	/**
	*Takes two arrays of forums and bins then
	*
	*	1.) by for credit or open
	*	2.) by if they are for this section or the parent
	*
	*returns an object that looks like
	*{
	*	ForCredit: {
	*		Section: [],
	*		Parent: []
	*	},
	*	Open: {
	*		Section: [],
	*		Parent: []
	*	},
	*	Other: []
	*}
	*
	* @param  {Array} section Array of forums in this section
	* @param  {Array} parent  Array of forums in the parent if there are any
	* @return {Object}        The binned forums
	*/
	__binDiscussions: function(section, parent) {
		var bin = {
			ForCredit: {
				Section: [],
				Parent: []
			},
			Open: {
				Section: [],
				Parent: []
			},
			Other: {
				Section: [],
				Parent: []
			}
		};

		function isOpen(item) {
			var title = item.get('title');

			return title.indexOf('Open') === 0;
		}

		function isForCredit(item) {
			var title = item.get('title');

			return title.indexOf('In-Class') === 0;
		}

		(section || []).forEach(function(item) {
			if (isOpen(item)) {
				bin.Open.Section.push(item);
			} else if (isForCredit(item)) {
				bin.ForCredit.Section.push(item);
			} else {
				bin.Other.Section.push(item);
			}
		});

		(parent || []).forEach(function(item) {
			if (isOpen(item)) {
				bin.Open.Parent.push(item);
			} else if (isForCredit(item)) {
				bin.ForCredit.Parent.push(item);
			} else {
				bin.Other.Parent.push(item);
			}
		});

		return bin;
	},


	/**
	 * Takes the binned forums and creates a forum list from it
	 *
	 * Forum lists are an object that look like
	 *	{
	 *		title: 'Title',
	 *		store: contents store of the board,
	 *		children: [forum lists nested beneath this one],
	 *		board: the board associated with this list
	 *	}
	 *
	 * @param  {Object} bin binned forums
	 * @return {Object}     a forum list of the above type
	 */
	__binToForumList: function(bin) {
		var section = this.get('Discussions'),
			parent = this.get('ParentDiscussions'),
			sectionId, parentId,
			forumList = [],
			forCredit, open, other;

		sectionId = section && section.getContentsStoreId();
		parentId = parent && parent.getContentsStoreId();

		function isEmpty(b) {
			return Ext.isEmpty(b.Section) && Ext.isEmpty(b.Parent);
		}

		function buildStore(id, data) {
			return NextThought.model.forums.Board.buildContentsStoreFromData(id, data);
		}

		if (!isEmpty(bin.ForCredit)) {
			forCredit = {
				title: 'Enrolled For-Credit',
				children: []
			};

			if (!Ext.isEmpty(bin.ForCredit.Section)) {
				forCredit.children.push({
					title: 'My Section',
					store: buildStore(sectionId + 'ForCredit', bin.ForCredit.Section),
					board: section
				});
			}

			if (!Ext.isEmpty(bin.ForCredit.Parent)) {
				forCredit.children.push({
					title: 'All Sections',
					store: buildStore(parentId + 'ForCredit', bin.ForCredit.Parent),
					board: parent
				});
			}

			forumList.push(forCredit);
		}

		if (!isEmpty(bin.Open)) {
			open = {
				title: 'Open Discussions',
				children: []
			};

			if (!Ext.isEmpty(bin.Open.Section)) {
				open.children.push({
					title: 'My Section',
					store: buildStore(sectionId + 'Open', bin.Open.Section),
					board: section
				});
			}

			if (!Ext.isEmpty(bin.Open.Parent)) {
				open.children.push({
					title: 'All Sections',
					store: buildStore(parentId + 'Open', bin.Open.Parent),
					board: parent
				});
			}

			forumList.push(open);
		}

		if (!isEmpty(bin.Other)) {
			other = {
				title: 'Other Discussions',
				children: []
			};

			if (!Ext.isEmpty(bin.Other.Section)) {
				other.children.push({
					title: 'My Section',
					store: buildStore(sectionId + 'Other', bin.Other.Section),
					board: section
				});
			}

			if (!Ext.isEmpty(bin.Other.Parent)) {
				other.children.push({
					title: 'All Sections',
					store: buildStore(parentId + 'Other', bin.Other.Parent),
					board: parent
				});
			}

			forumList.push(other);
		}


		return forumList;
	},

	/**
	 * Sends requests for the contents link of the discussions and parent discussions if they are there
	 * @return {Promise} Fulfills or rejects with the response of the request
	 */
	getDiscussionContents: function(prop) {
		var board = this.get(prop),
			request;

		if (board) {
			board = board.getLink('contents');

			request = board ? Service.request(board) : Promise.reject('No Contents Link');
		} else {
			request = Promise.reject('No board');
		}

		return request;
	},


	getForumList: function() {
		var me = this,
			sectionContents,
			parentContents;

		//fail if both section and parent fail to load, succeed otherwise
		return me.getDiscussionContents('Discussions')
			.then(function(response) {
				var section;

				if (!response) {
					return Promise.reject('No response');
				}

				try {
					section = JSON.parse(response);

					sectionContents = ParseUtils.parseItems(section.Items);
				} catch (e) {
					console.error('Failed to pares section, ', e);

					sectionContents = null;
				}
			})
			.fail(function(reason) {
				console.error('Section contents fail: ', reason);
			})
			.then(me.getDiscussionContents.bind(me, 'ParentDiscussions'))
			.then(function(response) {
				var parent;

				if (!response) {
					return Proimse.reject('No response');
				}

				try {
					parent = JSON.parse(response);

					parentContents = ParseUtils.parseItems(parent.Items);
				} catch (e) {
					console.error('Failed to parse parent, ', e);

					parentContents = null;
				}
			})
			.fail(function(reason) {
				console.error('Parent contents fail: ', reason);
			})
			.then(function() {//bin the forums

				if (!sectionContents && !parentContents) {
					return Promise.reject('Failed to load any board contents');
				}
				return me.__binDiscussions(sectionContents, parentContents);
			})
			.then(me.__binToForumList.bind(me));//create a forum list for the ui to build from
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
	},


	/**
	 * A helper to parse the object in AnnouncementForums or ParentAnnouncementForums
	 * @param  {Object} items []
	 * @return {[type]}       [description]
	 */
	__getAnnouncementsForums: function(items) {
		var keys = Object.keys(items) || [],
			forums = [];

		keys.forEach(function(key) {
			var forum = ParseUtils.parseItems(items[key] || {})[0];

			if (!Ext.isEmpty(forum)) {
				forums.sharingScope = key;
				forums.push(forum);
			}
		});

		return forums;
	},


	/**
	 * AnnouncementForums contain the forums for all the scopes the user is in their section
	 *{
	 *	Items: {
	 *		Public: Forum,
	 *		ForCredit: Forum
	 *	}
	 *}
	 * @return {Array} a flattened list of the forums
	 */
	getMySectionAnnouncements: function() {
		var announcements = this.get('AnnouncementForums');

		announcements = announcements && announcements.Items;

		this.__sectionAnnouncements = this.__sectionAnnouncements || this.__getAnnouncementsForums(announcements || {});

		return this.__sectionAnnouncements;
	},


	/**
	 * Same as getMySectionAnnouncements just for my parent section
	 * @return {Array} a flattened list of the forums
	 */
	getParentAnnouncements: function() {
		var announcements = this.get('ParentAnnouncementForums');

		announcements = announcements && announcements.Items;

		this.__parentAnnouncements = this.__parentAnnouncements || this.__getAnnouncementsForums(announcements || {});

		return this.__parentAnnouncements;
	},


	getStream: function() {
		var catalog = this.getCourseCatalogEntry(),
			link = this.getLink('CourseRecursiveStreamByBucket');

		this.__streamStore = this.__streamStore || NextThought.store.courseware.Stream.create({
			url: link,
			startDate: catalog.get('StartDate')
		});

		return this.__streamStore;
	},


	getCurrentGrade: function() {
		var link = this.getLink('CurrentGrade');

		if (!link) { return Promise.reject(); }

		return Service.request(link)
					.then(function(response) {
						return ParseUtils.parseItems(response)[0];
					});
	},


    getVideoProgress: function(){
        var link = this.getLink('VideoProgress');

        if (!link) { return Promise.reject(); }

        return Service.request(link)
                    .then(function(response) {
                        return ParseUtils.parseItems(response)[0];
                    });
    }
});
