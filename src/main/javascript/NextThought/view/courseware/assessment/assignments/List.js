Ext.define('NextThought.view.courseware.assessment.assignments.List', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-assignment-list',
	ui: 'course-assessment',
	cls: 'assignment-list',

	overItemCls: 'over',
	selectedItemCls: 'selected',
	itemSelector: '.item',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item {[this.getStatusCls(values)]}', cn: [
							{ cls: 'score', cn: [
								{ tag: 'span', cls: '{[this.getCorrectCls(values)]}', html: '{correct}'},
								' / {total}'
							]},
							{ cls: 'name', html: '{name:htmlEncode}'},
							{ cls: 'status {[this.isOverDue(values)]}', cn: [
								{ tag: 'time', cls: 'due', datetime: '{due:date("c")}', html: 'Due {[this.getDueDate(values.due)]}'},
								{ tag: 'time', cls: 'completed', datetime: '{completed:date("c")}', html: 'Completed {completed:date("n/j")}'}
							]}
						]}
					]}), {
				//template functions

				getCorrectCls: function(values) {
					return values.correct ? 'correct' : '';
				},

				getStatusCls: function(values) {
					return this.isTaken(values) ? 'completed' : '';
				},

				isTaken: function(values) {
					return values.completed && values.completed.getTime() > 0;
				},

				isOverDue: function(values) {
					var due = values.due && (new Date(values.due.getTime())).setHours(0, 0, 0, 0),
						today = (new Date()).setHours(0, 0, 0, 0);
					return (!this.isTaken(values) && today >= due) ? 'due' : '';
				},

				getDueDate: function(date) {
					if (!date) { return ''; }

					var format = 'l, F j',
						day = (new Date(date.getTime())).setHours(0, 0, 0, 0),
						today = (new Date()).setHours(0, 0, 0, 0);
					if (day === today) {
						return 'Today';
					}
					return Ext.Date.format(date, format);
				}
			}),


	clear: function() {
		this.store.removeAll();
	},


	constructor: function(config) {
		if (config && !config.store) {
			config.store = new Ext.data.Store({
				fields: [
					{name: 'id', type: 'int'},
					{name: 'name', type: 'string'},
					{name: 'due', type: 'date'},
					{name: 'completed', type: 'date'},
					{name: 'correct', type: 'int'},
					{name: 'total', type: 'int'}
				],
				data: [
					{id: 1, name: 'Example', due: new Date(), completed: new Date(), correct: 1, total: 2}
				]
			});
		}
		this.callParent(arguments);
	},


	initComponent: function() {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;
	}
});
