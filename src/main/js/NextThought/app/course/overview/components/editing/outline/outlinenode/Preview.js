Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outline-outlinenode-preview',

	cls: 'outline-node-preview',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'outline-node', cn: [
			{cls: 'title', html: '{title}'}
		]}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.getTitle()
		});
	}
});
