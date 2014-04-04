Ext.define('NextThought.view.courseware.assessment.assignments.admin.List', {
	extend: 'NextThought.view.courseware.assessment.assignments.List',
	alias: 'widget.course-assessment-assignment-admin-list',
	cls: 'assignment-list admin',

	requires: [
		'NextThought.view.menus.Reports'
	],

	view: 'admin',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: 'Completion'},
		{ cls: 'list'}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
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
							{ cls: 'status', cn: [
								{ tag: 'time', cls: 'due', datetime: '{due:date("c")}', html: '{[this.getDueDate(values)]}'}
							]}
						]}
					]}), {
				//template functions

				getStatusCls: function(values) {
					var now = new Date().getTime(),
						due = ((values && values.due) || new Date(now)).getTime(),//if no due date give, use now
						opens = (values.opens || new Date(0)).getTime(),//if no open date given, use epoc

						cls = opens > now ? 'closed ' : '',

						item = values.item,
						parts = (item && item.get && item.get('parts')) || [],
						kind = parts.length > 0 ? '' : 'no_submit ';

					return kind + cls + (((values && values.due) && due < now) ? 'late' : '');
				},

				getDueDate: function(values) {
					return this.ownerCmp.getDueDate(values);
				},

				hasReportLink: function(values) {
					return values.reportLinks && values.reportLinks.length && isFeature('analytic-reports') && false;
				}
			}),

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
