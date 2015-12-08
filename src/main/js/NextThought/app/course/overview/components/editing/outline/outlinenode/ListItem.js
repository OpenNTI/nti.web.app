Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlinenode-listitem',

	requires: [
		'NextThought.model.app.MoveInfo',
		'NextThought.app.course.overview.components.editing.Controls'
	],

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'outlinenode-listitme',


	initComponent: function() {
		this.callParent(arguments);

		var move = new NextThought.model.app.MoveInfo({
			OriginContainer: this.record.parent && this.record.parent.getId && this.record.parent.getId(),
			OriginIndex: this.record.listIndex
		});

		this.setDataTransfer(move);
		this.setDataTransfer(this.record);

		this.loadContents = Promise.all([
				this.getPreview(this.record, this.bundle),
				this.getControls(this.record, this.bundle)
			]).then(this.add.bind(this));
	},


	onceLoaded: function() {
		return this.loadContents || Promise.resolve();
	},


	getPreview: function(record) {
		return Promise.resolve({
			xtype: 'box',
			autoEl: {
				cls: 'title', html: record.getTitle()
			}
		});
	},


	getControls: function(record, bundle) {
		return record.getContents()
			.then(function(contents) {
				return {
					xtype: 'overview-editing-controls',
					contents: contents,
					record: record,
					bundle: bundle,
					optionsConfig: {
						order: ['publish', 'audit']
					}
				};
			});
	}
});
