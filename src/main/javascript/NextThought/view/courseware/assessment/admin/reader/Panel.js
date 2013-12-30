Ext.define('NextThought.view.courseware.assessment.admin.reader.Panel', {
	extend: 'NextThought.view.reader.Panel',
	alias: 'widget.course-assessment-admin-reader',
	requires: [
		'NextThought.view.courseware.assessment.admin.reader.Header'
	],
	prefix: 'course-assignment',


	getToolbarConfig: function() {
		return {
			xtype: 'course-assessment-admin-reader-header',
			parentView: this.parentView,
			student: this.student,
			page: this.page,
			path: this.path,
			store: this.store,
			total: this.store.getCount(),
			assignmentHistory: this.assignmentHistory
		};
	},


	afterRender: function() {
		this.callParent(arguments);
		this.relayEvents(this.down('course-assessment-admin-reader-header'), ['goup']);
	}
});
