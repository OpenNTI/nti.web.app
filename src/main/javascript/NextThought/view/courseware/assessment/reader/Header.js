Ext.define('NextThought.view.courseware.assessment.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.Header',
	alias: 'widget.course-assessment-reader-header',

	cls: 'student-reader-header reader-header',


	headerTpl: Ext.DomHelper.markup([
		{ cls: 'quiz-container ontime', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'turned-in', cn: [
				{ tag: 'span', cls: 'date', html: 'completed {completed}' },
				{ tag: 'span', cls: 'late', html: '{late}'}
			]}
		]},
		{ cls: 'grade-container', cn: [
			{ cls: 'title', html: 'assignment grade' },
			{ cls: 'grade'}
		]}
	]),

	renderSelectors: {
		'ontimeIconEl': '.quiz-container .ontime-icon',
		'completedEl': '.quiz-container .turned-in .date',
		'lateEl': '.quiz-container .turned-in .late',
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


	setHistory: function(history) {
		var grade = history && history.get('Grade'),
			due = this.assignmentHistory && this.assignmentHistory.get('due'),
			submission = history && history.get('Submission'),
			completed = submission && submission.get('CreatedTime'),
			overdue;

		if (!history || !history.get('Submission')) {
			this.removeCls('submitted');
			this.updateLayout();
			return;
		}

		this.addCls('submitted');

		if (!this.rendered) { return; }

		if (completed > due) {
			overdue = new Duration((completed - due) / 1000);
			this.lateEl.update(overdue.age().replace('ago', 'late').trim());
			this.removeCls('ontime');
		} else {
			this.lateEl.hide();
			this.addCls('ontime');
		}

		this.completedEl.update('completed ' + Ext.Date.format(completed, 'm/d'));

		grade = grade && grade.get('value');

		if (grade) {
			this.gradeEl.update(grade);
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
	}
});
