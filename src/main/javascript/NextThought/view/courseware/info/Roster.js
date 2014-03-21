Ext.define('NextThought.view.courseware.info.Roster', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-roster',

	ui: 'course-assessment',
	cls: 'course-performance make-white',

	layout: 'anchor',


	items: [
		{
			cls: 'course-performance-header',
			xtype: 'container',
			layout: 'auto',
			items: [
				{ xtype: 'grade-chart' },
				{ xtype: 'box', cls: 'label', html: 'Enrollment Breakdown' }
			]
		}, {
			xtype: 'course-assessment-assignment-group',
			title: 'Roster',
			anchor: '0 -200',
			layout: 'fit',
			cls: 'assignment-group grades scrollable', items: [
				{
					xtype: 'grid',
					scroll: 'vertical',
					columns: [
						{ text: 'Name', dataIndex: 'realname', flex: 1 },
						{ text: 'Username', dataIndex: 'username' },
						{ text: 'Status', dataIndex: 'status' },
						{ text: '', dataIndex: '' }//disclosure column
					]
				}
			]}
	],


	setContent: function(instance) {
		var roster = instance && instance.getLink('CourseEnrollmentRoster');
		console.debug(roster);
	}
});
