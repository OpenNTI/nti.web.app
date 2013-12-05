Ext.define('NextThought.view.courseware.assessment.Activity', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-activity',

	ui: 'course-assessment',
	cls: 'course-assessment-activity scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: '{title}'},
		{ cls: 'list'}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	itemSelector: '.item',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item unread', cn: [
							{ tag: 'time', cls: 'datetime', datetime: '{date:date("c")}', html: '{[this.getTime(values.date)]}'},
							{ tag: 'span', cls: 'label', html: '{label:htmlEncode}: '},
							{ tag: 'span', cls: 'target', html: '{target:htmlEncode}'}
						]}
					]}), {
				//template functions

				getTime: function(date) {
					var format = 'M j',
						today = new Date((new Date()).setHours(0, 0, 0, 0));
					if (date > today) {
						format = 'g:i a';
					}
					return Ext.Date.format(date, format);
				}
			}),


	store: new Ext.data.Store({
		fields: [
			{name: 'id', type: 'int'},
			{name: 'label', type: 'string'},
			{name: 'target', type: 'string'},
			{name: 'date', type: 'date'}
		],
		data: [
			{id: 0, label: 'New Quiz', target: 'Quiz 2', date: new Date('2013-12-05T15:30:00-06:00')},
			{id: 1, label: 'New Feedback', target: 'Quiz 1', date: new Date('2013-12-05T13:30:00-06:00')},
			{id: 2, label: 'Grade Recieved', target: 'Quiz 1', date: new Date('2013-12-05T01:30:00-06:00')},
			{id: 3, label: 'Assignment Past Due', target: 'Quiz 1', date: new Date('2013-12-04T12:30:00-06:00')},
			{id: 4, label: 'Foo', target: 'Discussion', date: new Date('2013-12-03T04:30:00-06:00')},
			{id: 5, label: 'Bar', target: 'Poll 1', date: new Date('2013-12-02T12:30:00-06:00')},
			{id: 6, label: 'Baz', target: 'Quiz 1', date: new Date('2013-11-01T18:30:00-06:00')}
		]
	}),


	clear: function() {
		this.bindStore('ext-empty-store');
	},


	initComponent: function() {
		this.callParent(arguments);
		this.setTitle(this.title);
	},


	setTitle: function(title) {
		this.title = title;
		if (this.titleEl) {
			this.titleEl.update(title);
		}
		else {
			this.renderData = Ext.apply(this.renderData || {}, {
				title: title
			});
		}
	}
});
