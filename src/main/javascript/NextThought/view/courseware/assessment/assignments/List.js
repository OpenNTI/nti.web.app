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
					var due = (new Date(values.due.getTime())).setHours(0, 0, 0, 0),
						today = (new Date()).setHours(0, 0, 0, 0);
					return (!this.isTaken(values) && today >= due) ? 'due' : '';
				},

				getDueDate: function(date) {
					var format = 'l, F j',
						day = (new Date(date.getTime())).setHours(0, 0, 0, 0),
						today = (new Date()).setHours(0, 0, 0, 0);
					if (day === today) {
						return 'Today';
					}
					return Ext.Date.format(date, format);
				}
			}),


	store: new Ext.data.Store({
		fields: [
			{name: 'id', type: 'int'},
			{name: 'name', type: 'string'},
			{name: 'due', type: 'date'},
			{name: 'completed', type: 'date'},
			{name: 'correct', type: 'int'},
			{name: 'total', type: 'int'}
		]
	}),


	clear: function() {
		this.store.removeAll();
	},


	initComponent: function() {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;

		//Simulate async server load & event
		Ext.defer(function() {
			this.store.loadRawData([
				{id: 7, name: 'Quiz 8', due: new Date('2013-12-06T00:00:00-06:00'), completed: new Date('2013-12-05T15:30:00-06:00'), correct: 10, total: 15},
				{id: 6, name: 'Quiz 7', due: new Date('2013-12-04T00:00:00-06:00'), completed: 0, correct: 0, total: 15},
				{id: 5, name: 'Quiz 6', due: new Date('2013-12-05T00:00:00-06:00'), completed: new Date('2013-12-04T19:30:00-06:00'), correct: 90, total: 100},
				{id: 4, name: 'Quiz 5', due: new Date('2013-12-04T00:00:00-06:00'), completed: new Date('2013-12-03T18:30:00-06:00'), correct: 8, total: 10},
				{id: 3, name: 'Quiz 4', due: new Date('2013-12-03T00:00:00-06:00'), completed: new Date('2013-12-02T16:30:00-06:00'), correct: 0, total: 10},
				{id: 2, name: 'Quiz 3', due: new Date('2013-12-02T00:00:00-06:00'), completed: new Date('2013-12-01T12:30:00-06:00'), correct: 43, total: 50},
				{id: 1, name: 'Quiz 2', due: new Date('2013-12-01T00:00:00-06:00'), completed: 0, correct: 0, total: 10},
				{id: 0, name: 'Quiz 1', due: new Date('2013-11-25T00:00:00-06:00'), completed: 0, correct: 0, total: 150}
			]);
		},10, this);
	}
});
