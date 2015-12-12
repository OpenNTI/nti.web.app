Ext.define('NextThought.app.course.overview.components.editing.publishing.Menu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-publishing-menu',


	renderTpl: Ext.DomHelper.markup({
		html: 'Publish Menu'
	}),


	initComponent: function() {
		this.callParent(arguments);
	}
});
