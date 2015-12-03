Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlinenode',

	requires: [
		'NextThought.app.course.overview.components.editing.outlinenode.Preview',
		'NextThought.app.course.overview.components.editing.outlinenode.Items',
		'NextThought.app.course.overview.components.editing.outlinenode.Contents',
		'NextThought.app.windows.Actions'
	],

	hasItems: true,
	hasContents: false,

	windowName: 'edit-outlinenode',

	cls: 'outline-node-editing',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		var items = [
				this.getControls(this.outlineNode),
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


	onceLoaded: function() {
		var items = this.items.items || [];

		return Promise.all(items.map(function(item) {
			if (item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
	},


	getControls: function(outlineNode) {
		var controls = {};

		if (this.showEdit) {
			controls.edit = this.showEdit.bind(this);
		}

		if (this.showPublish) {
			controls.publish = {};
			controls.publish.visible = true;
			controls.publish.fn = this.showPublish.bind(this);
		}

		if (this.showRemove) {
			controls.remove = this.showRemove.bind(this);
		}

		if (this.showHistory) {
			controls.history = this.showHistory.bind(this);
		}

		return {
			xtype: 'overview-editing-controls',
			controls: controls
		};
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
	},


	showEdit: function() {

	},



	showPublish: function() {}
});
