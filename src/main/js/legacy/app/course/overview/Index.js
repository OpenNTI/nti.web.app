const Ext = require('@nti/extjs');
const { encodeForURI, decodeFromURI, isNTIID } = require('@nti/lib-ntiids');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const LibraryActions = require('internal/legacy/app/library/Actions');
const Globals = require('internal/legacy/util/Globals');
const Lesson = require('internal/legacy/model/courses/overview/Lesson');
const PageInfo = require('internal/legacy/model/PageInfo');
const PlaylistItem = require('internal/legacy/model/PlaylistItem');
const QuestionSetRef = require('internal/legacy/model/QuestionSetRef');
const RelatedWork = require('internal/legacy/model/RelatedWork');
const SurveyRef = require('internal/legacy/model/SurveyRef');
const Slidedeck = require('internal/legacy/model/Slidedeck');
const Video = require('internal/legacy/model/Video');
const LTIExternalToolAsset = require('internal/legacy/model/LTIExternalToolAsset');
const WebinarAsset = require('internal/legacy/model/WebinarAsset');

const { ROUTE_BUILDERS } = require('./components/Constants');

require('internal/legacy/mixins/FillScreen');
require('internal/legacy/mixins/Router');
require('internal/legacy/util/Parsing');

require('../assessment/components/editing/AssignmentEditor');
require('../../contentviewer/Index');
require('../../content/content/Index');
require('../../mediaviewer/Index');
require('./components/View');

