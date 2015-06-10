Ext.define('NextThought.app.course.overview.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.View',
		'NextThought.app.course.content.Index',
		'NextThought.app.slidedeck.media.components.View'
	],

	title: 'Lessons',
	layout: 'card',


	items: [
		{xtype: 'course-overview-view'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/:lesson/content/:id', this.showContent.bind(this));
		this.addRoute('/:lesson/video/:id', this.showMediaViewer.bind(this));

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
		var lessons = this.getLessons();

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

		return lessons.handleRoute(route.path, route.precache);
	},


	showContent: function(route, subRoute) {
		var me = this,
			contentPath,
			rootId = route.params.id,
			lessonId = route.params.lesson,
			lesson = route.precache.lesson;

		lessonId = ParseUtils.decodeFromURI(lessonId);
		rootId = ParseUtils.decodeFromURI(rootId);

		if (me.reader) {
			if (me.reader.root === rootId) {
				return Promise.resolve();
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
					xtype: 'course-content',
					currentBundle: me.currentBundle,
					handleNavigation: me.handleNavigation.bind(me),
					navigateToObject: me.navigateToObject.bind(me),
					root: rootId,
					rootRoute: route.precache.parent.route + '/content/'
				});

				me.getLayout().setActiveItem(me.reader);

				return me.reader.handleRoute(route.params.id, route.precache);
			});
	},


	showMediaViewer: function(route, subRoute) {
		var videoId = route.params.id,
			video = route.precache.video,
			basePath = route.precache.basePath,
			rec = route.precache.rec,
			options = route.precache.options,
			transcript, me = this;

		videoId = ParseUtils.decodeFromURI(videoId);

		if (video && video.isModel) {
			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
		}
		else{
			this.LibraryActions.getVideoIndex(me.currentBundle)
				.then(function(videoIndex) {
					var o = videoIndex[videoId];
					if (!o) { return; }

					basePath = me.currentBundle.getContentRoots()[0];
					video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
					transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
					
					// Create the media viewer
					createMediaPlayer(rec);
				});
			return;
		}

		function createMediaPlayer(record, scrollToId) {
			me.activeMediaPlayer = Ext.widget('media-view', {
				video: video,
				transcript: transcript,
				autoShow: true,
				record: record,
				scrollToId: scrollToId,
				startAtMillis: options && options.startAtMillis,
				currentBundle: me.currentBundle
			});

			me.activeMediaPlayer.fireEvent('suspend-annotation-manager', this);

			me.activeMediaPlayer.on('destroy', function() {
				if (me.activeMediaPlayer) {
					me.activeMediaPlayer.fireEvent('resume-annotation-manager', this);
					me.activeMediaPlayer = null;
				}

				if (options && options.closeCallback) {
					options.closeCallback.call();
				}
			});
			// me.activeMediaPlayer.on('media-viewer-ready', function(viewer) {
			// 	var fn = options && options.callback,
			// 		scope = this;
			// 	if (Ext.isObject(fn)) {
			// 		fn = fn.fn;
			// 		scope = fn.scope;
			// 	}

			// 	Ext.callback(fn, scope, [viewer]);
			// });
		}

		if (!rec || rec.isTopLevel()) {
			createMediaPlayer(rec);
			return;
		}

		//Otherwise, will need to load the parent record before we can navigate to it.
		// this.navigateToReply(rec, createMediaPlayer, me);
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
		}
	},


	handleNavigation: function(title, route, precache) {
		this.pushRoute(title, route, precache);
	}
});
