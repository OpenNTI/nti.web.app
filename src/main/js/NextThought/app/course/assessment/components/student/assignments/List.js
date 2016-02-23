Ext.define('NextThought.app.course.assessment.components.student.assignments.List', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignment-list',
	ui: 'course-assessment',
	cls: 'assignment-list',

	requires: ['NextThought.app.course.assessment.components.student.assignments.ListItem'],

	layout: 'none',

	itemType: 'course-assessment-assignment-list-item',

	initComponent: function() {
		this.callParent(arguments);

		var items = this.store ? this.store.getRange() : [],
			itemType = this.itemType,
			navigateToItem = this.navigateToItem,
			container = this.getItemsContainer();

		container.add(items.map(function(item) {
			return {
				xtype: itemType,
				assignment: item.get('item'),
				history: item.get('history'),
				item: item,
				navigateToItem: navigateToItem
			};
		}));
	},


	getItemsContainer: function() {
		return this;
	}
});

/*globals getFormattedString:false*/
Ext.define('aNextThought.app.course.assessment.components.student.assignments.List', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-assignment-listx',
	ui: 'course-assessment',
	cls: 'assignment-list',

	requires: [
		'NextThought.app.course.assessment.AssignmentStatus',
		'NextThought.common.ux.Grouping'
	],

	view: 'student',
	overItemCls: 'over',
	selectedItemCls: 'selected',
	itemSelector: '.item',
	shrinkWrap: false,
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item {[this.getStatusCls(values)]}', cn: [
							/*{ cls: 'score', cn: [
								{ tag: 'span', cls: '{[this.getCorrectCls(values)]}', html: '{correct}'},
								' / {total}'
							]},*/
							{ cls: 'name', html: '{name:htmlEncode}'},
							'{[this.getStatus(values)]}'
						]}
					]}), {
				//template functions
				getStatus: function(values) {
					var grade;

					if (values.history && values.history.isModel) {
						grade = values.history.get('Grade');
					}

					return NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
						due: values.due,
						completed: values.completed,
						maxTime: values.maxTime,
						duration: values.duration,
						isExcused: grade && grade.get('IsExcused'),
						isNoSubmitAssignment: values.item.isNoSubmit()
					});
				},

				getCorrectCls: function(values) {
					return values.correct ? 'correct' : '';
				},

				getStatusCls: function(values) {
					return this.isOpen(values) + (this.isTaken(values) ? 'completed' : '') + this.getKind(values);
				},

				getKind: function(values) {
					return '';
				},

				isOpen: function(v) {
					//0 is always less than current time, if it doesn't have an opens value its always open.
					var opens = (v && v.opens && v.opens.getTime()) || 0;
					return opens > (new Date().getTime()) ? 'closed ' : '';
				},

				isTaken: function(values) {
					return values.completed && values.completed.getTime() > 0;
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


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.el, 'mouseover', 'itemHover');
	},


	maybeHideParent: function(store) {
		var count = store.getCount();
		this.fireEvent((count > 0) ? 'show-parent' : 'hide-parent');
	},


	itemHover: function(e) {
		var node = e.getTarget(this.itemSelector),
			rec = node && this.getRecord(node),
			due = rec && rec.get('due'),
			qtip,
			dueEl = e.getTarget('[data-qtip-fn]');

		if (dueEl && rec) {
			qtip = NextThought.app.course.assessment.AssignmentStatus.getTimeRemaining(due);
			dueEl.setAttribute('data-qtip', qtip);
		}
	},


	getDueDate: function(values) {
		if (!values || !values.due) { return ''; }

		var format = 'l, g:i A, F j',
			date = values.due,
			opens = values.opens || new Date(0),
			day = (new Date(date.getTime())).setHours(0, 0, 0, 0),
			today = (new Date()).setHours(0, 0, 0, 0),
			html = getFormattedString('NextThought.view.courseware.assessment.assignments.List.due', {
				date: Ext.Date.format(date, format)
			});

		if (opens > today) {
			html = getFormattedString('NextThought.view.courseware.assessment.assignments.List.available', {
				date: Ext.data.format(opens, format)
			}) + '&middot;' + html;
		} else if (day === today) {
			html = getFormattedString('NextThought.view.courseware.assessment.assignments.List.today', {
				date: Ext.Date.format(date, format)
			});
		}

		return html;
	}
});
