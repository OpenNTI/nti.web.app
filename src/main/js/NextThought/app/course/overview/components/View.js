Ext.define('NextThought.app.course.overview.components.View', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-overview-view',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.overview.components.Outline',
		'NextThought.app.course.overview.components.Body'
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

		this.initRouter();

		this.body.onEdit = this.onEdit.bind(this);

		this.addChildRouter(this.body);

		this.addRoute('/:lesson', this.showLesson.bind(this));
		this.addRoute('/:lesson/edit', this.showEditor.bind(this));

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
		this.navigation.refresh();
		this.alignNavigation();
	},


	onRouteDeactivate: function() {},


	getActiveLesson: function() {
		return this.activeLesson;
	},


	onEdit: function(id) {
		id = ParseUtils.encodeForURI(id);

		this.pushRoute('', id + '/edit');
	},


	bundleChanged: function(bundle) {
		if (this.currentBundle === bundle) { return; }

		this.clear();
		this.currentBundle = bundle;

		if (!bundle || !bundle.getNavigationStore) {
			delete this.currentBundle;
			return;
		}

		this.store = bundle.getNavigationStore();

		this.navigation.setNavigationStore(bundle, this.store);
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

		me.navigation.clear();
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

		return me.store.onceBuilt()
			.then(function() {
				if (id && (!record || record.getId() !== id)) {
					record = me.store.findRecord('NTIID', id, false, true, true);
				}

				if (!record || record.get('type') !== 'lesson' || !record.get('NTIID')) {
					rIndex = me.store.findBy(function(rec) {
						return rec.get('type') === 'lesson' && rec.get('NTIID') && rec.get('isAvailable');
					});

					if (rIndex > -1) {
						record = me.store.getAt(rIndex);
					}
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
					.then(me.alignNavigation.bind(me));
			});
	},


	showEditor: function(route, subRoute) {
		var me = this,
			id = route.params && route.params.lesson && ParseUtils.decodeFromURI(route.params.lesson),
			record = route.precache.lesson;

		return this.__getRecord(id, record)
			.then(function(record) {
				if (!record) {
					console.error('No valid lesson to edit');
					return;
				}

				record = me.navigation.selectRecord(record);
				me.unmask();
				me.setTitle(record.get('label'));
				me.activeLesson = record;

				return me.body.editLesson(record)
					.then(me.alignNavigation.bind(me));
			});
	}
});
