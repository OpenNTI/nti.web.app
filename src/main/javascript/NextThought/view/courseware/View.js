Ext.define('NextThought.view.courseware.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course',
	ui: 'course',
	requires: [
		'NextThought.view.courseware.outline.View',
		'NextThought.view.courseware.overview.View'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	navigation: {xtype: 'course-outline'},
	body: {xtype: 'course-overview', delegate: ['course course-outline']},


	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content', '.course-overview', {secondaryViewEl: '.nav-outline'});
	},


	clear: function() {
		var me = this;
		me.mon(me.body, {
			single: true,
			buffer: 1,
			add: 'unmask'
		});
		Ext.defer(function() {
			if (me.el && me.el.dom) {
				me.el.mask('Loading', 'loading');
			}
		}, 1);
		me.navigation.clear();
		me.body.clear();
	},


	unmask: function() {
		if (this.el) {
			this.el.unmask();
		}
	},


	courseChanged: function(courseInstance) {
		if (this.currentCourse === courseInstance) {
			return;
		}

		this.clear();
		this.currentCourse = courseInstance;

		if (!courseInstance) {
			delete this.currentCourse;
			return;
		}

		this.store = courseInstance.getNavigationStore();

		this.navigation.maybeChangeStoreOrSelection(courseInstance.getId(), this.store);
	},

	restoreState: function(state) {
		var outline = this.down('course-outline');

		if (outline) {
			outline.maybeChangeSelection(state.location);
		}
	}
});
