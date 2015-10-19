Ext.define('NextThought.app.course.assessment.components.admin.assignments.List', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.List',
	alias: 'widget.course-assessment-assignment-admin-list',

	cls: 'assignment-list admin',

	requires: [
		'NextThought.common.menus.Reports',
		'NextThought.app.course.assessment.AssignmentStatus'
	],

	view: 'admin',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: 'Completion'},
		{cls: 'list'}
	]),


	renderSelectors: {
		titleEl: '.header', 
		frameBodyEl: '.list'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	tpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{ tag: 'tpl', 'for': '.', cn: [
			{ cls: 'item {[this.getStatusCls(values)]}', cn: [
				{ cls: 'score', cn: [
					{ tag: 'span', cls: 'completed c{submittedCount}', html: '{submittedCount}'},
					' / {enrolledCount}'
				]},
				{ tag: 'tpl', 'if': 'this.hasReportLink(values)', cn: [
					{ cls: 'report'}
				]},
				{ cls: 'name', html: '{name:htmlEncode}'},
				'{[this.getStatusHTML(values)]}'
			]}
		]}),
		{
			//template functions
			getStatusHTML: function(values) {
				return NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
					due: values.due,
					maxTime: values.maxTime,
					isNoSubmitAssignment: values.item.isNoSubmit()
				});
			},
			getStatusCls: function(values) {
				var now = new Date().getTime(),
					due = ((values && values.due) || new Date(now)).getTime(),//if no due date give, use now
					opens = (values.opens || new Date(0)).getTime(),//if no open date given, use epoc
					isNoSubmitAssignment = values.item.isNoSubmit(),
					cls = opens > now ? 'closed ' : '';

					if (isNoSubmitAssignment === true) {
						return cls + 'nosubmit';
					}
					else {
						return cls + (((values && values.due) && due < now) ? 'late' : '');
					}
			},

			hasReportLink: function(values) {
				return values.reportLinks && values.reportLinks.length && isFeature('analytic-reports');
			}
		}
	),

	
	onItemClick: function(record, node, index, e) {
		var link = e.getTarget('.report');

		if (link) {
			e.stopEvent();
			Ext.widget('report-menu', {
				links: record.get('reportLinks'),
				showIfOne: true,
				showByEl: link
			});

			return false;
		}
	}
});
