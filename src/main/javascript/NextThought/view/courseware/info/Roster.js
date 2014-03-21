Ext.define('NextThought.view.courseware.info.Roster', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',


	setContent: function(instance) {
		var roster = instance && instance.getLink('CourseEnrollmentRoster');
		console.debug(roster);
	}
});