module.exports = exports = Ext.define('NextThought.app.course.overview.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router',
		FillScreen: 'NextThought.mixins.FillScreen',
	},

	statics: {
		showTab: function (bundle) {
			return bundle && bundle.hasOutline();
		},
	},

	title: 'Lessons',
	layout: 'card',

	items: [{ xtype: 'course-overview-view' }],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/:lesson/content/:id', this.showContent.bind(this));
		this.addRoute(
			'/:lesson/content/:id/:page/video/',
			this.showMediaViewer.bind(this)
		);
		this.addRoute(
			'/:lesson/content/:id/:page',
			this.showContent.bind(this)
		);
		this.addRoute(
			'/:lesson/content/:id/video/',
			this.showMediaViewer.bind(this)
		);
		this.addRoute(
			'/:lesson/assignment/:id',
			this.showAssignment.bind(this)
		);
		this.addRoute(
			'/:lesson/assignment/:id/edit',
			this.showAssignmentEditor.bind(this)
		);
		this.addRoute('/:lesson/video/', this.showMediaViewer.bind(this));
		this.addRoute('/:lesson/slidedeck/', this.showMediaViewer.bind(this));

		this.addDefaultRoute(this.showLessons.bind(this));

		this.addObjectHandler(
			PageInfo.mimeType,
			this.getPageInfoRoute.bind(this)
		);
		this.addObjectHandler(
			RelatedWork.mimeType,
			this.getRelatedWorkRoute.bind(this)
		);
		this.addObjectHandler(
			PlaylistItem.mimeType,
			this.getVideoRoute.bind(this)
		);
		this.addObjectHandler(
			Slidedeck.mimeType,
			this.getSlidedeckRoute.bind(this)
		);

		this.lessons = this.down('course-overview-view');

		this.lessons.parentHandleMediaViewerRoute = (...args) =>
			this.pushRoute(...args);

		this.lessons.gotoResources = () => {
			if (this.gotoResources) {
				this.gotoResources();
			}
		};

		this.addChildRouter(this.lessons);

		this.LibraryActions = LibraryActions.create();

		this.on('deactivate', this.closeReading.bind(this));
	},

	onAddedToParentRouter: function () {
		//replace lesson's push route with mine
		this.lessons.pushRoute = this.pushRoute.bind(this);
	},

	onRouteActivate: function () {
		this.setTitle(this.title);
	},

	onRouteDeactivate: function (...args) {
		const active = this.getLayout().getActiveItem();

		active?.onRouteDeactivate?.(...args);

		const [newRoute] = args;
		if (!/^\/course/.test(newRoute)) {
			this.lessons.clear();
		}

		if (this.activeMediaWindow) {
			Ext.destroy(this.activeMediaWindow);
			delete this.activeMediaWindow;
		}

		if (this.reader) {
			this.reader.fireEvent('deactivate');
		}
	},

	closeReading() {
		const lessons = this.getLessons();

		if (this.reader) {
			this.reader.destroy();
			delete this.reader;
		}

		this.getLayout().setActiveItem(lessons);
	},

	getActiveLesson() {
		const lessons = this.getLessons();

		return this.activeLesson || lessons.getActiveLesson();
	},

	getContext: function () {
		var lessons = this.getLessons(),
			item = this.getLayout().getActiveItem();

		if (item === this.activeMediaWindow) {
			return item;
		}

		return this.activeLesson || lessons.getActiveLesson();
	},

	getLessons: function () {
		return this.lessons;
	},

	bundleChanged: function (bundle) {
		var item = this.getLayout().getActiveItem(),
			lessons = this.getLessons();
		if (bundle && this.currentBundle !== bundle) {
			const hadAssignments = bundle.hasAssignments();

			bundle.getAssignments().then(collection => {
				if (
					hadAssignments &&
					collection &&
					collection.updateAssignments
				) {
					collection.updateAssignments(true);
				}
			});

			this.store = bundle.getAdminOutlineInterface();
		}

		this.currentBundle = bundle;

		if (lessons === item || !item.bundleChanged) {
			return lessons.bundleChanged(bundle);
		}

		lessons.bundleChanged(bundle);

		return item.bundleChanged(bundle);
	},

	showLessons: function (route /*, subRoute*/) {
		var lessons = this.getLessons();

		this.getLayout().setActiveItem(lessons);

		this.setShadowRoot(route.path);

		if (this.rendered) {
			this.fillScreen(this.el.dom, 10);
		}

		if (this.reader) {
			Ext.destroy(this.reader);
			delete this.reader;
		}
		if (this.activeMediaWindow) {
			Ext.destroy(this.activeMediaWindow);
			delete this.activeMediaWindow;
		}

		if (this.assignmentViewer) {
			Ext.destroy(this.assignmentViewer);
			delete this.assignmentViewer;
		}

		let path = Globals.trimRoute(route.path);

		if (route.object && route.object.id) {
			path = `${path}/object`;

			if (route.object.mimeType) {
				path = `${path}/${route.object.mimeType}`;
			}

			path = `${path}/${route.object.id}`;
		}

		if (route.hash) {
			path = `${path}#${route.hash}`;
		}

		return lessons.handleRoute(path, route.precache);
	},

	showContent: function (route /*, subRoute*/) {
		var me = this,
			rootId = route.params.id,
			pageId = route.params.page,
			lessonId = route.params.lesson,
			lesson = route.precache.lesson,
			readerRoute;

		lessonId = decodeFromURI(lessonId);
		rootId = decodeFromURI(rootId);
		pageId = pageId && decodeFromURI(pageId);

		//If we have a reader and its root is the same as the root we are trying to set
		//and either if:
		//1.) we aren't trying to set a page and the reader doesn't have a page
		//2.) we are trying to set a page and its the reader's current page
		//then don't on set the reader to prevent it from flashing.
		if (me.reader && me.reader.hasReader()) {
			if (me.reader.root === rootId) {
				if (me.reader.isShowingPage(pageId || rootId)) {
					if (me.activeMediaWindow) {
						me.activeMediaWindow.destroy();
					}

					// Triggers showing search hits
					me.reader.fireEvent('activate');

					if (route.object.id) {
						return Service.getObject(decodeFromURI(route.object.id))
							.then(me.reader.showNote.bind(me.reader))
							.catch(function (reason) {
								console.log('Failed to resolve note: ', reason);
							});
					}

					return Promise.resolve();
				}
			}
		}

		if (me.rendered) {
			me.fillScreen(me.el.dom, 10);
			me.el.mask('Loading...');
		}

		return me.store
			.onceBuilt()
			.then(function () {
				const hash = route.hash && decodeFromURI(route.hash);
				const object = route.object.id
					? decodeFromURI(route.object.id)
					: hash;

				if (object && isNTIID(object)) {
					return Service.getObject(decodeFromURI(object)).catch(
						function (reason) {
							console.log('Failed to resolve note: ', reason);
						}
					);
				}
			})
			.then(function (note) {
				var siblings = [];

				if (lessonId && (!lesson || lesson.getId() !== lessonId)) {
					lesson = me.store.getNode(lessonId);
				}

				//For now don't make the lessons have a menu
				//XXX me.store is no longer the navigation store, it is now the bundle's
				//XXX OutlineInterface
				// siblings = me.store.getRange().reduce(function(c, item) {
				//	var id;

				//	if (item.get('type') === 'lesson') {
				//		id = item.getId();

				//		c.push({
				//			route: encodeForURI(id),
				//			precache: {
				//				lesson: item
				//			},
				//			label: item.get('label'),
				//			title: item.get('label'),
				//			cls: item === lesson ? 'current' : ''
				//		});
				//	}

				//	return c;
				// }, []);

				me.activeLesson = lesson;

				route.precache.parent = {
					label: lesson.get('label'),
					title: lesson.get('label'),
					route: encodeForURI(lesson.getId()),
					ntiid: lesson.getId(),
					precache: {
						lesson: lesson,
					},
					siblings: siblings,
				};

				if (note) {
					route.precache.note = note;
				}

				if (me.reader) {
					me.reader.destroy();
				}

				if (me.assignmentViewer) {
					me.assignmentViewer.destroy();
					delete me.assignmentViewer;
				}

				me.reader = me.add({
					xtype: 'bundle-content',
					currentBundle: me.currentBundle,
					handleContentNavigation:
						me.handleContentNavigation.bind(me),
					handleNavigation: me.handleNavigation.bind(me),
					navigateToObject: me.navigateToObject.bind(me),
					onDelete: () => {
						me.pushRoute(
							route.precache.parent.title,
							route.precache.parent.route
						);
					},
					gotoResources: () => {
						if (me.gotoResources) {
							me.gotoResources();
						}
					},
					root: rootId,
					rootRoute:
						route.precache.parent.route +
						'/content/' +
						route.params.id +
						'/',
				});

				if (me.activeMediaWindow) {
					me.activeMediaWindow.destroy();
				}

				me.getLayout().setActiveItem(me.reader);

				readerRoute = route.params.id;

				if (route.params.page) {
					readerRoute = readerRoute + '/' + route.params.page;
				}

				return me.reader.handleRoute(readerRoute, route.precache);
			})
			.then(function () {
				if (me.el) {
					me.el.unmask();
				}
			})
			.catch(function (reason) {
				alert('Failed to load reading.');

				if (me.el) {
					me.el.unmask();
				}

				return Promise.reject(reason);
			});
	},

	showAssignmentEditor(route, subRoute) {
		const lessonId = decodeFromURI(route.params.lesson || '');
		const assignmentId = decodeFromURI(route.params.id || '');

		if (this.rendered) {
			this.fillScreen(this.el.dom, 10);
			this.el.mask('Loading...');
		}

		if (this.reader) {
			Ext.destroy(this.reader);
			delete this.reader;
		}

		if (this.activeMediaWindow) {
			Ext.destroy(this.activeMediaWindow);
			delete this.activeMediaWindow;
		}

		if (this.assignmentViewer) {
			Ext.destroy(this.assignmentViewer);
			delete this.assignmentViewer;
		}

		return Promise.all([
			this.currentBundle
				.getAssignments()
				.then(assignments => assignments.getItem(assignmentId)),
		])
			.then(([assignment]) => {
				this.assignmentViewer = this.add({
					xtype: 'assignment-editor',
					assignmentId,
					assignment,
					courseId: this.currentBundle.getId(),
					bundle: this.currentBundle,
					pageSource: { next: null, previous: null },
					gotoRoot: () => {
						this.pushRoute('', `/${encodeForURI(lessonId)}`);
					},
					previewAssignment: id => {
						this.pushRoute(
							'',
							`/${encodeForURI(lessonId)}/items/${encodeForURI(
								id
							)}`
						);
					},
				});

				this.getLayout().setActiveItem(this.assignmentViewer);
			})
			.finally(() => {
				if (this.el) {
					this.el.unmask();
				}
			});
	},

	showAssignment(route, subRoute) {
		const lessonId = decodeFromURI(route.params.lesson || '');
		const assignmentId = decodeFromURI(route.params.id || '');

		if (this.rendered) {
			this.fillScreen(this.el.dom, 10);
			this.el.mask('Loading...');
		}

		return Promise.all([
			this.store.onceBuilt().then(() => this.store.getNode(lessonId)),
			this.currentBundle.getAssignments(),
			this.currentBundle
				.getAssignments()
				.then(assignments => assignments.fetchAssignment(assignmentId)),
			this.currentBundle
				.getAssignments()
				.then(assignments =>
					assignments.getHistoryItem(assignmentId, true)
				)
				.catch(() => null),
		])
			.then(([lesson, assignments, assignment, assignmentHistory]) => {
				if (this.reader) {
					Ext.destroy(this.reader);
					delete this.reader;
				}

				if (this.activeMediaWindow) {
					Ext.destroy(this.activeMediaWindow);
					delete this.activeMediaWindow;
				}

				if (this.assignmentViewer) {
					Ext.destroy(this.assignmentViewer);
					delete this.assignmentViewer;
				}

				this.assignmentViewer = this.add({
					xtype: 'content-viewer',
					bundle: this.currentBundle,
					handleNavigation: this.handleNavigation.bind(this),
					onRouteDeactivate: () => {
						Ext.destroy(this.assignmentViewer.reader);
					},
					handleEdit: editAssignment => {
						const coursePart = encodeForURI(
							this.currentBundle.getId()
						);
						const assignmentPart = encodeForURI(
							editAssignment.getId()
						);

						this.pushRootRoute(
							editAssignment.get('title'),
							`/course/${coursePart}/assignments/${assignmentPart}/edit`,
							{ assignment: editAssignment }
						);
					},
					onAssignmentSubmitted: (submittedId, historyItemLink) => {
						Service.request(historyItemLink)
							.then(
								resp =>
									lazy.ParseUtils.parseItems(
										JSON.parse(resp)
									)[0]
							)
							.then(history => {
								return history
									.resolveFullContainer()
									.then(container => {
										return [history, container];
									});
							})
							.then(([history, container]) => {
								if (this.assignmentViewer) {
									this.assignmentViewer.updateHistory(
										history,
										container
									);
								}

								return history;
							})
							.then(history =>
								assignments.updateHistoryItem(
									submittedId,
									history
								)
							);
					},
					assignment,
					assignmentHistory,
					student: $AppConfig.userObject,
					path: [
						{
							label: lesson.get('title'),
							title: lesson.get('title'),
							route: `/${encodeForURI(lesson.getId())}`,
						},
						{
							cls: 'locked',
							label: assignment.get('title'),
						},
					],
				});

				this.getLayout().setActiveItem(this.assignmentViewer);
			})
			.then(() => {
				if (this.el) {
					this.el.unmask();
				}
			})
			.catch(reason => {
				alert('Failed to load assignment.');

				if (this.el) {
					this.el.unmask();
				}

				return Promise.reject(reason);
			});
	},

	showMediaViewer: function (route, subRoute) {
		const lessonId = decodeFromURI(route.params.lesson);

		return this.showCourseMedia(subRoute, route.precache, lessonId);
	},

	showCourseMedia(subRoute, precache = {}, lessonId) {
		if (!this.activeMediaWindow) {
			this.activeMediaWindow = this.add({
				xtype: 'media-window-view',
				currentBundle: this.currentBundle,
				autoShow: true,
				handleNavigation: this.handleNavigation.bind(this),
				handleClose: this.handleMediaClose.bind(this),
			});

			this.addChildRouter(this.activeMediaWindow);

			this.activeMediaWindow.fireEvent(
				'suspend-annotation-manager',
				this
			);
			this.activeMediaWindow.on({
				beforedestroy: () => {
					this.getLayout().setActiveItem(this.getLessons());
				},
				destroy: () => {
					if (this.activeMediaWindow) {
						this.activeMediaWindow.fireEvent(
							'resume-annotation-manager',
							this
						);
					}
					delete this.activeMediaWindow;
				},
			});
		}

		this.getLayout().setActiveItem(this.activeMediaWindow);
		this.activeMediaWindow.currentBundle = this.currentBundle;
		this.activeMediaWindow.parentLesson = lessonId;
		return this.activeMediaWindow.handleRoute(subRoute, precache);
	},

	getPageInfoRoute: function (obj) {
		var lesson = obj.parent || this.getActiveLesson(),
			lessonId = lesson && lesson.getId(),
			label = obj.get ? obj.get('label') : obj.label,
			pageInfo = obj.getId ? obj.getId() : obj.NTIID;

		if (!lessonId) {
			return Promise.reject();
		}

		lessonId = encodeForURI(lessonId);
		pageInfo = encodeForURI(pageInfo);

		return {
			route: lessonId + '/content/' + pageInfo,
			title: label + ' - ' + lesson.get('label'),
			precache: {
				pageInfo: obj.isModel ? obj : null,
				lesson: lesson,
			},
		};
	},

	getRelatedWorkRoute: function (obj) {
		var lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			relatedWork = obj.getId();

		if (!lessonId) {
			return Promise.reject();
		}

		lessonId = encodeForURI(lessonId);
		relatedWork = encodeForURI(relatedWork);

		return {
			route: lessonId + '/content/' + relatedWork,
			title: obj.get('label') + ' - ' + lesson.get('label'),
			precache: {
				relatedWork: obj,
				lesson: lesson,
			},
		};
	},

	getVideoRoute: function (obj) {
		var lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			videoId = obj.get && obj.getId();

		lessonId = encodeForURI(lessonId);
		videoId = encodeForURI(videoId);

		return {
			route: lessonId + '/video/' + videoId,
			title: obj.get && obj.get('title'),
			precache: {
				video: obj.isModel ? obj : null,
				lesson: lesson,
				basePath: obj.basePath,
			},
		};
	},

	getSlidedeckRoute: function (obj) {
		var lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			sid = obj.get && obj.getId();

		lessonId = encodeForURI(lessonId);
		sid = encodeForURI(sid);

		return {
			route: lessonId + '/slidedeck/' + sid,
			title: obj.get && obj.get('title'),
			precache: {
				slidedeck: obj.isModel ? obj : null,
				lesson: lesson,
				basePath: obj.basePath,
			},
		};
	},

	handleContentNavigation(title, route, precache) {
		const lessonId = this.activeLesson.getId();
		const lessonPart = encodeForURI(lessonId);

		return this.handleNavigation(
			title,
			`${lessonPart}/content/${route}`,
			precache
		);
	},

	handleNavigation: function (title, route, precache) {
		if (!route) {
			return;
		}

		this.pushRoute(title, route, precache);
	},

	handleMediaClose: function (/*cmp*/) {
		this.pushRoute(null, '/');
	},

	getRouteForPath: async function (path, lesson) {
		var root = path[0],
			subPath = path.slice(1),
			route,
			lessonId = lesson && lesson.getId();

		lessonId = encodeForURI(lessonId);

		route = lesson.isPublished()
			? this.getRouteForRoot(root, subPath, lesson)
			: await this.getRouteForUnpublished(root, subPath, lesson);

		route.path = lessonId + '/' + Globals.trimRoute(route.path);

		return route;
	},

	async getRouteForUnpublished(root, subPath, lesson) {
		const objs = await Promise.all(
			[root, ...subPath].map(o => o.getInterfaceInstance())
		);

		let path = null;

		for (let obj of objs) {
			const builder = ROUTE_BUILDERS[obj.MimeType];

			if (builder) {
				path = builder(
					{ NTIID: 'tag:nextthought.com,2011-10:fake-ntiid' },
					{ NTIID: lesson.get('NTIID') },
					obj
				);
			}
		}

		//remove up to the lesson id from the url, since that will be prepended by the rest of the routeForPath process
		const parts = path.split('/');
		const route = parts.slice(parts.indexOf('lessons') + 2).join('/');

		return {
			path: route,
			isFull: true,
		};
	},

	getRouteForRoot: function (root, subPath, lesson) {
		const modalRoute = this.getRouteForRootModal(root, subPath, lesson);

		if (modalRoute) {
			return modalRoute;
		}

		let route;

		if (root instanceof PageInfo) {
			route = this.getRouteForPageInfoPath(root, subPath);
			route.path = 'content/' + Globals.trimRoute(route.path);
		} else if (root instanceof Slidedeck) {
			route = this.getRouteForSlidedeckPath(root, subPath);
		} else if (root instanceof Lesson || root instanceof WebinarAsset) {
			route = {
				path: '',
				isFull: true,
			};
		} else {
			route = {
				path: '',
				isFull: subPath.length <= 0,
			};
		}

		return route;
	},

	getRouteForRootModal(root, subPath, lesson) {
		let path = '';

		if (
			root instanceof QuestionSetRef ||
			root instanceof SurveyRef ||
			root instanceof Video ||
			root instanceof LTIExternalToolAsset
		) {
			path = `items/${encodeForURI(root.getId())}`;
		} else if (root instanceof RelatedWork) {
			const target = root.get('target');
			const page = subPath[0];
			const pageId =
				page && page instanceof PageInfo ? page.getId() : null;

			path =
				!pageId ||
				pageId === lesson.getId() ||
				pageId === lesson.get('ContentNTIID') ||
				pageId === target
					? `items/${encodeForURI(root.getId())}`
					: `items/${encodeForURI(root.getId())}/${encodeForURI(
							pageId
					  )}`;
		}

		return path && { path, isFull: true };
	},

	getRouteForPageInfoPath: function (pageInfo /*, path*/) {
		var pageId = pageInfo && pageInfo.getId();

		pageId = pageId && encodeForURI(pageId);

		return {
			path: pageId || '',
			isFull: true,
		};
	},

	getRouteForSlidedeckPath: function (slidedeck /*, path*/) {
		var slidedeckId = slidedeck && slidedeck.getId();

		slidedeckId = encodeForURI(slidedeckId);

		return {
			path: 'slidedeck/' + slidedeckId,
			isFull: true,
			precache: {
				slidedeck: slidedeck,
			},
		};
	},
});
