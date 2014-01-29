Ext.define('NextThought.view.courseware.assessment.assignments.List', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-assignment-list',
	ui: 'course-assessment',
	cls: 'assignment-list',

	view: 'student',
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
								{ tag: 'time', cls: 'due', datetime: '{due:date("c")}', html: '{[this.getDueDate(values)]}'},
								{ tag: 'time', cls: 'completed', datetime: '{completed:date("c")}', html: 'Completed {completed:date("n/j")}'}
							]}
						]}
					]}), {
				//template functions

				getCorrectCls: function(values) {
					return values.correct ? 'correct' : '';
				},

				getStatusCls: function(values) {
					return this.isOpen(values) + (this.isTaken(values) ? 'completed' : '') + this.getKind(values);
				},

				getKind: function(values) {
					var item = values.item,
						parts = (item && item.get && item.get('parts')) || [];
					return parts.length > 0 ? '' : ' no_submit ';
				},

				isOpen: function(values) {
					var opens = (values.opens || new Date((new Date()).setHours(0, 0, 0, 0))).getTime(),
						today = (new Date()).setHours(0, 0, 0, 0);
					return opens > today ? 'closed ' : '';
				},

				isTaken: function(values) {
					return values.completed && values.completed.getTime() > 0;
				},

				isOverDue: function(values) {
					var due = values.due && (new Date(values.due.getTime())).setHours(0, 0, 0, 0),
						today = (new Date()).setHours(0, 0, 0, 0);

					return (values.due && !this.isTaken(values) && today >= due) ? 'due' : '';
				},

				getDueDate: function(values) {
					return this.ownerCmp.getDueDate(values);
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
					{name: 'opens', type: 'date'},
					{name: 'completed', type: 'date'},
					{name: 'correct', type: 'int'},
					{name: 'total', type: 'int'},
					{name: 'item', type: 'auto'}
				],
				data: [
					{id: 1, name: 'Example', due: new Date(), completed: new Date(), correct: 1, total: 2}
				]
			});
		}
		this.callParent(arguments);

		this.on('select', function(s, r) {s.deselect(r);});
	},


	initComponent: function() {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;

		this.mon(this.store, 'datachanged', 'maybeHideParent');
	},

	maybeHideParent: function(store) {
		var count = store.getCount();
		this.fireEvent((count > 0) ? 'show-parent' : 'hide-parent');
	},


	getDueDate: function(values) {
		if (!values || !values.due) { return ''; }

		var format = 'l, F j',
			date = values.due,
			opens = values.opens || new Date(0),
			day = (new Date(date.getTime())).setHours(0, 0, 0, 0),
			today = (new Date()).setHours(0, 0, 0, 0),
			html = 'Due ';

		if (opens > today) {
			html = 'Available on ' + Ext.Date.format(opens, format) + ' &middot; ' + html;
		}

		if (day === today) {
			html += 'Today';
		}
		html += Ext.Date.format(date, format);

		return html;
	}
});
