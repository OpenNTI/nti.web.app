const Ext = require('extjs');
const {isFeature} = require('legacy/util/Globals');

require('../../student/assignments/ListItem');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.assignments.ListItem', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.ListItem',
	alias: 'widget.course-assessment-assignment-admin-list-item',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'score', cn: [
			{ tag: 'span', cls: 'completed c{submittedCount}', html: '{submittedCount}'},
			' / {enrolledCount}'
		]},
		{ tag: 'tpl', 'if': 'canEdit', cn: [
			{cls: 'edit-assignment', html: 'Edit'}
		]},
		{ tag: 'tpl', 'if': 'hasReports', cn: [
			{ cls: 'report'}
		]},
		{ cls: 'name-container', cn: [
			{ tag: 'span', cls: 'name', html: '{name:htmlEncode}'},
			{ tag: 'strong', cls: 'points', html: '{points}'}
		]},
		{ cls: 'status-container'}
	]),


	scoreTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ tag: 'span', cls: 'completed c{submittedCount}', html: '{submittedCount}'},
		' / {enrolledCount}'
	])),


	beforeRender () {
		this.callParent(arguments);

		const {assignment, item} = this;

		this.renderData = Ext.apply(this.renderData || {}, {
			submittedCount: assignment.get('SubmittedCount') || 0,
			enrolledCount: item.get('enrolledCount'),
			hasReports: item.get('reportLinks') && item.get('reportLinks').length && isFeature('analytic-reports'),
			canEdit: item.get('canEdit'),
			name: assignment.get('title'),
			points: assignment.getTotalPointsLabel()
		});
	},


	addClasses () {
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


	afterRender () {
		this.callParent(arguments);
	},


	updateItem () {
		if(!this.rendered) {
			return;
		}

		const submittedCount = this.assignment.get('SubmittedCount') || 0;
		const enrolledCount = this.item.get('enrolledCount');
		const scoreEl = this.el.down('.score');
		const nameEl = this.el.down('.name');
		const pointsEl = this.el.down('.name-container .points');

		if (scoreEl) {
			scoreEl.setHTML('');
			this.scoreTpl.append(scoreEl, {submittedCount, enrolledCount});
		}

		if (nameEl) {
			nameEl.update(this.assignment.get('title'));
		}

		if (pointsEl) {
			pointsEl.update(this.assignment.getTotalPointsLabel());
		}

		this.removeCls(['closed', 'completed', 'nosubmit', 'late', 'editable']);
		this.addClasses();
	},


	onItemClick (e) {
		var link = e.getTarget('.report');

		if (link) {
			e.stopEvent();
			Ext.widget('report-menu', {
				links: this.assignment.getReportLinks(),
				showIfOne: true,
				showByEl: link
			});

			return false;
		}

		this.callParent(arguments);
	}
});
