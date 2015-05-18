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


	onActivate: function() {
		var item = this.getLayout().getActiveItem();

		this.setTitle(this.title);
		if (item.onActivate) {
			item.onActivate();
		}
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

		return lessons.handleRoute(route.path, route.precache);
	},


	showContent: function(route, subRoute) {
		var me = this,
			contentPath,
			lessonId = route.params.lesson,
			lesson = route.precache.lesson;

		lessonId = ParseUtils.decodeFromURI(lessonId);

		contentPath = Globals.trimRoute(route.path).split('/').slice(2).join('/');

		return me.store.onceBuilt()
			.then(function() {
				var siblings;

				if (lessonId && (!lesson || lesson.getId() !== lessonId)) {
					lesson = me.store.findRecord('NTIID', lessonId, false, true, true);
				}

				siblings = me.store.getRange().reduce(function(c, item) {
					if (item.get('type') === 'lesson') {
						c.push({
							ntiid: item.get('NTIID'),
							label: item.get('label'),
							cls: item === lesson ? 'current' : ''
						});
					}

					return c;
				}, []);

				route.precache.parent = {
					label: lesson.get('label'),
					ntiid: lesson.get('NTIID'),
					siblings: siblings
				};

				if (me.reader) {
					me.reader.destroy();
				}

				me.reader = me.add({
					xtype: 'course-content',
					currentBundle: me.currentBundle
				});

				me.reader.handleRoute(contentPath, route.precache);

				me.getLayout().setActiveItem(me.reader);
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
	}
});
