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

		var me = this;

		me.initCustomScrollOn('content', '.course-overview', {secondaryViewEl: '.nav-outline'});

		me.mon(me.navigation, 'empty-outline', function() {
			console.error('Empty course outline. Course Is not usable.');
			me.unmask();

			/*me.outlineError = Ext.DomHelper.append('course-nav', {
				cls: 'x-mask opaque', cn: {
					cls: 'empty-state', cn: [
						{ tag: 'h1', html: 'Content Error.'},
						{ html: 'The course outline is empty.'}
					] }
			});*/
		});
	},


	clear: function() {
		var me = this;
		me.mon(me.body, {
			single: true,
			buffer: 1,
			add: 'unmask'
		});

		if (me.outlineError) {
			Ext.fly(me.outlineError).remove();
			delete me.outlineError;
		}

		Ext.defer(function() {
			if (me.el && me.el.dom) {
				me.el.mask(getString('NextThought.view.courseware.View.loading'), 'loading');
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


	bundleChanged: function(courseInstance) {
		if (this.currentCourse === courseInstance) {
			return;
		}

		this.clear();
		this.currentCourse = courseInstance;

		if (!courseInstance || !courseInstance.getNavigationStore) {
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
