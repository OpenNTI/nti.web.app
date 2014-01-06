Ext.define('NextThought.view.courseware.info.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-info',

	requires: [
		'NextThought.view.courseware.info.outline.View',
		'NextThought.view.courseware.info.Panel'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},


	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-panel'},


	afterRender: function() {
		this.callParent(arguments);
		//we set this up to listen to a node that will not scroll...
		// so that when this view is activated it will reset the view.
		Ext.defer(this.initCustomScrollOn, 5, this,['content', '.course-info-panel']);
	},


	courseChanged: function(courseInstance) {
		var me = this,
			catalogEntry = courseInstance && courseInstance.getCourseCatalogEntry();

		function update(info) {
			me.hasInfo = !!info;

			me[me.infoOnly?'addCls':'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly? '105':'0')+' 5 5 0';

			me.body.setContent(info);
			me.navigation.setContent(info);
		}



		delete me.infoOnly;

		this.hasInfo = !!catalogEntry;
		this.infoOnly = catalogEntry && catalogEntry.get('Preview') === true;

		update(catalogEntry);
	},


	getScrollTop: function() {
		return this.infoOnly ? 0 : this.mixins.customScroll.getScrollTop.call(this);
	}

});
