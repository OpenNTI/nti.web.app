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
		{ cls: 'name', html: '{name:htmlEncode}'},
		{ cls: 'status-container'}
	]),


	scoreTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ tag: 'span', cls: 'completed c{submittedCount}', html: '{submittedCount}'},
		' / {enrolledCount}'
	])),


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			submittedCount: this.assignment.get('SubmittedCount') || 0,
			enrolledCount: this.item.get('enrolledCount'),
			hasReports: this.item.get('reportLinks') && this.item.get('reportLinks').length && isFeature('analytic-reports'),
			canEdit: this.item.get('canEdit'),
			name: this.assignment.get('title')
		});
	},


	addClasses: function () {
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
		this.assignment.on('update', () => this.updateItem());
	},


	updateItem () {
		if(!this.rendered) {
			return;
		}

		const submittedCount = this.assignment.get('SubmittedCount') || 0;
		const enrolledCount = this.item.get('enrolledCount');
		const scoreEl = this.el.down('.score');
		const nameEl = this.el.down('.name');

		if (scoreEl) {
			scoreEl.setHTML('');
			this.scoreTpl.append(scoreEl, {submittedCount, enrolledCount});
		}
		if (nameEl) {
			nameEl.update(this.assignment.get('title'));
		}

		this.removeCls(['closed', 'completed', 'nosubmit', 'late', 'editable']);
		this.addClasses();
	},


	onItemClick: function (e) {
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
