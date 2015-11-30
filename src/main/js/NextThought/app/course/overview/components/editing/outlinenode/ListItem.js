Ext.define('NextThought.app.course.overview.components.editing.outlinenode.ListItem', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outlinenode-listitem',

	requires: [
		'NextThought.model.app.moveInfo'
	],

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'outlinenode-listitem',

	renderTpl: Ext.DomHelper.markup({html: '{title}'}),

	initComponent: function() {
		this.callParent(arguments);

		var move = new NextThought.model.app.moveInfo({
			OriginContainer: this.outlineNode.parent && this.outlineNode.parent.getId && this.outlineNode.getId(),
			OriginIndex: this.outlineNode.listIndex
		});

		this.setDataTransfer(move);
		this.setDataTransfer(this.outlineNode);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.outlineNode.getTitle()
		});
	}
});
