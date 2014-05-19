Ext.define('NextThought.view.courseware.assessment.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.Header',
	alias: 'widget.course-assessment-reader-header',

	cls: 'student-reader-header reader-header',


	headerTpl: Ext.DomHelper.markup([
		{ cls: 'quiz-container ontime', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'turned-in', cn: [
				{ tag: 'span', cls: 'date', html: '{{{NextThought.view.courseware.assessment.reader.Header.completed}}}' },
				{ tag: 'span', cls: 'late', html: '{late}'}
			]}
		]},
		{ cls: 'grade-container', cn: [
			{ cls: 'title', html: '{{{NextThought.view.courseware.assessment.reader.Header.grade}}}' },
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


	onPathClick: function() {
		if (this.upMenu) {
			this.upMenu.stopHide();
			this.upMenu.stopShow();
		}

		this.callParent(arguments);
	},

	onPartHover: function(e, part) {
		if (!e.getTarget('.has-alt-tabbar')) { return; }
		var scrollEl = this.up('[getMainTabbarMenu]');

		this.upMenu = scrollEl.getMainTabbarMenu();
		this.upMenu.startShow(part, 'tl-bl', [-10, 5]);

		this.on('destroy', 'destroy', this.upMenu);
	},


	setHistory: function(history) {
		var grade = history && history.get('Grade'),
			due = this.assignmentHistory && this.assignmentHistory.get('due'),
			submission = history && history.get('Submission'),
			hasParts = this.assignment.get('parts').length > 0,
			completed = submission && submission.get('CreatedTime'),
			overdue;

		if ((!history || !submission) && hasParts) {
			this.removeCls('submitted');
			this.updateLayout();
			return;
		}

		this.addCls('submitted');

		if (!this.rendered) { return; }

		if (!hasParts) {
			if (!submission) {
				this.completedEl.hide();
			}
			this.removeCls('ontime');
			this.lateEl.hide();
		} else if (completed > due) {
			overdue = new Duration((completed - due) / 1000);
			this.lateEl.update(overdue.ago().replace('ago', 'late').trim());
			this.removeCls('ontime');
		} else {
			this.lateEl.hide();
			this.addCls('ontime');
		}

		this.completedEl.update('completed ' + Ext.Date.format(completed, 'm/d'));

		grade = grade && grade.get('value');
		if (grade && grade.split(' ')[1] === '-') {
			grade = grade && grade.split(' ')[0];
		}

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
	},


	goTo: function(rec) {
		var v = this.parentView;
		Ext.defer(v.showAssignment, 1, v, [rec]);
	}
});
