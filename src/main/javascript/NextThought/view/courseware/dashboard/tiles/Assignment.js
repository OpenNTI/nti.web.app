Ext.define('NextThought.view.courseware.dashboard.tiles.Assignment', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Item',
	alias: 'widget.dashboard-assignment',

	cls: 'dashboard-item assignment-tile',


	afterRender: function() {
		this.callParent(arguments);

		this.getHistory()
			.fail(this.callWhenRendered.bind(this, 'setLate'));
	},

	getPath: function() {
		return ContentUtils.getLineageLabels(this.record.get('ContainerId'))
			.then(function(path) {
				Ext.clone(path);

				path.shift();

				return [
					'Assignments',
					path[0]
				];
			});
	},


	getTitle: function() {
		return this.record.get('title');
	},


	getBullets: function() {
		var questionCount = this.record.getQuestionCount();

		if (!questionCount) {
			return [];
		}

		return [
			Ext.util.Format.plural(questionCount, 'Question')
		];
	},


	getHistory: function() {
		var rec = this.record;

		return this.getAssignmentHistory
			.then(function(history) {
				var item = history.getItem(rec.getId());

				return item || Promise.reject();
			});
	},


	getFooter: function() {
		var due = this.record.getDueDate();

		due = moment(due);

		return this.getHistory()
			.then(function(history) {
				var submission = history && history.get('Submission'),
					grade = history && history.get('Grade');

				if (grade && !grade.isEmpty()) {
					return 'Graded';
				}

				if (submission) {
					return 'Completed';
				}

				//cause a fail so the next fail handler can return the due date
				return Promise.reject();
			})
			.fail(function() {
				if (due.isSame(new Date(), 'day')) {
					return 'Due Today';
				}

				return 'Due ' + due.format('dddd, MMMM D');
			});
	},


	setLate: function() {
		var	due = this.record.getDueDate();

		due = moment(due);

		if (due.isBefore(new Date())) {
			this.addCls('late');
		}
	}
});
