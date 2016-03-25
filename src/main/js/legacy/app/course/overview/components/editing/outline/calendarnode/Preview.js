var Ext = require('extjs');
var OutlinenodePreview = require('../outlinenode/Preview');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Preview', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Preview',
	alias: 'widget.overview-editing-outline-calendarnode-preview',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'outline-node', cn: [
			{cls: 'title', html: '{title}'}
		]}
	]),


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.getTitle()
		});
	}
});
