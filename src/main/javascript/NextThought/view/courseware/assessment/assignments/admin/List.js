Ext.define('NextThought.view.courseware.assessment.assignments.admin.List', {
	extend: 'NextThought.view.courseware.assessment.assignments.List',
	alias: 'widget.course-assessment-assignment-admin-list',
	cls: 'assignment-list admin',

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
							{ cls: 'name', html: '{name:htmlEncode}'},
							{ cls: 'status', cn: [
								{ tag: 'time', cls: 'due', datetime: '{due:date("c")}', html: '{[this.getDueDate(values)]}'}
							]}
						]}
					]}), {
				//template functions

				getStatusCls: function(values) {
					var date = (values && values.due) || new Date(0),
						opens = (values.opens || new Date((new Date()).setHours(0, 0, 0, 0))).getTime(),
						due = (new Date(date.getTime())).setHours(0, 0, 0, 0),
						today = (new Date()).setHours(0, 0, 0, 0),
						cls = opens > today ? 'closed ' : '';

					return cls + (((values && values.due) && due < today) ? 'late' : '');
				},

				getDueDate: function(values) {
					return this.ownerCmp.getDueDate(values);
				}
			})

});
