const Ext = require('@nti/extjs');
const { encodeForURI, decodeFromURI, isNTIID } = require('@nti/lib-ntiids');

const LibraryActions = require('legacy/app/library/Actions');
const Globals = require('legacy/util/Globals');
const ExternalToolAsset = require('legacy/model/ExternalToolAsset');
const Lesson = require('legacy/model/courses/overview/Lesson');
const PageInfo = require('legacy/model/PageInfo');
const PlaylistItem = require('legacy/model/PlaylistItem');
const QuestionSetRef = require('legacy/model/QuestionSetRef');
const RelatedWork = require('legacy/model/RelatedWork');
const SurveyRef = require('legacy/model/SurveyRef');
const Slidedeck = require('legacy/model/Slidedeck');
const Video = require('legacy/model/Video');

require('legacy/mixins/FillScreen');
require('legacy/mixins/Router');
require('legacy/util/Parsing');

require('../../content/content/Index');
require('../../mediaviewer/Index');
require('./components/View');


module.exports = exports = Ext.define('NextThought.app.course.overview.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router',
		FillScreen: 'NextThought.mixins.FillScreen'
	},

	statics: {
		showTab: function (bundle) {
			return bundle && bundle.hasOutline();
		}
	},

	title: 'Lessons',
	layout: 'card',

	items: [
		{xtype: 'course-overview-view'}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/:lesson/content/:id', this.showContent.bind(this));
		this.addRoute('/:lesson/content/:id/:page/video/', this.showMediaViewer.bind(this));
		this.addRoute('/:lesson/content/:id/:page', this.showContent.bind(this));
		this.addRoute('/:lesson/content/:id/video/', this.showMediaViewer.bind(this));
		this.addRoute('/:lesson/video/', this.showMediaViewer.bind(this));
		this.addRoute('/:lesson/slidedeck/', this.showMediaViewer.bind(this));

		this.addDefaultRoute(this.showLessons.bind(this));

		this.addObjectHandler(ExternalToolAsset.mimeType, this.getExternalToolAssetRoute.bind(this));
		this.addObjectHandler(PageInfo.mimeType, this.getPageInfoRoute.bind(this));
		this.addObjectHandler(RelatedWork.mimeType, this.getRelatedWorkRoute.bind(this));
		this.addObjectHandler(PlaylistItem.mimeType, this.getVideoRoute.bind(this));
		this.addObjectHandler(Slidedeck.mimeType, this.getSlidedeckRoute.bind(this));

		this.lessons = this.down('course-overview-view');

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

	onRouteDeactivate: function () {
		const active = this.getLayout().getActiveItem();

		if (active && active.onRouteDeactivate) {
			active.onRouteDeactivate();
		}

		if (this.activeMediaWindow) {
			Ext.destroy(this.activeMediaWindow);
			delete this.activeMediaWindow;
		}

		if (this.reader) {
			this.reader.fireEvent('deactivate');
		}
	},


	closeReading () {
		const lessons = this.getLessons();

		if (this.reader) {
			this.reader.destroy();
			delete this.reader;
		}

		this.getLayout().setActiveItem(lessons);
	},


	getContext: function () {
		var lessons = this.getLessons(), item = this.getLayout().getActiveItem();

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
			bundle.getAssignments()
				.then((collection) => {
					if (collection && collection.updateAssignments) {
						collection.updateAssignments(true);
					}
				});

			this.store = bundle.getAdminOutlineInterface();
		}

		this.currentBundle = bundle;

		if (lessons === item) {
			return lessons.bundleChanged(bundle);
		}

		lessons.bundleChanged(bundle);

		return item.bundleChanged(bundle);
	},

	showLessons: function (route/*, subRoute*/) {
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

		return lessons.handleRoute(route.path, route.precache);
	},

	showContent: function (route/*, subRoute*/) {
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

		return me.store.onceBuilt()
			.then(function () {
				const hash = route.hash && decodeFromURI(route.hash);
				const object = route.object.id ? decodeFromURI(route.object.id) : hash;


				if (object && isNTIID(object)) {
					return Service.getObject(decodeFromURI(object))
						.catch(function (reason) {
							console.log('Failed to resolve note: ', reason);
						});
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
						lesson: lesson
					},
					siblings: siblings
				};

				if (note) {
					route.precache.note = note;
				}

				if (me.reader) {
					me.reader.destroy();
				}

				me.reader = me.add({
					xtype: 'bundle-content',
					currentBundle: me.currentBundle,
					handleContentNavigation: me.handleContentNavigation.bind(me),
					handleNavigation: me.handleNavigation.bind(me),
					navigateToObject: me.navigateToObject.bind(me),
					onDelete: () => {
						me.pushRoute(route.precache.parent.title, route.precache.parent.route);
					},
					gotoResources: () => {
						if (me.gotoResources) {
							me.gotoResources();
						}
					},
					root: rootId,
					rootRoute: route.precache.parent.route + '/content/' + route.params.id + '/'
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
			}).then(function () {
				if (me.el) {
					me.el.unmask();
				}
			}).catch(function (reason) {
				alert('Failed to load reading.');

				if (me.el) {
					me.el.unmask();
				}

				return Promise.reject(reason);
			});
	},

	showMediaViewer: function (route, subRoute) {
		const lessonId = decodeFromURI(route.params.lesson);

		return this.showCourseMedia(subRoute, route.precache, lessonId);
	},


	showCourseMedia (subRoute, precache = {}, lessonId) {
		if (!this.activeMediaWindow) {
			this.activeMediaWindow = this.add({
				xtype: 'media-window-view',
				currentBundle: this.currentBundle,
				autoShow: true,
				handleNavigation: this.handleNavigation.bind(this),
				handleClose: this.handleMediaClose.bind(this)
			});

			this.addChildRouter(this.activeMediaWindow);

			this.activeMediaWindow.fireEvent('suspend-annotation-manager', this);
			this.activeMediaWindow.on({
				'beforedestroy': () => {
					this.getLayout().setActiveItem(this.getLessons());
				},
				'destroy': () => {
					if (this.activeMediaWindow) {
						this.activeMediaWindow.fireEvent('resume-annotation-manager', this);
					}
					delete this.activeMediaWindow;
				}
			});
		}

		this.getLayout().setActiveItem(this.activeMediaWindow);
		this.activeMediaWindow.currentBundle = this.currentBundle;
		this.activeMediaWindow.parentLesson = lessonId;
		return this.activeMediaWindow.handleRoute(subRoute, precache);
	},


	getExternalToolAssetRoute: function (obj) {
		var lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			assetId = obj.get && obj.getId();

		lessonId = encodeForURI(lessonId);
		assetId = encodeForURI(assetId);

		return {
			route: lessonId + '/externaltoolasset/' + assetId,
			title: obj.get && obj.get('title'),
			precache: {
				lesson: lesson,
				basePath: obj.basePath
			}
		};
	},

	getPageInfoRoute: function (obj) {
		var lesson = obj.parent || this.activeLesson,
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
				lesson: lesson
			}
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
				lesson: lesson
			}
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
				basePath: obj.basePath
			}
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
				basePath: obj.basePath
			}
		};
	},


	handleContentNavigation (title, route, precache) {
		const lessonId = this.activeLesson.getId();
		const lessonPart = encodeForURI(lessonId);

		return this.handleNavigation(title, `${lessonPart}/content/${route}`, precache);
	},


	handleNavigation: function (title, route, precache) {
		this.pushRoute(title, route, precache);
	},

	handleMediaClose: function (/*cmp*/) {
		this.pushRoute(null, '/');
	},

	getRouteForPath: function (path, lesson) {
		var root = path[0],
			subPath = path.slice(1),
			route,
			lessonId = lesson && lesson.getId();

		lessonId = encodeForURI(lessonId);

		route = this.getRouteForRoot(root, subPath, lesson);

		route.path = lessonId + '/' + Globals.trimRoute(route.path);

		return route;
	},


	getRouteForRoot: function (root, subPath, lesson) {
		let route;
		if (root instanceof QuestionSetRef) {
			route = this.getRouteForQuestionSetPath(root, subPath, lesson);
			route.path = 'content/' + Globals.trimRoute(route.path);
		} else if (root instanceof SurveyRef) {
			route = this.getRouteForSurveyPath(root, subPath, lesson);
			route.path = 'content/' + Globals.trimRoute(route.path);
		} else if (root instanceof RelatedWork) {
			route = this.getRouteForRelatedWorkPath(root, subPath, lesson);
			route.path = 'content/' + Globals.trimRoute(route.path);
		} else if (root instanceof PageInfo) {
			route = this.getRouteForPageInfoPath(root, subPath);
			route.path = 'content/' + Globals.trimRoute(route.path);
		} else if (root instanceof Video) {
			route = this.getRouteForVideoPath(root, subPath);
		} else if (root instanceof Slidedeck) {
			route = this.getRouteForSlidedeckPath(root, subPath);
		} else if (root instanceof Lesson) {
			route = {
				path: '',
				isFull: true
			};
		} else {
			route = {
				path: '',
				isFull: subPath.length <= 0
			};
		}

		return route;
	},

	getRouteForRelatedWorkPath: function (relatedWork, path, lesson) {
		var page = path[0],
			pageId = page && page instanceof PageInfo ? page.getId() : null,
			relatedWorkId = relatedWork && relatedWork.get('target'),
			urlPath = '',
			subPath = path.slice(1), subRoute;

		if (subPath[0] instanceof Video) {
			subRoute = this.getRouteForRoot(subPath[0], subPath.slice(1));
		}

		if (pageId === lesson.getId() || pageId === lesson.get('ContentNTIID') || !pageId) {
			pageId = null;
			relatedWorkId = relatedWork && relatedWork.getId();
		}

		pageId = pageId && encodeForURI(pageId);
		relatedWorkId = relatedWorkId && encodeForURI(relatedWorkId);

		if (relatedWorkId) {
			urlPath = relatedWorkId;

			if (pageId && pageId !== relatedWorkId) {
				urlPath += '/' + pageId;
			}
		}

		if (subRoute && subRoute.path) {
			urlPath += '/' + subRoute.path;
		}

		return {
			path: urlPath,
			isFull: true
		};
	},

	getRouteForQuestionSetPath: function (questionSetRef, path/*, lesson*/) {
		var page = path[0],
			pageId = page && page.getId();

		pageId = pageId && encodeForURI(pageId);

		return {
			path: pageId,
			isFull: true
		};
	},

	getRouteForSurveyPath: function (survey/*, path, lesson*/) {
		var surveyId = survey.get('Target-NTIID');

		surveyId = surveyId && encodeForURI(surveyId);

		return {
			path: surveyId,
			isFull: true
		};
	},

	getRouteForPageInfoPath: function (pageInfo/*, path*/) {
		var pageId = pageInfo && pageInfo.getId();

		pageId = pageId && encodeForURI(pageId);

		return {
			path: pageId || '',
			isFull: true
		};
	},

	getRouteForVideoPath: function (video/*, path*/) {
		var videoId = video && video.getId();

		videoId = video && encodeForURI(videoId);

		return {
			path: 'video/' + videoId,
			isFull: true
		};
	},

	getRouteForSlidedeckPath: function (slidedeck/*, path*/) {
		var slidedeckId = slidedeck && slidedeck.getId();

		slidedeckId = encodeForURI(slidedeckId);

		return {
			path: 'slidedeck/' + slidedeckId,
			isFull: true,
			precache: {
				slidedeck: slidedeck
			}
		};
	}
});
