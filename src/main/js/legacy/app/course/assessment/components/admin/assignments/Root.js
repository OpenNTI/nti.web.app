const Ext = require('@nti/extjs');

require('legacy/common/ux/Grouping');

require('../../student/assignments/View');
require('./List');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.assignments.Root', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',
	cls: 'assignment-list admin',

	newAssignmentList: function (grouper) {
		return {
			xtype: 'course-assessment-assignment-admin-list',
			store: grouper.store,
			navigateToItem: this.navigateToItem.bind(this),
			editAssignment: this.editAssignment.bind(this)
		};
	},

	navigateToItem: function (rec) {
		if (!rec) {
			console.error('Ignoring click because no record was passed', arguments);
			return;
		}

		//This is the admin view... we will let the instructors view them no matter what. (so we will ignore the closed state)
		this.goToRecord(rec);
	},

	applyPagerFilter: function () {
		this.store.filter({
			id: 'open',
			filterFn: function (rec) {
				return rec.get('total') > 0;
			}
		});
	},

	goToRecord: function (assignment) {
		if (assignment) {
			this.showStudentsForAssignment(assignment);
		}
	}
});
