Ext.define('NextThought.controller.CourseWare', {
	extend: 'Ext.app.Controller',

	//<editor-fold desc="Config">
	models: [
		'courseware.AssignmentCollection',
		'courseware.CourseActivity',
		'courseware.CourseCatalogEntry',
		'courseware.CourseCatalogInstructorInfo',
		'courseware.CourseCreditLegacyInfo',
		'courseware.CourseInstance',
		'courseware.CourseInstanceAdministrativeRole',
		'courseware.CourseInstanceEnrollment',
		'courseware.CourseOutline',
		'courseware.Grade',
		'courseware.GradeBook',
		'courseware.GradeBookPart',
		'courseware.GradeBookEntry',
		'courseware.LegacyCommunityBasedCourseInstance',
		'courseware.UsersCourseAssignmentHistory',
		'courseware.UsersCourseAssignmentHistoryItem',
		'courseware.UsersCourseAssignmentHistoryItemFeedback',
		'courseware.UsersCourseAssignmentHistoryItemFeedbackContainer',
		'courseware.navigation.CourseOutlineNode',
		'courseware.navigation.CourseOutlineCalendarNode',
		'courseware.navigation.CourseOutlineContentNode'
	],


	stores: [
		'courseware.AdministeredCourses',
		'courseware.AvailableCourses',
		'courseware.EnrolledCourses'
	],


	views: [
		'courseware.assessment.assignments.FilterBar',
		'courseware.assessment.assignments.List',
		'courseware.assessment.assignments.View',
		'courseware.assessment.Activity',
		'courseware.assessment.Navigation',
		'courseware.assessment.Performance',
		'courseware.coursecatalog.Collection',
		'courseware.enrollment.Window',
		'courseware.enrollment.Confirm',
		'courseware.enrollment.Complete'
	],


	refs: [
		{ ref: 'mainNav', selector: 'main-navigation'},
		{ ref: 'contentView', selector: 'content-view-container' },
		{ ref: 'courseAssignmentsView', selector: 'content-view-container course-assessment' },
		{ ref: 'libraryView', selector: 'library-view-container' },
		{ ref: 'enrolledCoursesView', selector: 'library-view-container course-collection[kind=enrolled]' },
		{ ref: 'administeredCoursesView', selector: 'library-view-container course-collection[kind=admin]' },
		{ ref: 'enrollmentWindow', selector: 'enrollment-window'}
	],
	//</editor-fold>


	init: function() {
		this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP = {};
		this.mon(this.application, 'session-ready', 'onSessionReady');


		var control = {
			component: {
				'#main-reader-view reader-content': {
					'beforeNavigate': 'onBeforeContentReaderNavigation'
				},

				'content-view-container': {
					'get-course-hooks': 'applyCourseHooks',
					'track-from-restore': 'trackFromRestore'
				},

				'enrollment-detailview': {
					'show-enrollment-confirmation': 'showEnrollmentConfirmation'
				},

				'enrollment-confirm': {
					'show-enrollment-complete': 'showEnrollmentComplete'
				},

				'enrollment-complete': {
					'close': 'forceCloseWindow'
				},

				'course-catalog-collection': {
					'select': 'onCourseCatalogItemSelect'
				},

				'*': {
					'course-selected': 'onCourseSelected',
					'navigate-to-assignment': 'onNavigateToAssignment',
					'unauthorized-navigation': 'maybeShowEnroll',
					'enrollment-enrolled-complete': 'courseEnrolled',
					'enrollment-dropped-complete': 'courseDropped',
					'show-enrollment': 'showEnrollmentWindow'
				}
			},
			controller: {
				'*': {
					'course-selected': 'onCourseSelected',
					'navigate-to-forum': 'onNavigateToForum',
					'unauthorized-navigation': 'maybeShowEnroll'
				}
			}
		};

		this.listen(control, this);
	},


	//<editor-fold desc="Store Setup">
	applyCourseHooks: function(observable) {
		Ext.apply(observable, {
			getCourseInstance: Ext.bind(this.__getCourseInstance, this),
			isPartOfCourse: Ext.bind(this.__isPartOfCourse, this)
		});
	},


	onSessionReady: function() {
		var s = Service;
		this.setupAdministeredCourses((s.getCollection('AdministeredCourses', 'Courses') || {}).href);
		this.setupAvailableCourses((s.getCollection('AllCourses', 'Courses') || {}).href);
		this.setupEnrolledCourses((s.getCollection('EnrolledCourses', 'Courses') || {}).href);

		this.filterAdministeredEnrolledCourses();
	},


	filterAdministeredEnrolledCourses: function() {
		var admin = Ext.getStore('courseware.AdministeredCourses'),
			enrolled = Ext.getStore('courseware.EnrolledCourses');

		function notAdministrated(o) {
			var id = o.get('CourseInstance').getId(), found = false;
			admin.each(function(a) {
				found = id === a.get('CourseInstance').getId();
				return !found;
			});

			return !found;
		}

		function refilter() {
			enrolled.filter();
		}

		enrolled.removeFilter('adminFilter');
		enrolled.addFilter({ id: 'adminFilter', filterFn: notAdministrated });

		admin.on('load', refilter);
		enrolled.on('load', refilter);
	},


	trackFromRestore: function(course) {
		this.getMainNav().updateCurrent(false, course);
	},


	__setupStore: function(storeId, source) {
		var store = Ext.getStore(storeId);
		if (Ext.isEmpty(source)) {
			console.warn('CourseWare: Not setting up store: ' + storeId + ', no source given');
			store.destroy();
			return null;
		}
		store.proxy.url = getURL(source);
		return store;
	},


	setupAdministeredCourses: function(source) {
		var store = this.__setupStore('courseware.AdministeredCourses', source);
		if (!store) {
			return;
		}
		//this.mon(store, 'load', 'onAdministeredCoursesLoaded');
		store.load();
	},


	setupAvailableCourses: function(source) {
		var store = this.__setupStore('courseware.AvailableCourses', source);

		if (!store) {
			return;
		}

		this.mon(store, 'load', 'markEnrolledCourses');

		this.mon(store, {
			beforeload: 'onAvailableCoursesLoading',
			load: 'onAvailableCoursesLoaded'
		});
		store.load();
	},


	setupEnrolledCourses: function(source) {
		var store = this.__setupStore('courseware.EnrolledCourses', source);
		if (!store) {
			return;
		}
		this.mon(store, 'load', 'markEnrolledCourses');
		//this.mon(store, 'load', 'onEnrolledCoursesLoaded');
		store.load();
	},


	markEnrolledCourses: function() {
		var enrolled = Ext.getStore('courseware.EnrolledCourses'),
			catalog = Ext.getStore('courseware.AvailableCourses');


		//The catalog is going to be bigger, so lets iterate it, on the outer loop.
		catalog.each(function(entry) {
			var instanceRef = entry.getLink('CourseInstance'),
				found = false;

			enrolled.each(function(e) {
				var i = e.get('CourseInstance') || e;
				if (instanceRef === getURL(i.get('href'))) {
					found = true;
				}
				return !found;//stop iterating on finding
			});

			entry.set('enrolled', found);
		});
	},


	onEnrolledCoursesLoaded: function(store) {
		this.getLibraryView().setEnrolledCourses(store);
		//this.onCoursesLoaded(this.getEnrolledCoursesView(), store);
	},


	onAdministeredCoursesLoaded: function(store) {
		this.getLibraryView().setAdministeredCourses(store);
		//this.onCoursesLoaded(this.getAdministeredCoursesView(), store);
	},


	onAvailableCoursesLoading: function() {
		this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP = {};
	},


	onAvailableCoursesLoaded: function(store) {
		var me = this,
			contentMap = me.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP;

		store.each(function(o) {
			var k = o.get('ContentPackageNTIID');
			if (!contentMap.hasOwnProperty(k)) {
				contentMap[k] = o.get('href');
			} else {
				console.error('Assertion Failed! There is another mapping to content package: ' + k);
			}
		});
	},


	onCoursesLoaded: function(cmp, store) {
		Library.onceLoaded().then(function() {
			var content = Library.getCount() && store.getCount();
			cmp[content ? 'show' : 'hide']();
			if (!content) {
				console.debug('Hiding ' + cmp.id + ' because the library or the store (' + store.storeId + ') was empty');
			}
		});
	},
	//</editor-fold>


	//<editor-fold desc="Enrollment/Drop Interaction">
	toggleEnrollmentStatus: function(catelogEntry, enrollement) {
		var collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;
		if (enrollement) {
			return Service.requestDelete(enrollement.get('href'));
		}

		return Service.post(collection, catelogEntry.raw);
	},


	enrollmentChanged: function() {
		var library = Library.getStore();

		library.on({
			single: true,
			scope: this,
			load: 'reloadEnrolledStores'
		});

		//reload the library
		library.load();

		//Refresh the user?
		$AppConfig.userObject.refresh();
	},


	reloadEnrolledStores: function() {
		//reload enrolled/administered
		Ext.getStore('courseware.EnrolledCourses').load();
	},


	courseEnrolled: function() {
		this.enrollmentChanged();
	},


	courseDropped: function(win, rec) {
		this.enrollmentChanged();
		this.fireEvent('content-dropped', rec);
	},
	//</editor-fold>


	maybeShowEnroll: function(sender, ntiid) {
		var course = ntiid && CourseWareUtils.courseForNtiid(ntiid);
		if (course) {
			Ext.getStore('courseware.EnrolledCourses').findCourseBy(course.findByMyCourseInstance())
					//if this promise fulfills, you are enrolled, so put a handler on the failure.
					.fail(this.showEnrollmentWindow.bind(this, course));
		}
		return !course;
	},


	onCourseCatalogItemSelect: function(sel, record) {
		this.showEnrollmentWindow(record, function() {
			record.set('isChanging', true);
		});
		return false;//prevent the Store from handling this as the base class is a store view.
	},


	//<editor-fold desc="Enrollment Window">
	showEnrollmentWindow: function(course, callback) {
		var win = this.getEnrollmentWindow(),
			panel = this.getLibraryView().getPanel();
		if (win) {
			console.error('Enrollment already in progress.  How did you manage this', win);
			return null;
		}

		callback = Ext.Function.createSequence(function() { panel.courseDropped(); }, callback || Ext.emptyFn);

		return this.getView('courseware.enrollment.Window').create({record: course, callback: callback});
	},


	showEnrollmentConfirmation: function(view, course) {
		var me = this,
			enrolledStore = Ext.getStore('courseware.EnrolledCourses'),
			win = me.getEnrollmentWindow();

		if (!win) {
			console.error('Expected a course window', arguments);
			return;
		}

		enrolledStore.findCourseBy(course.findByMyCourseInstance())
				.then(
				function() { //found, enrolled
					me.transitionToComponent(win, {xtype: 'enrollment-confirm', record: course, enrolled: true});
				},
				function() {//not enrolled
					me.toggleEnrollmentStatus(course)
							.then(
							function() {
								course.set('enrolled', true);
								me.transitionToComponent(win, {xtype: 'enrollment-complete', record: course, enrolled: true});
							},
							function(reason) {
								console.log(reason);
								win.showError('An unknown error occurred.  Please try again later.');
								win.setConfirmState(false);
							});
				});
	},


	showEnrollmentComplete: function(view, course) {
		var me = this,
			enrolledStore = Ext.getStore('courseware.EnrolledCourses'),
			win = this.getEnrollmentWindow();

		if (!win) {
			console.error('Expected a purchase window', arguments);
			return;
		}

		enrolledStore.findCourseBy(course.findByMyCourseInstance())
				.then(function(enrollment) {//found to be enrolled, lets drop...
					me.toggleEnrollmentStatus(course, enrollment)
							.then(
							function() {
								course.set('enrolled', false);
								me.transitionToComponent(win, {xtype: 'enrollment-complete', record: course, enrolled: false});
							},
							function(reason) {
								console.log(reason);
								win.showError('An unknown error occurred. Please try again later.');
								win.setConfirmState(false);
							});
				},
				function() {//no found, not enrolled
					this.transitionToComponent(win, {xtype: 'enrollment-complete', record: course, enrolled: false});
				});
	},


	transitionToComponent: function(win, cfg) {
		if (!win) {
			console.error('No window!', arguments);
			return;
		}
		win.hideError();
		win.removeAll(true);
		return win.add(cfg);
	},


	forceCloseWindow: function(cmp, w) {
		var win = this.getEnrollmentWindow();

		if (!win) {
			console.error('Expected a enrollment window', arguments);
			return;
		}

		win.forceClosing = true;
		win.close();
		delete win.forceClosing;
	},
	//</editor-fold>


	onBeforeContentReaderNavigation: function(ntiid) {
		var view = this.getCourseAssignmentsView(),
			collection = view.assignmentsCollection, assignments,
			currentCourse = view.instance, potentials, store, lin;

		//not in a course, ignore.
		if (!currentCourse) {return true;}

		if (!collection) {
			console.debug('Blocking navigation until we have assignment information');
			return false; //we can't know yet, deny.
		}

		//the main content reader cannot access assignments. It must go through the assignments tab.
		potentials = collection.pageContainsAssignment(ntiid);
		if (potentials) {
			console.log('Go to the assignment:', potentials);
			assignments = collection.getAssignmentsForContainer(ntiid);

			if (!Ext.isEmpty(assignments)) {
				if (assignments.length > 1) {
					console.error('More than one assignment for a page: ', ntiid);
				} else {
					this.onNavigateToAssignment(assignments[0].getId());
				}
			}

			return false;
		}

		return CourseWareUtils.canGetToContent(ntiid, currentCourse);
	},


	onCourseSelected: function(instance, callback) {
		var c, view, txn;

		function end() {
			txn.commit();
		}

		if (!instance.__getLocationInfo()) {
			c = instance.getCourseCatalogEntry();
			console.error('The Content Package for this course has not been loaded. Check that this user is "enrolled".\n' +
						  '\tInstance ID: ' + instance.getId() + '\n' +
						  '\tCourseCatalogEntry ID: ' + (c && c.getId()) + '\n' +
						  '\tContent Package ID:' + (c && c.get('ContentPackageNTIID')));
			return false;
		}

		txn = history.beginTransaction('navigation-transaction-' + guidGenerator());

		if (this.fireEvent('show-view', 'content', false) === false) {
			txn.abort();
			return false;
		}


		try {
			this.getMainNav().updateCurrent(false, instance);
			view = this.getContentView();
			view.onBundleSelected(instance)
				.then(callback)
				.always(end);
			return true;
		} catch (er) {
			end();
		}
	},


	onNavigateToAssignment: function(id, user) {
		var content = this.getContentView(),
			tab = content.tabSpecs.reduce(function(a, i) {
				return a || (i.isAssignment && i);
			}, 0);

		content.onTabClicked(tab);
		return content.down('course-assessment-container').gotoAssignment(id, user);
	},


	__isPartOfCourse: function(thing) {
		return Boolean(this.__getCourseMapping(thing));
	},


	/**
	 *
	 * @param {String|NextThought.model.PageInfo} thing A Content NTIID or pageInfo
	 * @private
	 */
	__getCourseMapping: function(thing) {
		thing = ContentUtils.getLineage(thing).last();//always get the root

		var ifo = ContentUtils.getLocation(thing),
			title = ifo && ifo.title,
			ntiid = title && title.get && title.get('NTIID');
		return this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP[ntiid];
	},


	__getCourseInstance: function(thing) {
		var m = this.__getCourseMapping(thing);

		return CourseWareUtils.findCourseBy(
				function(c) {
					var i = c.get('CourseInstance'),
							links = i && i.get('Links'),
							href = links && links.getRelHref('CourseCatalogEntry');
					return getURL(href) === m;
				})
				.then(function(o) {
					return o.get('CourseInstance');
				});
	},


	handleNavigation: function(cid, rec, meta) {
		if (!meta.isCourse) {
			return Promise.resolve();
		}

		var courseEntry, me = this;

		courseEntry = CourseWareUtils.courseForNtiid(cid);

		if (!courseEntry) {
			return Promise.reject('This isnt the course youre looking for');
		}

		return CourseWareUtils.findCourseBy(courseEntry.findByMyCourseInstance())
			.then(function(course) {
				return course.get('CourseInstance').fireNavigationEvent(me);
			});
	},


	getHandlerForNavigationToObject: function(obj, fragment) {
		var me = this;

		function navigateToAssignment(assignment, user) {
			var assignmentId = assignment.getId ? assignment.getId() : assignment,
				catalogEntry = CourseWareUtils.courseForNtiid(assignmentId);

			if (!catalogEntry) {
				console.error('No catalogEntry for assignment:', assignment, obj);
				return Promise.reject();
			}

			return CourseWareUtils.findCourseBy(catalogEntry.findByMyCourseInstance())
				.done(function(course) {
					var instance = course.get('CourseInstance');

					return instance.fireNavigationEvent(me)
						.done(function() {
							return me.onNavigateToAssignment(assignmentId, user);
						});
				});
		}

		if (obj instanceof NextThought.model.assessment.Assignment) {
			return function(obj, fragment) {
				navigateToAssignment(obj.getId());
			};
		}

		if (obj instanceof NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedbackContainer) {
			return function(obj, fragment) {
				var item = obj.get('Items')[0], creator,
					assignmentId = item && item.get('AssignmentId');

				if (!assignmentId) {
					console.error('No assignment id in the feedback:', obj);
					return;
				}

				item.getSubmission()
					.done(function(HistoryItem) {
						var creator = HistoryItem.get('Creator');

						return navigateToAssignment(assignmentId, creator);
					})
					.done(function(reader) {
						var feedback = reader.down('assignment-feedback');

						if (!feedback) {
							reader.down('reader-content').scrollToSelector = 'assignment-feedback';
						} else {
							feedback.maybeScrollIntoView();
						}
					});
			};
		}

		if (obj instanceof NextThought.model.Change) {
			if (obj.getItem() instanceof NextThought.model.courseware.Grade) {
				return function(obj, fragment) {
					var item = obj.getItem ? obj.getItem() : obj.get('Item');

					navigateToAssignment(item.get('AssignmentId'));
				};
			}
		}
	},


	onNavigateToForum: function(board, course, silent) {
		if (!course) { return; }

		var contentView = this.getContentView(),
			forumContainer, isNavigatingToForum = false;

		//add logging to see why contentView.down('[isForumContainer]') is returning undefined... at least I think its returning undefined some times
		console.log('Looking for the forum container under:' + contentView.getId() + ',' + contentView.xtype + ',' + contentView.down('[isForumContainer]'));

		//if its silent, don't switch to the course or switch the tab
		if (silent) {
			return contentView.currentCourse === course && contentView.down('[isForumContainer]');
		}

		if (this.fireEvent('show-view', 'content', true) === false) {
			return false;
		}

		//if we are already in the course just switch the tab
		if (contentView.currentCourse === course) {
			contentView.setActiveTab('course-forum');
		} else {
			//finally if we aren't in the course switch to it
			this.getMainNav().updateCurrent(false, course);
			contentView.onBundleSelected(course, 'course-forum');
			isNavigatingToForum = true;
		}

		forumContainer = contentView.down('[isForumContainer]');
		forumContainer.isFromNavigatingToForum = isNavigatingToForum;

		return forumContainer;
	}
}, function() {

	window.CourseWareUtils = {
		courseForNtiid: function(ntiid) {
			function fn(rec) {
				return prefix && prefix === ParseUtils.ntiidPrefix(rec.get('ContentPackageNTIID'));
			}

			var prefix = ParseUtils.ntiidPrefix(ntiid),
					store = Ext.getStore('courseware.AvailableCourses'),
					course, index;

			store = store.snapshot || store;

			if (prefix) {
				index = store.findBy(fn);
				if (!Ext.isObject(index)) {
					course = index >= 0 ? store.getAt(index) : null;
				}
				else {
					course = index;
				}
			}

			return course;

		},


		onceLoaded: function() {
			return Promise.all([
				Ext.getStore('courseware.AvailableCourses').onceLoaded(),
				Ext.getStore('courseware.AdministeredCourses').onceLoaded(),
				Ext.getStore('courseware.EnrolledCourses').onceLoaded()
			]);
		},


		findCourseBy: function() {
			var enrolled = Ext.getStore('courseware.EnrolledCourses'),
				admin = Ext.getStore('courseware.AdministeredCourses'),
				args = Ext.Array.clone(arguments);

			// I would pool, but its most likely to come from enrolled, and if one promise fails in a pool,
			// the entire pool fails, so it would read poorly in the code only operating on the "failed" case. :}
			return enrolled.findCourseBy.apply(enrolled, args)
					.fail(function() { return admin.findCourseBy.apply(admin, args); });
		},


		resolveCourse: function(courseInstanceId) {
			var enrolled = Ext.getStore('courseware.EnrolledCourses'),
				admin = Ext.getStore('courseware.AdministeredCourses');

			if (courseInstanceId) {
				return enrolled.getCourseInstance(courseInstanceId)
						.fail(function() {
							return admin.getCourseInstance(courseInstanceId);
						});
			}

			return Promise.reject('no id');
		},


		resolveCourseInstanceContainer: function(courseInstanceId) {
			function f(r) {
				var i = r && r.get('CourseInstance');
				return i && i.getId() === courseInstanceId;
			}
			return this.findCourseBy(f);
		},


		forEachCourse: function(fn) {
			var enrolled = Ext.getStore('courseware.EnrolledCourses'),
				admin = Ext.getStore('courseware.AdministeredCourses');

			// the store's each function does not return anything. :| lame.
			// I cannot know if the iteration was terminated so that i can skip calling the next.
			// So I overwrote the implementation to return a value. :}
			if (enrolled.each(fn) === false) {
				admin.each(fn);
			}
		},


		getEnrollmentStatus: function(contentNtiid) {
			var me = this,
				statusMap = me.statusMap, stores = [];

			function clear() {
				delete me.statusMap;
			}

			if (!statusMap) {
				statusMap = me.statusMap = {};
				this.forEachCourse(function(enrollment) {
					statusMap[enrollment.getCourseCatalogEntry().get('ContentPackageNTIID')] = enrollment.get('Status');
				});

				stores.push(Ext.getStore('courseware.EnrolledCourses'), Ext.getStore('courseware.AdministeredCourses'));

				stores.forEach(function(store) {
					store.on({
						single: true,
						load: clear
					});
				});
			}

			return statusMap[contentNtiid];
		},


		canGetToContent: function(ntiid, course) {
			var lin = ContentUtils.getLineage(ntiid),
				store = course && course.getNavigationStore();

			if (!course) {
				return true;
			}

			if (course.__getLocationInfo().NTIID !== lin.last()) {
				return true;//not in the same content...
			}


			if (course.isExpired()) {
				return true;
			}

			// the last item in the lineage is the root of the content.
			// the next to last entry is the first branch from the root
			// of the content (so its a unit or a lesson... if we can
			// find it in the nav store, its available.)
			//TODO: This needs to go away. Favor scoped reader navigation.
			if (!store.getCount()) {
				return true;
			}

			return !!store.getById(lin[Math.max(0, lin.length - 2)]);
		}
	};

});
