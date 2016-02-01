Ext.define('NextThought.app.course.overview.components.editing.content.ListItem', {
	extend: 'Ext.container.Container',
	//This should only be extended, not instantiated

	requires: [
		'NextThought.app.course.overview.components.editing.controls.Edit',
		'NextThought.app.course.overview.components.editing.Controls',
		'NextThought.app.course.overview.components.editing.content.Prompt'
	],

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem',
		Transition: 'NextThought.mixins.Transition'
	},

	cls: 'overview-editing-listitem',

	layout: 'none',
	items: [],

	canEdit: false,

	initComponent: function() {
		this.callParent(arguments);

		this.setDataTransfer(new NextThought.model.app.MoveInfo({
			OriginContainer: this.record.parent.getId(),
			OriginIndex: this.record.listIndex
		}));

		this.setDataTransfer(this.record);

		this.setRecord(this.record);

		if (this.transition) {
			this.applyTransition(this.transition);
		}
	},


	updateRecord: function(record) {
		this.setRecord(record);
	},


	setRecord: function(record) {
		this.removeAll(true);

		var preview = this.getPreview(record),
			controls = this.getControls(record, this.course),
			items = [];

		this.mon(record, {
			single: true,
			destroyable: true,
			'update': this.updateRecord.bind(this, record)
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

		if (this.Draggable && this.Draggable.isEnabled) {
			this.enableDragging();
		}
	},


	getDragHandle: function() {
		return this.el && this.el.dom && this.el.dom.querySelector('.controls');
	},


	getPreviewType: function(record) {},


	getPreview: function(record) {
		var item = record.getRaw(),
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
			ntiid: item.NTIID,
			navigate: this.navigate
		}, item);
	},


	getControls: function(record, bundle) {
		var controls = [];

		if (NextThought.app.course.overview.components.editing.content.Prompt.canEdit(record)) {
			controls.push({
				xtype: 'overview-editing-controls-edit',
				record: record,
				parentRecord: this.parentRecord,
				root: this.lessonOverview,
				bundle: bundle,
				onPromptOpen: function() {},
				onPromptClose: function() {}
			});
		}

		return {
			xtype: 'container',
			cls: 'controls',
			layout: 'none',
			items: controls
		};
	}
});
