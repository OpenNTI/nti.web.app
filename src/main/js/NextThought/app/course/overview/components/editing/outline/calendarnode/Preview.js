Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Preview', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Preview',
	alias: 'widget.overview-editing-outline-calendarnode-preview',

	renderTpl: Ext.DomHelper.markup([
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

		var startDate = this.record.get('AvailableBeginning'),
			endDate = this.record.get('AvailableEnding');

		startDate = startDate && Ext.Date.format(startDate, 'F j, Y');
		endDate = endDate && Ext.Date.format(endDate, 'F j, Y');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.getTitle(),
			startDate: startDate,
			endDate: endDate
		});
	}
});
