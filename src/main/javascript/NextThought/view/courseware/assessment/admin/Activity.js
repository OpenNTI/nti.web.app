Ext.define('NextThought.view.courseware.assessment.admin.Activity', {
	extend: 'NextThought.view.courseware.assessment.Activity',
	alias: 'widget.course-assessment-admin-activity',
	view: 'admin',


	goToAssignment: function(s, record) {
		this.fireEvent('goto-assignment', record.get('item'), null);//get from record
	}
});
