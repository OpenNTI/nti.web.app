Ext.define('NextThought.app.contentviewer.navigation.assignment.Student', {
	extend: 'NextThought.app.contentviewer.navigation.Base',
	alias: 'widget.assignment-header',

	cls: 'student-reader-header reader-header course-assessment-header assignment-item',

	toolbarTpl: Ext.DomHelper.markup([
		'{super}',
		{
			cls: 'time-remaining hidden',
			cn: [
				{cls: 'time', cn: [
					{cls: 'loading-bar'},
					{cls: 'meta', cn: [
						{tag: 'span', cls: 'label', html: 'Time Expired'},
						{tag: 'span', cls: 'time-left'}
					]}
				]},
				{cls: 'help', html: 'Report a Problem'},
				{cls: 'submit', cn: [
					{cls: 'unanswered'},
					{cls: 'submit-btn', html: 'I\'m Finished!'}
				]}
			]
		}
	]),

	headerTpl: Ext.DomHelper.markup([
		{cls: 'quiz-container ontime', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'turned-in'}
		]},
		{cls: 'grade-container', cn: [
			{cls: 'title', html: '{{NextThought.view.courseware.assessment.reader.Header.grade}}}'},
			{cls: 'grade'}
		]}
	]),


	renderSelectors: {
		ontimeIconEl: '.quiz-container .ontime-icon',
		turnedInEl: '.quiz-container .turned-in',
		gradeContainerEl: '.grade-container',
		gradeEl: '.grade-container .grade',
		timeContainerEl: '.time-remaining',
		loadingBarEl: '.time-remaining .time .loading-bar',
		timeLabelEl: '.time-remaining .time .meta span.label',
		timeMetaEl: '.time-remaining .time .meta',
		timeEl: '.time-remaining .time .meta span.time-left',
		helpEl: '.time-remaining .help',
		submitEl: '.time-remaining .submit',
		unansweredEl: '.time-remaining .submit .unanswered',
		submitBtnEl: '.time-remaining .submit .submit-btn'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var rd = {};

		if (this.assignmentHistory) {
			rd.title = this.assignment.get('title');

			if (this.assignmentHistory instanceof Promise) {
				this.assignmentHistory.then(this.setHistory.bind(this));
			} else {
				this.setHistory(this.assignmentHistory);
			}
		} else {
			this.setHistory(this.assignmentHistory);
		}

		this.renderData = Ext.apply(this.renderData || {}, rd);
	},


	setHistory: function(history) {
		if (!this.rendered) {
			this.on('afterrender', this.setHistory.bind(this.history));
			return;
		}

		var grade = history && history.get('Grade'),
			due = this.assignment && this.assignment.getDueDate(),
			submission = history && history.get('Submission'),
			parts = this.assignment.get('parts'),
			hasParts = parts && parts.length > 0,
			completed = submission && submission.get('CreatedTime'),
			overdue, isNoSubmit = this.assignment.isNoSubmit();

		if (((!history || !submission) && hasParts) || (this.assignment.isTimed && !this.assignment.isStarted())) {
			this.removeCls('submitted');
			this.updateLayout();
			return;
		}

		if (isNoSubmit === true) {
			this.addCls('nosubmit');
		}

		if (!this.rendered) { return; }

		this.turnedInEl.update(NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
			due: this.assignment.getDueDate(),
			maxTime: this.assignment.isTimed && this.assignment.getMaxTime(),
			duration: this.assignment.isTimed && this.assignment.getDuration(),
			isNoSubmitAssignment: this.assignment.isNoSubmit(),
			completed: completed,
			isExcused: grade && grade.get('IsExcused')
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
	}
});
