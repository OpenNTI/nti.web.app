Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outlinenode-preview',

	cls: 'outline-node-preview',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'controls'},
		{cls: 'outline-node', cn: [
			{cls: 'title', html: '{title}'}
		]}
	]),


	renderSelector: {
		controlsEl: '.controls'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.outlineNode.getTitle()
		});
	}
});
