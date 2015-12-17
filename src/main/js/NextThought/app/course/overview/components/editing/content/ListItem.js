Ext.define('NextThought.app.course.overview.components.editing.content.ListItem', {
	extend: 'Ext.container.Container',
	//This should only be extended, not instantiated

	requires: [
		'NextThought.app.course.overview.components.editing.controls.Edit',
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

		this.setRecord(this.record);
	},


	setRecord: function(record) {
		this.removeAll(true);

		var preview = this.getPreview(record),
			controls = this.getControls(record, this.course),
			items = [];

		this.mon(record, {
			single: true,
			destroyable: true,
			'update': this.setRecord.bind(this, record)
		});

		if (controls) {
			items.push(controls);
		}

		if (preview) {
			items.push({
				xtype: 'container',
				cls: 'body',
				layout: 'none',
				items: [preview]
			});
		}

		this.add(items);
	},


	getPreviewType: function(record) {},


	getPreview: function(record) {
		var item = record.toJSON(),
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
			xtype: 'container',
			cls: 'controls',
			layout: 'none',
			items: [
				{
					xtype: 'overview-editing-controls-edit',
					record: record,
					parentRecord: this.parentRecord,
					root: this.lessonOverview,
					bundle: bundle
				}
			]
		};
	}
});
