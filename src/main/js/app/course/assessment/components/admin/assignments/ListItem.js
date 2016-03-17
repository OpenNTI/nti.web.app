export default Ext.define('NextThought.app.course.assessment.components.admin.assignments.ListItem', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.ListItem',
	alias: 'widget.course-assessment-assignment-admin-list-item',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'score', cn: [
			{ tag: 'span', cls: 'completed c{submittedCount}', html: '{submittedCount}'},
			' / {enrolledCount}'
		]},
		{ tag: 'tpl', 'if': 'hasReports', cn: [
			{ cls: 'report'}
		]},
		{ cls: 'name', html: '{name:htmlEncode}'},
		{ cls: 'status-container'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			submittedCount: this.item.get('submittedCount'),
			enrolledCount: this.item.get('enrolledCount'),
			hasReports: this.item.get('reportLinks') && this.item.get('reportLinks').length && isFeature('analytic-reports')
		});
	},


	addClasses: function() {
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

		this.addCls(cls);
	},


	onItemClick: function(e) {
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
