Ext.define('NextThought.model.courses.CourseInstance', {
	extend: 'NextThought.model.Base',

	isBundle: true,
	isCourse: true,

	requires: [
		'NextThought.model.courses.AssignmentCollection',
		'NextThought.model.courses.CourseInstanceBoard',
		'NextThought.model.assessment.UsersCourseAssignmentSavepoint',
		'NextThought.store.courseware.OutlineInterface',
		'NextThought.store.courseware.Navigation',
		'NextThought.store.courseware.ToCBasedOutline',
		'NextThought.store.courseware.Stream',
		'NextThought.model.courses.CourseVideoProgress',
		'NextThought.model.courses.CourseOutline',
		'NextThought.model.courses.CourseInstanceSharingScopes',
		'NextThought.model.courses.CourseCatalogEntry',
		'NextThought.model.courseware.GradeBook',
		'NextThought.model.ContentBundle',
		'NextThought.model.forums.CommunityBoard',
		'NextThought.model.forums.CommunityForum',
		'NextThought.model.UserSearch',
		'NextThought.model.Video',
		'NextThought.model.assessment.Assignment',
		'NextThought.model.assessment.QuestionSet'
	],

	mixins: {
		'BundleLike': 'NextThought.mixins.BundleLike',
		'PresentationResources': 'NextThought.mixins.PresentationResources',
		'DurationCache': 'NextThought.mixins.DurationCache'
	},

	fields: [
		{ name: 'AnnouncementForums', type: 'auto'},
		{ name: 'ParentAnnouncementForums', type: 'auto'},
		{ name: 'Bundle', type: 'singleItem', mapping: 'ContentPackageBundle'},
		{ name: 'Discussions', type: 'singleItem', persist: false },
		{ name: 'ParentDiscussions', type: 'singleItem', persist: false},
		{ name: 'Outline', type: 'singleItem', persist: false },
		{ name: 'GradeBook', type: 'singleItem', persist: false},

		{ name: 'Scopes', type: 'auto', mapping: 'LegacyScopes' },
		{ name: 'ParentSharingScopes', type: 'singleItem'},
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
				label: e && e.get('ProviderUniqueID'),
				semester: e && e.getSemesterBadge(),
				archived: e && e.isArchived(),
				upcoming: e && e.isUpcoming(),
				startDate: e && e.get('StartDate')
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


	setEnrollment: function(enrollment) {
		this.__instanceEnrollment = enrollment;
	},


	getEnrollment: function(enrollment) {
		return this.__instanceEnrollment;
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
						var outline = me.get('Outline');

						outline.setBundle(me);

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

	/**
	 * Get the catalog family for this course
	 * @return {CatalogFamily}
	 */
	getCatalogFamily: function() {
		return this.__courseCatalogEntry.getCatalogFamily();
	},


	/**
	 * Whether or not this instance is in a given family id
	 * @param  {String}  id FamilyId
	 * @return {Boolean}    if it is in the family
	 */
	isInFamily: function(id) {
		return this.__courseCatalogEntry.isInFamily(id);
	},


	getFirstPage: function() {
		var bundle = this.get('Bundle');

		return bundle.getFirstPage();
	},


	SCOPE_SUGGESTIONS: {
		ADMIN: {
			order: ['Default', 'Public', 'Purchased', 'ForCredit', 'ForCreditNonDegree'],
			keys: {
				Public: ['Public'],
				Purchased: ['Purchased'],
				ForCredit: ['ForCredit'],
				ForCreditNonDegree: ['ForCreditNonDegree']
			},
			friendlyNames: {
				Default: 'Default Scope',
				Public: 'All Students in {sectionName}',
				Purchased: 'Life Long Learn Students in {sectionName}',
				ForCredit: 'For Credit Students in {sectionName}',
				ForCreditNonDegree: 'Five Minute Enrollment Students in {sectionName}'
			}
		},
		STUDENT: {
			order: ['Default'],
			keys: {
				Public: ['Public', 'Purchased'],
				ForCredit: ['ForCredit', 'ForCreditNonDegree']
			},
			friendlyNames: {
				Default: 'Default Scope',
				Public: 'All Students in {sectionName}',
				Purchased: 'All Students in {sectionName}',
				ForCredit: 'For Credit Students in {sectionName}',
				ForCreditNonDegree: 'For Credit Students in {sectionName}'
			}
		}
	},


	getSuggestedSharing: function() {
		var me = this;

		return me.getWrapper()
			.then(function(enrollment) {
				return enrollment.isAdministrative ? me.getParentSuggestedSharing() : me.getStudentSuggestedSharing();
			});
	},


	__scopeToUserSearch: function(scope, friendlyName) {
		var json = scope.asJSON();

		json.friendlyName = friendlyName || '';

		return NextThought.model.UserSearch.create(json);
	},


	getStudentSuggestedSharing: function() {
		var sectionScopes = this.get('SharingScopes'),
			parentScopes = this.get('ParentSharingScopes') || sectionScopes,
			defaultId = sectionScopes && sectionScopes.getDefaultSharing(),
			defaultScope = sectionScopes && sectionScopes.getDefaultScope(),
			parentPublic = parentScopes && parentScopes.getScope('Public'),
			suggestions = [];

		if (!defaultScope && parentScopes !== sectionScopes) {
			defaultScope = parentScopes.getScopeForId(defaultId);
		}

		if (parentPublic) {
			suggestions.push(this.__scopeToUserSearch(parentPublic, 'All Students'));
		}

		if (defaultScope && defaultScope !== parentPublic) {
			suggestions.push(this.__scopeToUserSearch(defaultScope, 'My Classmates'));
		}

		return suggestions;
	},


	getParentSuggestedSharing: function() {
		var sectionScopes = this.get('SharingScopes'),
			parentScopes = this.get('ParentSharingScopes'),
			containsDefault = this.sectionScopes && this.sectionScopes.containsDefault(),
			sectionSuggestions, parentSuggestions;

		if (containsDefault) {
			sectionSuggestions = this.__buildSuggestedSharing(this.SCOPE_SUGGESTIONS.ADMIN, sectionScopes, parentScopes ? 'My Section' : 'My Course');
		} else {
			sectionSuggestions = [];
		}

		if (parentScopes) {
			parentSuggestions = this.__buildSuggestedSharing(this.SCOPE_SUGGESTIONS.ADMIN, parentScopes, containsDefault ? 'All Sections' : 'My Course');
		} else {
			parentSuggestions = [];
		}

		return parentSuggestions.concat(sectionSuggestions);
	},



	__buildSuggestedSharing: function(config, sharingScopes, sectionName) {
		var me = this,
			scopes = {}, defaultKey,
			items = [],
			defaultSharing = sharingScopes.getDefaultSharing(),
			keys = Object.keys(config.keys);

		keys.forEach(function(key) {
			var names = config.keys[key],
				scope, i;

			for (i = 0; i < names.length; i++) {
				scope = sharingScopes.getScope(names[i]);

				if (!scope) { continue; }

				if (scope.getId() === defaultSharing) {
					scopes[names[i]] = scope;
					defaultKey = names[i];
				}

				if (!scopes[key]) {
					scopes[key] = scope;
				}
			}
		});

		if (defaultKey) {
			scopes['Default'] = scopes[defaultKey];

			delete scopes[defaultKey];

			config.order.forEach(function(name) {
				if (!scopes[name]) { return; }

				var scopeName = name === 'Default' ? defaultKey : name,
					friendlyName = config.friendlyNames && config.friendlyNames[scopeName];

				if (Ext.isString(friendlyName)) {
					friendlyName = friendlyName.replace('{sectionName}', sectionName);
				}

				items.push(me.__scopeToUserSearch(scopes[name], friendlyName));
			});
		}


		return items;
	},


	getContentBreadCrumb: function(path, pageId, rootId, parent) {
		var root = path[0];

		if (parent) {
			if (root.ntiid === rootId) {
				path.unshift(parent);
			} else {
				path[0] = parent;
			}
		}

		path.forEach(function(part) {
			if (part.ntiid === rootId) {
				part.siblings = [];
			}
		});

		return path;
	},


	//get a count of how many things the user has done in the course
	getCompletionStatus: function() {},


	getTocs: function() {
		var bundle = this.get('Bundle');

		return this.getWrapper()
			.then(function(enrollment) {
				return bundle.getTocs(enrollment.get('Status'));
			});
	},


	getContentPackages: function() {
		var bundle = this.get('Bundle');

		return bundle.getContentPackages();
	},


	getContentRoots: function() {
		var bundle = this.get('Bundle');

		return bundle.getContentRoots();
	},


	getContentIds: function() {
		var bundle = this.get('Bundle');

		return bundle.getContentIds();
	},


	getTitle: function() {
		var bundle = this.get('Bundle');

		return bundle.getTitle();
	},


	getIcon: function() {
		var bundle = this.get('Bundle');

		return bundle.getIcon();
	},


	canGetToContent: function(ntiid, rootId) {
		var me = this;

		return Promise.all([
			ContentUtils.getLineage(ntiid, me),
			me.getLocationInfo()
		]).then(function(results) {
			var lineages = results[0],
				locationInfo = results[1],
				store = me.getNavigationStore(),
				canGetTo = false;

			if (locationInfo) {
				(lineages || []).forEach(function(lineage) {
					//not in the same content
					if (locationInfo.NTIID !== lineage.last()) {
						canGetTo = true;
					}
				});
			}

			if (me.isExpired()) {
				canGetTo = true;
			}

			// the last item in the lineage is the root of the content.
			// the next to last entry is the first branch from the root
			// of the content (so its a unit or a lesson... if we can
			// find it in the nav store, its available.)
			//TODO: This needs to go away. Favor scoped reader navigation.
			if (!store.getCount()) {
				canGetTo = true;
			}

			if (canGetTo) {
				return true;
			}
			//TODO: Need to simplfy logic of this entire canGetToContent function

			(lineages || []).forEach(function(lineage) {
				// ick, bad logic testing for the existence of the node in the Outline. (Need LibraryPath for this)
				if (store.getById(lineage[Math.max(0, lineage.length - 2)]) || (rootId && lineage.indexOf(rootId) >= 0)) {
					//root is in the path of the lineage, we're good to go.
					canGetTo = true;
				}
			});

			return canGetTo;
		});
	},

	/**
	 * Check is this instance is in the same family as another
	 * @param  {CourseInstance} instance the instance to compare against
	 * @return {Boolean}        if they are in the same family
	 */
	inSameFamily: function(instance) {
		var catalog = this.getCourseCatalogEntry();

		return catalog.inSameFamily(instance.getCourseCatalogEntry());
	},


	isExpired: function() {
		var c = this.getCourseCatalogEntry();
		return c && c.isExpired();
	},


	getLocationInfo: function() {
		var me = this,
			bundle = me.get('Bundle');

		return me.getWrapper()
			.then(function(enrollment) {
				return bundle.getLocationInfo(enrollment.get('Status'));
			})
			.then(function(locationInfo) {
				if (locationInfo) {
					locationInfo.isCourse = true;
					//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
					locationInfo.courseInstance = me;
				}

				return locationInfo;
			});
	},


	getPresentationProperties: function(id) {
		return this.get('Bundle').getPresentationProperties(id);
	},


	getAssetRoot: function() {
		return this.get('Bundle').getAssetRoot();
	},


	/**
	 * Return the a promise that fulfills with the background image of the bundle
	 *
	 * @return {Promise} fulfills with url
	 */
	getBackgroundImage: function() {
		return this.get('Bundle').getBackgroundImage();
	},


	getIconImage: function() {
		return this.get('Bundle').getIconImage();
	},


	getThumbnail: function() {
		return this.get('Bundle').getThumbnail();
	},


	getVendorIconImage: function() {
		return this.get('Bundle').getVendorIcon();
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


	/**
	 * Return the enrollment instance for this course.
	 *
	 * The enrollment instance should've set itself on the course instance on precache
	 *
	 * Because of how the ParsingUtils work, and since the CourseInstance is a property
	 * on the enrollment instance the enrollment instance should be in the course instance's stores
	 *
	 * @return {Promise} fulfills with the enrollment instance
	 */
	getWrapper: function() {
		var me = this;

		//the enrollment instance shouldn't change so we can cache this logic
		if (!me.__findWrapper) {
			me.__findWrapper = new Promise(function(fulfill, reject) {
				var found = false,
					enrollment = me.getEnrollment();

				if (enrollment) {
					found = true;
					fulfill(enrollment);
				} else {
					me.stores.forEach(function(obj) {
						if (obj.isModel) {
							fulfill(obj);
							found = true;
						}
					});
				}

				if (!found) {
					console.error('The Enrollment instance wasnt in the course instances stores');
				}
			});
		}

		return me.__findWrapper;
	},


	findOutlineNode: function(id) {
		var outline = this.get('Outline');

		return outline.findOutlineNode(id);
	},


	getOutlineContents: function(doNotCache) {
		var outline = this.get('Outline');

		return outline.getOutlineContents(doNotCache);
	},


	getAdminOutlineContents: function(doNotCache) {
		var outline = this.get('Outline');

		return outline.getAdminOutlineContents(doNotCache);
	},


	getOutlineInterface: function(doNotCache) {
		return new NextThought.store.courseware.OutlineInterface({
			outlineContentsPromise: this.getOutlineContents(doNotCache),
			tocPromise: this.__getTocOutline(),
			courseInstance: this
		});
	},


	getAdminOutlineInterface: function(doNotCache) {
		return new NextThought.store.courseware.OutlineInterface({
			outlineContentsPromise: this.getAdminOutlineContents(doNotCache),
			tocPromise: this.__getTocOutline(),
			courseInstance: this
		});
	},


	hasOutline: function() {
		var outline = this.get('Outline');

		return outline && outline.hasContentsLink();
	},


	getOutline: function() {
		//cache outline
		if (!this._outlinePromise) {
			var o = this.get('Outline'),
				me = this;

			this._outlinePromise = o.getContents()
					.done(function() {
						o.bundle = me;
						o.navStore = me.getNavigationStore();
						return o;
					});

		}

		return this._outlinePromise;
	},

	/**
	 * Return an outline store based on the first toc,
	 * cache these results for now.
	 * TODO: don't keep these cached for the lifetime of the app
	 * @return {[type]} [description]
	 */
	__getTocOutline: function() {
		if (!this.tocOutline) {
			this.tocOutline = this.getLocationInfo()
				.then(function(location) {
					return new NextThought.store.courseware.ToCBasedOutline({data: location.toc});
				});
		}

		return this.tocOutline;
	},


	getNavigationStore: function() {
		var key = 'NavStore',
			navStore;

		navStore = this.getFromCache(key);

		if (!navStore) {
			navStore = new NextThought.store.courseware.Navigation({
				outlineContentsPromise: this.getOutlineContents(),
				tocPromise: this.__getTocOutline()
			});

			navStore.courseInstance = this;

			this.cacheForShortPeriod(key, navStore);
		}

		return navStore;
	},


	shouldShowAssignments: function() {
		//we should only show assignments if there is an assignments by outline node link
		return !!this.getLink('AssignmentsByOutlineNode');
	},


	/**
	 * Get the AssignmentHistory link off of the enrolled instance or this
	 * @return {String} link to the assignment history
	 */
	__getAssignmentHistoryLink: function() {
		var me = this;

		function getLink(rel, e) { return e.getLink(rel) || me.getLink(rel); }

		return this.getWrapper()
			.then(getLink.bind(null, 'AssignmentHistory'));
	},

	/**
	 * get the link, and cache the results
	 * @param  {String} link rel of the link to get
	 * @return {Promise}      the request for the link
	 */
	__getList: function(link) {
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
		return this.__getList('AssignmentsByOutlineNode');
	},


	__getNonAssignmentsByOutline: function() {
		return this.__getList('NonAssignmentAssessmentItemsByOutlineNode');
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
	 * Return an assignment collection for this course
	 * @return {AssignmentCollection} the assignment collection
	 */
	getAssignments: function() {
		if (this.__getAssignmentsPromise) { return this.__getAssignmentsPromise; }

		var gradeBook = this.get('GradeBook');

		if (!this.getLink('AssignmentsByOutlineNode')) {
			return Promise.resolve(NextThought.model.courses.AssignmentCollection.fromJson(
				{},{},null, null, this.getLink('AssignmentHistory')));
		}

		this.__getAssignmentsPromise = Promise.all([
			this.getWrapper()
				.fail(function() { return {}; }),
			this.__getAssignmentsByOutline(),
			this.__getNonAssignmentsByOutline(),
			this.__getAssignmentHistoryLink()
		])
			.then(function(results) {
				var wrapper = results[0],
					assignments = results[1],
					nonAssignments = results[2],
					historyURL = results[3];

				return NextThought.model.courses.AssignmentCollection.fromJson(assignments, nonAssignments, gradeBook, historyURL, wrapper.isAdministrative);
			});

		return this.__getAssignmentsPromise;
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


	getAllAssignments: function() {
		return this.getAssignments()
				.then(function(assignments) {
					return assignments.get('Assignments');
				});
	},


	getAllAssessments: function() {
		return this.getAssignments()
				.then(function(assignments) {
					var nonAssignments = assignments.get('NonAssignments');

					return (nonAssignments || []).filter(function(item) {
						return item instanceof NextThought.model.assessment.QuestionSet;
					});
				});
	},



	fireNavigationEvent: function(eventSource) {
		var me = this;

		return new Promise(function(fulfill) {
			eventSource.fireEvent('course-selected', me, function() {
				fulfill();
			});
		});
	},


	__getAssets: function(type) {
		var link = this.getLink('assets'),
			config;

		if (!link) {
			console.error('No assets link');
			return Promise.resolve([]);
		}

		config = {
			url: link,
			method: 'GET'
		};

		if (type) {
			config.params = {
				accept: type
			};
		}

		return Service.request(config)
			.then(function(resp) {
				var json = JSON.parse(resp);

				return ParseUtils.parseItems(json.Items);
			})
			.fail(function(reason) {
				console.error('Failed to load assets: ', reason, type);

				return [];
			});
	},


	getVideoAssets: function() {
		return this.__getAssets(NextThought.model.Video.mimeType);
	},


	getDiscussionAssets: function() {
		var link = this.getLink('CourseDiscussions');

		if (!link) {
			console.error('No discussions link');
			return Promise.resolve([]);
		}

		return Service.request({
				url: link,
				method: 'GET'
			}).then(function(resp) {
				var json = JSON.parse(resp),
					items = [];

				for (var k in json.Items) {
					if (json.Items.hasOwnProperty(k)) {
						items.push(json.Items[k]);
					}
				}

				return ParseUtils.parseItems(items);
			}).fail(function(reason) {
				console.error('Failed to load Discussions: ', reason);

				return [];
			});
	},


	getVideosByContentPackage: function() {
		return this.get('Bundle').getVideosByContentPackage();
	},


	getMediaByOutline: function() {
		return this.__getList('MediaByOutlineNode');
	},


	getVideoIndex: function() {
		if (this.videoIndexPromise) {
			return this.videoIndexPromise;
		}

		this.videoIndexPromise = this.getMediaByOutline()
									.then(function(outline) {
										var items = outline.Items;

										// if we have slidedeck, map video obj to their respective slidedeck
										for (var key in items) {
											if (items.hasOwnProperty(key)) {
												item = items[key] || {};
												if (item.Class === 'NTISlideDeck') {
													Ext.each(item.Videos || [], function(slidevideo) {
														var vid = slidevideo.video_ntiid;
														if (vid && items[vid]) {
															items[vid].slidedeck = item.NTIID;
														}
													});
												}
											}
										}

										return Promise.resolve(items || {});
									});

		return this.videoIndexPromise;
	},


	getVideoForId: function(vid) {
		return this.getVideoIndex()
				.then(function(index) {
					var i = index[vid];
					// Note: Old courses (i.e.Spring 14) don't have the class type but the outline only contains videos.
					// Newer outline contains more that just a video, they include slidedeck...So, for backwards compatibility,
					// to be a video if it has a class it has to be Video, if not, default to video.
					if (i && (i.Class === undefined || i.Class === 'Video')) {
						return Promise.resolve(i);
					}
					return Promise.reject();
				});
	},

	/**
	/*	Check if a video belongs to a slidedeck
	*/
	getSlidedeckForVideo: function(vid) {
		return this.getVideoIndex()
				.then(function(index) {
					var i = index[vid];
					if (i && i.slidedeck) {
						return Promise.resolve(i.slidedeck);
					}
					return Promise.reject();
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


	hasForumList: function() {
		var board = this.get('Discussions'),
			parentBoard = this.get('ParentDiscussions');

		return !!((board && board.getLink('contents')) || (parentBoard && parentBoard.getLink('contents')));
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


	getVideoProgress: function() {
		var link = this.getLink('VideoProgress');

		if (!link) { return Promise.reject(); }

		return Service.request(link)
					.then(function(response) {
						return ParseUtils.parseItems(response)[0];
					});
	},


	getSuggestContacts: function() {
		if (!isFeature('suggest-contacts') || !this.hasLink('Classmates')) { return Promise.reject(); }

		var link = this.getLink('Classmates');

		return Service.request(link)
			.then(function(response) {
				var parent = JSON.parse(response);
				return ParseUtils.parseItems(parent.Items);
			});
	}
});
