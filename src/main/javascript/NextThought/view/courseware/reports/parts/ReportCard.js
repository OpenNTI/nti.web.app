Ext.define('NextThought.view.courseware.reports.parts.ReportCard', {
	extend: 'Ext.Component',
	alias: 'widget.course-report-card',

	ui: 'course',
	cls: 'report-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'description', html: '{description}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || [], {
			title: this.title,
			description: this.description
		});
	},


	afterRender: function() {
		this.mon(this.el, 'click', this.handleClick);
	}
});
