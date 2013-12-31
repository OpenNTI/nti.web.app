Ext.define('NextThought.view.courseware.assessment.admin.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-reader-header',

	cls: 'course-assessment-admin assignment-item reader-header',

	goTo: function(index) {
		var rec = this.store.getAt(index),
			v = this.parentView;
		Ext.defer(v.goToAssignment, 1, v, [null, rec]);
	}
});
