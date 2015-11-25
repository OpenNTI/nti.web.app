Ext.define('NextThought.app.course.overview.components.editing.outlinenode.ListItem', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outlinenode-listitem',

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'outlinenode-listitem',

	renderTpl: Ext.DomHelper.markup({html: '{title}'}),

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.outlineNode.getTitle()
		});
	}
});
