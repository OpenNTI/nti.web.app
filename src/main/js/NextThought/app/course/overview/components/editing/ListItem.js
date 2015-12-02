Ext.define('NextThought.app.course.overview.components.editing.ListItem', {
	extend: 'Ext.container.Container',
	//This should only be extended, not instantiated

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var preview = this.getPreview(this.record),
			controls = this.getControls(this.record),
			items = [];

		if (preview) {
			items.push(preview);
		}

		if (controls) {
			items.push(controls);
		}

		this.add(items);
	},


	getPreview: function(record) {
		var item = record.raw,
			type = this.getPreviewType(record);

		if (!type) {
			return null;
		}

		return Ext.applyIf({
			xtype: type,
			locationInfo: this.locationInfo,
			courseRecord: this.outlineNode,
			assignment: this.assignment,
			course: this.course,
			record: record,
			'target-ntiid': item['Target-NTIID'],
			ntiid: item.NTIID
		}, item);
	},

	getPreviewType: function(record) {},
	getControls: function(record) {}
});
