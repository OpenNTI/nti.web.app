Ext.define('NextThought.app.course.overview.components.editing.calendarnode.Preview', {
	extend: 'NextThought.app.course.overview.components.editing.outlinenode.Preview',
	alias: 'widget.overview-editing-calendarnode-preview',

	requires: [
		'NextThought.app.course.overview.components.editing.calendarnode.Window'
	],

	windowName: 'edit-calendarnode',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'controls'},
		{cls: 'outline-node', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'progress-dates', cn: [
				{tag: 'tpl', 'if': 'startDate', cn: [
					{tag: 'span', cls: 'label', html: 'Start: '},
					{tag: 'span', html: '{startDate}'}
				]},
				{tag: 'tpl', 'if': 'endDate', cn: [
					{tag: 'span', cls: 'label', html: 'End: '},
					{tag: 'span', html: '{endDate}'}
				]}
			]}
		]}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		var startDate = this.outlineNode.get('AvailableBeginning'),
			endDate = this.outlineNode.get('AvailableEnding');

		startDate = startDate && Ext.Date.format(startDate, 'F j,Y');
		endDate = endDate && Ext.Date.format(endDate, 'F j,Y');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.outlineNode.getTitle(),
			startDate: startDate,
			endDate: endDate
		});
	}
});
