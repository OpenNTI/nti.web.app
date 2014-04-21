Ext.define('NextThought.view.courseware.reports.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-reports',

	requires: [
		'NextThought.view.courseware.reports.parts.Link',
		'NextThought.view.courseware.reports.parts.Gif',
		'NextThought.view.menus.Reports'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	ids: ['course-report', 'student-report', 'forum-report', 'topic-report', 'assignment-report'],

	configMap: {
		'course-report': {
			xtype: 'course-report-link',
			id: 'course-report',
			title: 'Course Report',
			about: Ext.DomHelper.markup({tag: 'span', cn: [
				'The Course Summary Report includes information about student enrollment, self-assessments, assignments, student activity, and discussions.'
			]}),
			courseNumber: '',
			courseName: ''
		},
		'student-report': {
			xtype: 'course-report-gif',
			id: 'student-report',
			title: 'Student Reports',
			about: Ext.DomHelper.markup({tag: 'span', cn: [
				'The Student Participation Report includes information about a student\'s forum and discussion participation as ' +
				'well as assignments. To view or download reports for individual students visit the ',
				{tag: 'a', cls: 'target', html: 'course roster'}, '.'
			]}),
			src: 'resources/images/elements/report_student.gif'
		},
		'forum-report': {
			xtype: 'course-report-gif',
			id: 'forum-report',
			title: 'Forum Reports',
			about: Ext.DomHelper.markup({tag: 'span', cn: [
				'The Forum Participation Report includes information about weekly forum participation, top commenters, and comment activity per student. ' +
				'You can view and download forum reports from the ',
				{tag: 'a', cls: 'target', html: 'Discussions tab'}, '.'
			]}),
			src: 'resources/images/elements/report_forum.gif'
		},
		'topic-report': {
			xtype: 'course-report-gif',
			id: 'topic-report',
			title: 'Discussion Reports',
			about: Ext.DomHelper.markup({tag: 'span', cn: [
				'The Discussion Participation Report includes information about weekly participation, top commenters, and comment activity per student. ' +
				'These reports can be found alongside each ',
				{tag: 'a', cls: 'target', html: 'discussion'}, '.'
			]}),
			src: 'resources/images/elements/report_discussion.gif'
		},
		'assignment-report': {
			xtype: 'course-report-gif',
			id: 'assignment-report',
			title: 'Assignment Reports',
			about: Ext.DomHelper.markup({tag: 'span', cn: [
				'The Assignment Report includes information about submissions, results, and answers on a particular assignment. ' +
				'You can view and download these reports from the ' +
				{tag: 'a', cls: 'target', html: 'Assignments tab'}, '.'
			]}),
			src: 'resources/images/elements/assignment_report.gif'
		}
	},

	eventsMap: {
		'course-report': 'courseReportClicked',
		'student-report': 'goto-roster',
		'forum-report': 'goto-discussions',
		'topic-report': 'goto-discussions',
		'assignment-report': 'goto-assignment'
	},

	navigation: {xtype: 'course-reports-navigation'},
	body: {
		xtype: 'container',
		cls: 'make-white',
		layout: 'fit'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content');
		this.mon(this.navigation, 'show-view', 'showView');
	},


	clearViews: function() {
		this.body.removeAll(true);
		this.navigation.clear();
	},


	courseChanged: function(course) {
		var me = this,
			entry = course && course.getCourseCatalogEntry();

		me.reportLinks = course && course.getReportLinks();

		if (Ext.isEmpty(me.reportLinks) || !isFeature('analytic-reports')) {
			me.hasLinks = false;
			return;
		}

		if (me.reportLinks.length > 1) {
			console.error('More than one report link on the course, expecting only one...');
		}

		me.courseReport = me.reportLinks[0];

		me.hasLinks = true;

		me.configMap['course-report'].courseNumber = entry.getId();
		me.configMap['course-report'].courseName = entry.get('Title');

		me.ids.forEach(function(id) {
			me.navigation.addItem(me.configMap[id]);
		});

		if (!me.rendered) {
			me.on('afterrender', function() {
				me.navigation.selectItem('course-report');
			});
		} else {
			me.navigation.selectItem('course-report');
		}
	},


	showView: function(id) {
		var item;

		this.body.removeAll(true);
		item = this.body.add(this.configMap[id]);

		this.mon(item, 'show-report', 'showReport');
	},


	showReport: function(id) {
		 var name = this.eventsMap[id];

		if (Ext.isFunction(this[name])) {
			this[name].call(this);
		} else {
			this.fireEvent(name);
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
	}
});
