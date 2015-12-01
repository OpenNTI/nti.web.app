Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlinenode',

	requires: [
		'NextThought.app.course.overview.components.editing.outlinenode.Preview',
		'NextThought.app.course.overview.components.editing.outlinenode.Items',
		'NextThought.app.course.overview.components.editing.outlinenode.Contents'
	],

	hasItems: true,
	hasContents: false,

	cls: 'outline-node-editing',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var items = [
				this.getPreviewConfig(this.outlineNode, this.bundle)
			];

		if (this.hasItems) {
			items.push(this.getItemsConfig(this.outlineNode, this.bundle));
		}

		if (this.hasContents) {
			items.push(this.getContentsConfig(this.outlineNode, this.bundle));
		}

		this.add(items);
	},


	getPreviewConfig: function(outlineNode, bundle) {
		return {
			xtype: 'overview-editing-outlinenode-preview',
			outlineNode: outlineNode,
			bundle: bundle
		};
	},


	getItemsConfig: function(outlineNode, bundle) {
		return {
			xtype: 'overview-editing-outlinenode-items',
			outlineNode: outlineNode,
			bundle: bundle
		};
	},


	getContentsConfig: function(outlineNode, bundle) {
		return {
			xtype: 'overview-editing-outlinenode-contents',
			outlineNode: outlineNode,
			bundle: bundle
		};
	}
});
