Ext.define('NextThought.view.courseware.assessment.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.Header',
	alias: 'widget.course-assessment-reader-header',

	cls: 'student-reader-header reader-header',

	requires: [
		'NextThought.view.courseware.assessment.AssignmentStatus'
	],


	headerTpl: Ext.DomHelper.markup([
		{ cls: 'quiz-container ontime', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'turned-in'}
		]},
		{ cls: 'grade-container', cn: [
			{ cls: 'title', html: '{{{NextThought.view.courseware.assessment.reader.Header.grade}}}' },
			{ cls: 'grade'}
		]}
	]),

	renderSelectors: {
		'ontimeIconEl': '.quiz-container .ontime-icon',
		'turnedInEl': '.quiz-container .turned-in',
		'gradeContainerEl': '.grade-container',
		'gradeEl': '.grade-container .grade'
	},


	beforeRender: function() {
		this.callParent(arguments);

		if (this.assignmentHistory) {
			this.renderData = Ext.apply(this.renderData || {}, {
				title: this.assignmentHistory.get('name')
			});
		}
	},


	onPathClick: function() {
		if (this.tabMenu) {
			this.tabMenu.stopHide();
			this.tabMenu.stopShow();
		}

		this.callParent(arguments);
	},

	onPartHover: function(e, part) {
		if (!e.getTarget('.has-alt-tabbar')) { return; }
		var scrollEl = this.up('[getMainTabbarMenu]');

		this.tabMenu = scrollEl.getMainTabbarMenu();
		this.tabMenu.startShow(part, 'tl-bl', [-10, 5]);

		this.on('destroy', 'destroy', this.tabMenu);
	},


	setHistory: function(history) {
		var grade = history && history.get('Grade'),
			due = this.assignmentHistory && this.assignmentHistory.get('due'),
			submission = history && history.get('Submission'),
			parts = this.assignment.get('parts'),
			hasParts = parts && parts.length > 0,
			completed = submission && submission.get('CreatedTime'),
			overdue;

		if (((!history || !submission) && hasParts) || (this.assignment.isTimed && !this.assignment.isStarted())) {
			this.removeCls('submitted');
			this.updateLayout();
			return;
		}

		this.addCls('submitted');

		if (!this.rendered) { return; }

		this.turnedInEl.update(NextThought.view.courseware.assessment.AssignmentStatus.getStatusHTML({
			due: this.assignment.getDueDate(),
			maxTime: this.assignment.isTimed && this.assignment.getMaxTime(),
			duration: this.assignment.isTimed && this.assignment.getDuration(),
			completed: completed,
            isExcused: grade && grade.get("IsExcused")
		}));

		//we don't want to show the remaining time if we have a submission
		this.showRemainingTime = function() {};

		if (this.timer) {
			this.timer.stop();
		}

		if (this.hideTimer) {
			this.hideTimer();
		}

		grade = grade && grade.getValues();

		if (grade) {
			this.gradeEl.update(grade.value);
			this.gradeContainerEl.show();
		} else {
			this.gradeContainerEl.hide();
		}

		this.updateLayout();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.setHistory(this.assignmentHistory);

		this.fireEvent('has-been-submitted', this);
	},


	goTo: function(rec) {
		var v = this.parentView;
		Ext.defer(v.showAssignment, 1, v, [rec]);
	}
});
