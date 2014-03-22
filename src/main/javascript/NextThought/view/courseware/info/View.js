Ext.define('NextThought.view.courseware.info.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-info',

	requires: [
		'NextThought.view.courseware.info.outline.View',
		'NextThought.view.courseware.info.Panel',
		'NextThought.view.courseware.info.Roster'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},


	navigation: {xtype: 'course-info-outline'},
	body: {
		xtype: 'container',
		layout: {
			type: 'card',
			deferredRender: true
		},
		items: [
			{ xtype: 'course-info-panel', itemId: 'info' },
			{ xtype: 'course-info-roster', itemId: 'roster' }
		]
	},


	afterRender: function() {
		this.callParent(arguments);
		//we set this up to listen to a node that will not scroll...
		// so that when this view is activated it will reset the view.
		Ext.defer(this.initCustomScrollOn, 5, this, ['content', '#' + this.id]);
	},


	courseChanged: function(courseInstance) {
		var me = this,
			catalogEntry = courseInstance && courseInstance.getCourseCatalogEntry();

		function update(info, status, showRoster) {
			me.hasInfo = !!info;

			me[me.infoOnly ? 'addCls' : 'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly ? '105' : '0') + ' 5 5 0';

			me.body.getLayout().setActiveItem('info');//always reset
			me.body.getComponent('info').setContent(info, status);
			me.body.getComponent('roster').setContent(showRoster && courseInstance);
			me.navigation.setContent(info, status, showRoster);
		}



		delete me.infoOnly;

		this.hasInfo = !!catalogEntry;
		this.infoOnly = catalogEntry && catalogEntry.get('Preview') === true;

		if (courseInstance) {
			return courseInstance.getWrapper()
				.done(function(e) {
					update(catalogEntry, e.get('Status'), !!e.isAdministrative);
				})
				.fail(function() {
					//hide tab?
				});
		}

		return Promise.resolve();
	},


	getScrollTop: function() {
		return this.infoOnly ? 0 : this.mixins.customScroll.getScrollTop.call(this);
	}

});
