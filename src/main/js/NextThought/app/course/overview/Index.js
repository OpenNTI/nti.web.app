Ext.define('NextThought.app.course.overview.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.View',
		'NextThought.app.content.content.Index',
		'NextThought.app.slidedeck.media.Index'
	],

	statics: {
	    showTab: function(bundle) {
			return bundle && !bundle.get('Preview');
		}
	},

	title: 'Lessons',
	layout: 'card',


	items: [
		{xtype: 'course-overview-view'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/:lesson/content/:id', this.showContent.bind(this));
		this.addRoute('/:lesson/content/:id/:page', this.showContent.bind(this));
		this.addRoute('/:lesson/video/', this.showMediaViewer.bind(this));

		this.addDefaultRoute(this.showLessons.bind(this));

		this.addObjectHandler(NextThought.model.PageInfo.mimeType, this.getPageInfoRoute.bind(this));
		this.addObjectHandler(NextThought.model.RelatedWork.mimeType, this.getRelatedWorkRoute.bind(this));
		this.addObjectHandler(NextThought.model.PlaylistItem.mimeType, this.getVideoRoute.bind(this));

		this.lessons = this.down('course-overview-view');

		this.addChildRouter(this.lessons);

		this.on('activate', this.onActivate.bind(this));
		this.LibraryActions = NextThought.app.library.Actions.create();
	},


	onAddedToParentRouter: function() {
		//replace lesson's push route with mine
		this.lessons.pushRoute = this.pushRoute.bind(this);
	},


	onActivate: function() {
		var item = this.getLayout().getActiveItem();

		this.setTitle(this.title);
		if (item.onActivate) {
			item.onActivate();
		}
	},


	getContext: function() {
		var lessons = this.getLessons(), item = this.getLayout().getActiveItem();

		if (item === this.activeMediaWindow) {
			return item;
		}

		return this.activeLesson || lessons.getActiveLesson();
	},


	getLessons: function() {
		return this.lessons;
	},


	bundleChanged: function(bundle) {
		var item = this.getLayout().getActiveItem(),
			lessons = this.getLessons();

		this.currentBundle = bundle;
		this.store = bundle.getNavigationStore();

		if (lessons === item) {
			return lessons.bundleChanged(bundle);
		}

		lessons.bundleChanged(bundle);

		return item.bundleChanged(bundle);
	},


	showLessons: function(route, subRoute) {
		var lessons = this.getLessons();

		this.getLayout().setActiveItem(lessons);

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


	showContent: function(route, subRoute) {
		var me = this,
			contentPath,
			rootId = route.params.id,
			pageId = route.params.page,
			lessonId = route.params.lesson,
			lesson = route.precache.lesson;

		lessonId = ParseUtils.decodeFromURI(lessonId);
		rootId = ParseUtils.decodeFromURI(rootId);
		pageId = pageId && ParseUtils.decodeFromURI(pageId);

		//If we have a reader and its root is the same as the root we are trying to set
		//and either if:
		//1.) we aren't trying to set a page and the reader doesn't have a page
		//2.) we are trying to set a page and its the reader's current page
		//then don't on set the reader to prevent it from flashing.
		if (me.reader) {
			if (me.reader.root === rootId) {
				if (!pageId && me.reader.pageId === rootId) {
					return Promise.resolve();
				}

				if (pageId && me.reader.pageId && me.reader.pageId === pageId) {
					return Promise.resolve();
				}
			}
		}

		return me.store.onceBuilt()
			.then(function() {
				var siblings;

				if (lessonId && (!lesson || lesson.getId() !== lessonId)) {
					lesson = me.store.findRecord('NTIID', lessonId, false, true, true);
				}

				siblings = me.store.getRange().reduce(function(c, item) {
					var id;

					if (item.get('type') === 'lesson') {
						id = item.getId();

						c.push({
							route: ParseUtils.encodeForURI(id),
							precache: {
								lesson: item
							},
							label: item.get('label'),
							title: item.get('label'),
							cls: item === lesson ? 'current' : ''
						});
					}

					return c;
				}, []);

				me.activeLesson = lesson;

				route.precache.parent = {
					label: lesson.get('label'),
					title: lesson.get('label'),
					route: ParseUtils.encodeForURI(lesson.getId()),
					precache: {
						lesson: lesson
					},
					siblings: siblings
				};

				if (me.reader) {
					me.reader.destroy();
				}

				me.reader = me.add({
					xtype: 'bundle-content',
					currentBundle: me.currentBundle,
					handleNavigation: me.handleNavigation.bind(me),
					navigateToObject: me.navigateToObject.bind(me),
					root: rootId,
					rootRoute: route.precache.parent.route + '/content/' + route.params.id + '/'
				});

				me.getLayout().setActiveItem(me.reader);

				return me.reader.handleRoute(route.params.id + '/' + (route.params.page || ''), route.precache);
			});
	},


	showMediaViewer: function(route, subRoute) {
		var me = this;

		if (!me.activeMediaWindow) {
			me.activeMediaWindow = me.add({
				xtype: 'media-window-view',
				currentBundle: me.currentBundle,
				autoShow: true,
				handleNavigation: me.handleNavigation.bind(me),
				handleClose: me.handleMediaClose.bind(me)
			});

			me.addChildRouter(me.activeMediaWindow);

			me.activeMediaWindow.fireEvent('suspend-annotation-manager', this);
			me.activeMediaWindow.on('destroy', function() {
				if (me.activeMediaWindow) {
					me.activeMediaWindow.fireEvent('resume-annotation-manager', this);
				}
			});
		}

		me.getLayout().setActiveItem(me.activeMediaWindow);
		me.activeMediaWindow.currentBundle = me.currentBundle;
		return me.activeMediaWindow.handleRoute(subRoute, route.precache);
	},


	getPageInfoRoute: function(obj) {
		var lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			label = obj.get ? obj.get('label') : obj.label,
			pageInfo = obj.getId ? obj.getId() : obj.NTIID;

		if (!lessonId) {
			return Promise.reject();
		}

		lessonId = ParseUtils.encodeForURI(lessonId);
		pageInfo = ParseUtils.encodeForURI(pageInfo);

		return {
			route: lessonId + '/content/' + pageInfo,
			title: label + ' - ' + lesson.get('label'),
			precache: {
				pageInfo: obj.isModel ? obj : null,
				lesson: lesson
			}
		};
	},


	getRelatedWorkRoute: function(obj) {
		var	lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			relatedWork = obj.getId();

		if (!lessonId) {
			return Promise.reject();
		}

		lessonId = ParseUtils.encodeForURI(lessonId);
		relatedWork = ParseUtils.encodeForURI(relatedWork);

		return {
			route: lessonId + '/content/' + relatedWork,
			title: obj.get('label') + ' - ' + lesson.get('label'),
			precache: {
				relatedWork: obj,
				lesson: lesson
			}
		};
	},


	getVideoRoute: function(obj) {
		var lesson = obj.parent,
			lessonId = lesson && lesson.getId(),
			videoId = obj.get && obj.getId();

		lessonId = ParseUtils.encodeForURI(lessonId);
		videoId = ParseUtils.encodeForURI(videoId);

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


	handleNavigation: function(title, route, precache) {
		this.pushRoute(title, route, precache);
	},

	handleMediaClose: function(cmp) {
		this.pushRoute(null, '/');
	},


	getRouteForPath: function(path, lesson) {
		var root = path[0],
			subPath = path.slice(1),
			route,
			lessonId = lesson && lesson.getId();

		lessonId = ParseUtils.encodeForURI(lessonId);

		if (root instanceof NextThought.model.RelatedWork) {
			route = this.getRouteForRelatedWorkPath(root, subPath);
			route.path = 'content/' + Globals.trimRoute(route.path);
		} else if (root instanceof NextThought.model.PageInfo) {
			route = this.getRouteForPageInfoPath(root, subPath);
		} else {
			route = {
				path: '',
				isFull: subPath.length <= 0
			};
		}

		route.path = lessonId + '/' + Globals.trimRoute(route.path);

		return route;
	},


	getRouteForRelatedWorkPath: function(relatedWork, path) {
		var root = path[0],
			rootId = root && root.getId();

		rootId = rootId && ParseUtils.encodeForURI(rootId);

		return {
			path: rootId || '',
			isFull: true
		};
	},


	getRouteForPageInfoPath: function(pageInfo, path) {
		var pageId = pageInfo && pageInfo.getId();

		pageId = pageId && ParseUtils.encodeForURI(pageId);

		return {
			path: pageId || '',
			isFull: true
		};
	}
});
