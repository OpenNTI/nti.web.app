Ext.define('NextThought.app.course.overview.components.View', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-overview-view',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.Outline',
		'NextThought.app.course.overview.components.Body',
		'NextThought.app.course.overview.components.editing.Window',
		'NextThought.app.windows.Actions'
	],

	cls: 'course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-outline'},
	body: {xtype: 'course-overview-body'},


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.initRouter();

		this.body.onEditLesson = this.onEditLesson.bind(this);
		this.navigation.onEditOutline = this.onEditOutline.bind(this);

		this.addChildRouter(this.body);

		this.addRoute('/edit', this.showOutlineEditor.bind(this));
		this.addRoute('/:lesson', this.showLesson.bind(this));
		this.addRoute('/:lesson/edit', this.showLessonEditor.bind(this));

		this.addDefaultRoute(this.showLesson.bind(this));

		me.mon(me.navigation, {
			'empty-outline': function() {
				me.unmask();
			},
			'select-lesson': function(record) {
				var id = ParseUtils.encodeForURI(record.getId());

				me.pushRoute(record.get('label'), id, {lesson: record});
			}
		});
	},


	onRouteActivate: function() {
		this.outline = this.currentBundle.getOutlineInterface();

		this.outline.onceBuilt()
			.then(function(outline) {
				return outline.getOutline();
			})
			.then(this.navigation.setOutline.bind(this.navigation, this.currentBundle));

		this.alignNavigation();
	},


	onRouteDeactivate: function() {},


	getActiveLesson: function() {
		return this.activeLesson;
	},


	onEditLesson: function(id) {
		id = ParseUtils.encodeForURI(id);

		this.pushRoute('Editing', id + '/edit');
	},


	onEditOutline: function() {
		this.pushRoute('Editing', 'edit');
	},


	bundleChanged: function(bundle) {
		if (this.currentBundle === bundle) { return; }

		this.clear();
		this.currentBundle = bundle;

		if (!bundle || !bundle.getOutlineInterface) {
			delete this.currentBundle;
			return;
		}

		this.outline = bundle.getOutlineInterface();

		this.outline.onceBuilt()
			.then(function(outline) {
				return outline.getOutline();
			})
			.then(this.navigation.setOutline.bind(this.navigation, bundle));

		this.body.setActiveBundle(bundle);
	},


	clear: function() {
		var me = this;

		me.mon(me.body, {
			single: true,
			buffer: 1,
			add: me.unmask.bind(me)
		});

		wait()
			.then(function() {
				if (me.el && me.el.dom) {
					me.el.mask('NextThought.view.courseware.View.loading', 'loading');
				}
			});

		me.navigation.clearCollection();
		me.body.clear();
	},


	unmask: function() {
		if (this.el) {
			this.el.unmask();
		}
	},


	getActiveItem: function() {
		return this.navigation.getActiveItem();
	},


	__getRecord: function(id, record) {
		var me = this, rIndex;

		return me.outline.onceBuilt()
			.then(function(outline) {
				if (id && (!record || record.getId() !== id)) {
					record = outline.getNode(id);
				} else if (record) {
					record = outline.fillInNode(record);
				} else {
					record = outline.findNodeBy(function(rec) {
						return rec.get('type') === 'lesson' && rec.get('NTIID') && rec.get('isAvailable');
					});
				}

				return record;
			});
	},


	showLesson: function(route, subRoute) {
		var me = this,
			id = route.params && route.params.lesson && ParseUtils.decodeFromURI(route.params.lesson),
			record = route.precache.lesson;

		return this.__getRecord(id, record)
			.then(function(record) {
				if (!record) {
					console.error('No valid lesson to show');
					return;
				}

				record = me.navigation.selectRecord(record);
				me.unmask();
				me.setTitle(record.get('label'));
				me.activeLesson = record;

				return me.body.showLesson(record)
					.then(me.alignNavigation.bind(me))
					.then(function() {
						return record;
					});
			});
	},


	showOutlineEditor: function(route, subRoute) {
		var me = this,
			outline = me.currentBundle.getOutlineInterface();

		me.setTitle('Editing');

		return me.showLesson(route, subRoute)
			.then(outline.onceBuilt.bind(outline))
			.then(function(outline) {
				return outline.getOutline();
			})
			.then(function(outline) {
				me.navigation.clearCollection();
				me.navigation.setOutline(me.currentBundle, outline);

				me.WindowActions.showWindow('outline-editing', null, null,
				{
					doClose: function() {
						me.pushRoute('', '/');
					}
				},
				{
					outline: outline
				});
			});
	},


	showLessonEditor: function(route, subRoute) {
		var me = this;

		return me.showLesson(route, subRoute)
			.then(function(record) {

				me.setTitle('Editing');

				if (!record) {
					return Promise.reject('Unable to find lesson');
				}

				me.WindowActions.showWindow('lesson-editing', null, null,
				{
					doClose: function() {
						var id = record.getId();

						id = ParseUtils.encodeForURI(id);

						me.pushRoute('', id);
					}
				},
				{
					lesson: record
				});
			});
	}
});
