const Ext = require('@nti/extjs');
const {
	format,
	isSameDay,
	isSameMonth,
	isSameYear,
	isBefore,
} = require('date-fns');

const ContentUtils = require('legacy/util/Content');

require('./Item');

module.exports = exports = Ext.define(
	'NextThought.app.course.dashboard.components.tiles.Assignment',
	{
		extend: 'NextThought.app.course.dashboard.components.tiles.Item',
		alias: 'widget.dashboard-assignment',

		cls: 'dashboard-item assignment-tile',

		afterRender: function () {
			this.callParent(arguments);

			this.getHistory().catch(
				this.callWhenRendered.bind(this, 'setLate')
			);
		},

		handleNavigation: function () {
			this.navigateToObject(this.record);
		},

		getPath: function () {
			return ContentUtils.getLineageLabels(
				this.record.get('ContainerId'),
				false,
				this.course
			).then(function (paths) {
				var path = paths[0];

				Ext.clone(path);

				path.shift();

				return ['Assignments', path[0]];
			});
		},

		getTitle: function () {
			return this.record.get('title');
		},

		getBullets: function () {
			var questionCount = this.record.getQuestionCount();

			if (!questionCount) {
				return [];
			}

			return [Ext.util.Format.plural(questionCount, 'Question')];
		},

		getHistory: function () {
			return this.getAssignmentHistory;
		},

		getFooter: function () {
			var due = this.record.getDueDate();

			return this.getHistory()
				.then(function (history) {
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
				.catch(function () {
					var now = new Date();

					if (!due) {
						return '';
					}

					if (
						isSameDay(now, due) &&
						isSameMonth(now, due) &&
						isSameYear(now, due)
					) {
						return 'Due Today';
					}

					return 'Due ' + format(due, 'eeee, MMMM d');
				});
		},

		setLate: function () {
			var due = this.record.getDueDate();

			if (isBefore(new Date(), due)) {
				this.addCls('late');
			}
		},
	}
);
