var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.Header', {
	extend: 'Ext.Component',
	alias: 'widget.overview-outline-header',


	cls: 'outline-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: 'Outline'}
	])
});
