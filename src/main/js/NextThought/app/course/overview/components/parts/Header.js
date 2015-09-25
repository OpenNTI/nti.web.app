export default Ext.define('NextThought.app.course.overview.components.parts.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-header',
	ui: 'course',

	cls: 'overview-header',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'date', cn: {cls: 'date {expired}', html: '{startDate:date("l, F jS")}'}},
		{tag: 'tpl', 'if': '!date', cn: {cls: 'date', html: ' '}},
		{cls: 'title', html: '{label}'}
	]),


	config: {
		title: '',
		record: null
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());

		if (this.getTitle()) {
			this.renderData.label = this.getTitle();
		}

		var e = this.course;

		e = e && e.isExpired();

		if (e) {
			this.renderData.expired = 'expired';
		}
	}
});
