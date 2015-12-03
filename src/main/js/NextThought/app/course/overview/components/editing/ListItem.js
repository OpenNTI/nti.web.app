Ext.define('NextThought.app.course.overview.components.editing.ListItem', {
	extend: 'Ext.container.Container',
	//This should only be extended, not instantiated

	requires: [
		'NextThought.app.course.overview.components.editing.Controls',
		'NextThought.app.windows.Actions'
	],

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'overview-editing-listitem',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

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


	getControls: function(record) {
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

	getPreviewType: function(record) {}

	//This functions can be implemented be subclasses to trigger
	//adding controls
	// showEdit: function() {},
	// showPublish: function() {},
	// showRemove: function() {},
	// showHistory: function() {}
});
