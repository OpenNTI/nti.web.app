Ext.define('NextThought.view.content.PageWidgets',{
	extend: 'Ext.container.Container',
	alias: 'widget.content-page-widgets',
	ui: 'content-page-widgets',

	layout: {
		type: 'hbox',
		pack: 'end'
	},


	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'meta',
			cn: [{
				cls: 'controls',
				cn: [{ cls: 'favorite' },{ cls: 'like' }]
			}]
		},'{%this.renderContainer(out,values)%}'
	])
});
