Ext.define('NextThought.app.library.courses.components.available.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.courses.StateStore'
	],

	showCourse: function(course) {
		var me = this;

		function addView() {
			me.courseDetail = me.add({
				xtype: 'course-enrollment-details',
				course: course,
				ownerCt: me
			});
		}

		if (!me.courseDetail) {
			addView();
		} else if (me.courseDetail.course !== course) {
			addView();
		} else {
			me.courseDetail.updateEnrollmentCard(true);
		}

		function updateLabel() {
			var activeTab;
			if (me.showAvailable) {
				me.labelEl.addCls('back');
				activeTab = me.tabpanel.getTabForCourse(course);

				me.labelEl.update(activeTab.title + ' Courses');
			} else {
				me.labelEl.update(course.get('Title'));
			}

			me.footerEl.removeCls(['enroll', 'admission']);
		}

		if (!me.rendered) {
			me.on('afterrender', updateLabel);
		} else {
			updateLabel();
		}

		me.mon(me.courseDetail, 'enroll-in-course', 'showEnrollmentOption');

		me.getLayout().setActiveItem(me.courseDetail);
	}

});