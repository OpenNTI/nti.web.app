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
		var me = this, recordOrNTIID,
			l = pageInfo.getLocationInfo(),
			toc, course;

		function update(info) {
			me.hasInfo = !!info;

			if (info && !Ext.isString(info)) {
				info.locationInfo = l;
			}

			me[me.infoOnly?'addCls':'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly? '105':'0')+' 5 5 0';

			me.body.setContent(info);
			me.navigation.setContent(info);
		}


		delete me.infoOnly;

		recordOrNTIID = Ext.getStore('courseware.AvailableCourses').findRecord(
					'ContentPackageNTIID', l.ContentNTIID, 0, false, false, true);

		this.hasInfo = !!recordOrNTIID;
		this.infoOnly = recordOrNTIID && recordOrNTIID.get('Preview') === true;

		if (!recordOrNTIID) {
			if (l && l !== ContentUtils.NO_LOCATION) {
				toc = l.toc && l.toc.querySelector('toc');
				course = toc && toc.querySelector('course');
			}
			recordOrNTIID = pageInfo.isPartOfCourse() && course && course.getAttribute('courseInfo');
		}

		update(recordOrNTIID);
	}


});
