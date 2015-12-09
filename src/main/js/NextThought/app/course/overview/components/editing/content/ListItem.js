Ext.define('NextThought.app.course.overview.components.editing.content.ListItem', {
	extend: 'Ext.container.Container',
	//This should only be extended, not instantiated

	requires: [
		'NextThought.app.course.overview.components.editing.Controls'
	],

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	cls: 'overview-editing-listitem',

	layout: 'none',
	items: [],

	canEdit: false,

	initComponent: function() {
		this.callParent(arguments);

		var preview = this.getPreview(this.record),
			controls = this.getControls(this.record, this.course),
			items = [];

		if (preview) {
			items.push(preview);
		}

		if (controls) {
			items.push(controls);
		}

		this.add(items);
	},

	getPreviewType: function(record) {},

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


	getControls: function(record, bundle) {
		return {
			xtype: 'overview-editing-controls',
			record: record,
			parentRecord: this.parentRecord,
			root: this.lessonOverview,
			bundle: bundle,
			optionsConfig: {
				order: this.canEdit ? ['audit', 'edit'] : []
			}
		};
	}
});
