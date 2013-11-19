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


	initComponent: function() {
		this.callParent(arguments);
		//we set this up to listen to a node that will not scroll...
		// so that when this view is activated it will reset the view.
		this.initCustomScrollOn('content');
	},


	onCourseChanged: function(pageInfo) {
		var me = this, record,
			l = ContentUtils.getLocation(pageInfo),
			toc, course, info, content, courseInfoNtiid;

		function update(info) {
			me.hasInfo = !!info;

			if (info) {
				info.locationInfo = l;
			}

			me[me.infoOnly?'addCls':'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly? '105':'0')+' 5 5 0';

			me.body.setContent(info);
			me.navigation.setContent(info);
		}


		delete me.infoOnly;

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc && l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}

		record = Ext.getStore('courseware.AvailableCourses').findRecord(
					'ContentPackageNTIID', l.ContentNTIID, 0, false, false, true);

		this.hasInfo = !!record;
		this.infoOnly = !course || !course.querySelector('unit');

		update(record);
	}


});
