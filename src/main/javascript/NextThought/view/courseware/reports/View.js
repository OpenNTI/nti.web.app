Ext.define('NextThought.view.courseware.reports.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-reports',

	requires: [
		'NextThought.view.courseware.reports.parts.ReportCard',
		'NextThought.view.menus.Reports'
	],

	defaults: {
		xtype: 'course-report-card'
	},

	showStudentReports: true,
	showForumReports: true,
	showTopicReports: true,
	showAssignmentReports: true,

	// items: [
	// 	{xtype: 'box', tpl: {html: 'Reports'}}
	// ],


	courseChanged: function(course) {
		this.reportLinks = course && course.getReportLinks();

		if (Ext.isEmpty(this.reportLinks) || !isFeature('analytic-reports')) {
			this.hasLinks = false;
			return;
		}

		this.hasLinks = true;

		if (this.reportLinks.length > 1) {
			console.error('For now we are assuming that the course report is the only link this will need to be fixed if theres going to be more than one');
		}

		this.courseReport = this.reportLinks[0];

		this.add({
			title: 'Course Report',
			description: 'Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long.',
			handleClick: Ext.bind(this.courseReportClicked, this)
		});

		if (this.showStudentReports) {
			this.add({
				title: 'Student Particpation',
				description: 'Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long.',
				handleClick: Ext.bind(this.studentReportClicked, this)
			});
		}

		if (this.showForumReports) {
			this.add({
				title: 'Forum Report',
				description: 'Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long.',
				handleClick: Ext.bind(this.forumReportClicked, this)
			});
		}

		if (this.showTopicReports) {
			this.add({
				title: 'Topic Report',
				description: 'Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long.',
				handleClick: Ext.bind(this.topicReportClicked, this)
			});
		}

		if (this.showAssignmentReports) {
			this.add({
				title: 'Assignment Report',
				description: 'Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long. Longer description text that is a few sentences long.',
				handleClick: Ext.bind(this.assignmentReportClicked, this)
			});
		}
	},


	courseReportClicked: function() {
		if (!this.courseReport) {
			console.error('No course report to show');
			return;
		}

		Ext.widget('report-menu', {
			links: [this.courseReport],
			showIfOne: true
		});
	},


	forumReportClicked: function() {
		this.fireEvent('goto-discussions');
	},


	topicReportClicked: function() {
		this.fireEvent('goto-discussions');
	},


	studentReportClicked: function() {
		this.fireEvent('goto-roster');
	},


	assignmentReportClicked: function() {
		this.fireEvent('goto-assignment');
	}
});
