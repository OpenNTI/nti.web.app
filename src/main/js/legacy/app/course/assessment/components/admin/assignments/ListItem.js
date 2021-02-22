const Ext = require('@nti/extjs');
const { Viewer } = require('@nti/web-reports');

const { isFeature } = require('legacy/util/Globals');

require('../../student/assignments/ListItem');

const AorB = (a, b) => (typeof a === 'number' ? a : b);

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.admin.assignments.ListItem',
	{
		extend:
			'NextThought.app.course.assessment.components.student.assignments.ListItem',
		alias: 'widget.course-assessment-assignment-admin-list-item',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'score',
				cn: [
					{
						tag: 'span',
						cls: 'completed c{submittedCount}',
						html: '{submittedCount}',
					},
					' / {totalPossibleSubmissions}',
				],
			},
			{
				tag: 'tpl',
				if: 'canEdit',
				cn: [{ cls: 'edit-assignment', html: 'Edit' }],
			},
			{
				tag: 'tpl',
				if: 'hasReports',
				cn: [
					{
						cls: 'report',
						'data-qtip':
							'{{{NextThought.view.forums.forum.parts.TopicListView.reports}}}',
					},
				],
			},
			{
				cls: 'name-container',
				cn: [{ tag: 'span', cls: 'name', html: '{name:htmlEncode}' }],
			},
			{ cls: 'status-container' },
		]),

		scoreTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					tag: 'span',
					cls: 'completed c{submittedCount}',
					html: '{submittedCount}',
				},
				' / {totalPossibleSubmissions}',
			])
		),

		beforeRender() {
			this.callParent(arguments);

			const { assignment, item } = this;

			const totalPossibleSubmissions = AorB(
				assignment.get('SubmittedCountTotalPossible'),
				item.get('enrolledCount')
			);
			const totalSubmissions = AorB(
				assignment.get('UserCompletionCount'),
				item.get('SubmittedCount')
			);

			this.renderData = Ext.apply(this.renderData || {}, {
				submittedCount: totalSubmissions || 0,
				totalPossibleSubmissions,
				hasReports:
					item.get('reportLinks') &&
					item.get('reportLinks').length &&
					isFeature('analytic-reports'),
				canEdit: item.get('canEdit'),
				name: assignment.get('title'),
			});
		},

		addClasses() {
			var now = new Date(),
				due = this.assignment.getDueDate() || new Date(),
				isNoSubmit = this.assignment.isNoSubmit(),
				cls = [];

			if (!this.assignment.isOpen()) {
				cls.push('closed');
			}

			if (isNoSubmit) {
				cls.push('nosubmit');
			} else if (due && due < now) {
				cls.push('late');
			}

			if (this.assignment.canEdit()) {
				cls.push('editable');
			}

			this.addCls(cls);
		},

		afterRender() {
			this.callParent(arguments);
		},

		updateItem() {
			if (!this.rendered) {
				return;
			}

			const { assignment, item } = this;

			const totalPossibleSubmissions = AorB(
				assignment.get('SubmittedCountTotalPossible'),
				item.get('enrolledCount')
			);
			const submittedCount = assignment.get('SubmittedCount') || 0;

			const scoreEl = this.el.down('.score');
			const nameEl = this.el.down('.name');
			const pointsEl = this.el.down('.name-container .points');

			if (scoreEl) {
				scoreEl.setHTML('');
				this.scoreTpl.append(scoreEl, {
					submittedCount,
					totalPossibleSubmissions,
				});
			}

			if (nameEl) {
				nameEl.update(this.assignment.get('title'));
			}

			if (pointsEl) {
				pointsEl.update(this.assignment.getTotalPointsLabel());
			}

			this.removeCls([
				'closed',
				'completed',
				'nosubmit',
				'late',
				'editable',
			]);
			this.addClasses();
		},

		onItemClick(e) {
			var link = e.getTarget('.report');

			if (link) {
				e.stopEvent();

				this.assignment.getInterfaceInstance().then(assignment => {
					Viewer.show(assignment.Reports[0]);
				});

				return false;
			}

			this.callParent(arguments);
		},
	}
);
