Ext.define('NextThought.view.courseware.overview.parts.Header', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-header',
	ui: 'course',

	cls: 'overview-header',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'date', cn: {cls: 'date {expired}', html: '{date:date("l, F jS")}'}},
		{tag: 'tpl', 'if': '!date', cn: {cls: 'date', html: ' '}},
		{cls: 'title', html: '{label}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.record.getData());
		var e = this.record.store;
		e = e && e.courseInstance;
		e = e && e.getCourseCatalogEntry();
		e = e && e.isExpired();
		if (e) {
			this.renderData.expired = 'expired';
		}
	}
});
