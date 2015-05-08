Ext.define('NextThought.app.course.overview.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-overview',

	requires: [
		'NextThought.app.course.overview.components.Outline',
		'NextThought.app.course.overview.components.Body'
	],

	title: 'Lessons',

	cls: 'course-overview',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-outline'},
	body: {xtype: 'course-overview-body'},


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.on('activate', me.onActivate.bind(me));

		me.mon(me.navigation, {
			'empty-outline': function() {
				me.unmask();
			},
			'select-lesson': function(record) {
				me.unmask();
				me.body.showLesson(record)
					.then(me.alignNavigation.bind(me));
			}
		});
	},


	onActivate: function() {
		this.setTitle(this.title);
		this.alignNavigation();
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
	}
});
