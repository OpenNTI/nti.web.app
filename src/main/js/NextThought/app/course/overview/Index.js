Ext.define('NextThought.app.course.overview.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.View',
		'NextThought.app.course.content.Index'
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

		this.addDefaultRoute(this.showLessons.bind(this));

		this.addObjectHandler(NextThought.model.PageInfo.mimeType, this.getPageInfoRoute.bind(this));
		this.addObjectHandler(NextThought.model.RelatedWork.mimeType, this.getRelatedWorkRoute.bind(this));

		this.lessons = this.down('course-overview-view');

		this.addChildRouter(this.lessons);

		this.on('activate', this.onActivate.bind(this));
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


	handleNavigation: function(title, route, precache) {
		this.pushRoute(title, route, precache);
	}
});
