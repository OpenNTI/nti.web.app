const Ext = require('extjs');

const MoveInfo = require('legacy/model/app/MoveInfo');

const ContentPrompt = require('./Prompt');

require('legacy/mixins/dnd/OrderingItem');
require('legacy/mixins/Transition');
require('../controls/Edit');
require('../controls/Synclock');
require('../Controls');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ListItem', {
	extend: 'Ext.container.Container',

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem',
		Transition: 'NextThought.mixins.Transition'
	},

	cls: 'overview-editing-listitem',
	layout: 'none',
	items: [],
	canEdit: false,

	initComponent: function () {
		this.callParent(arguments);

		this.setDataTransfer(new MoveInfo({
			OriginContainer: this.record.parent.getId(),
			OriginIndex: this.record && this.record.listIndex
		}));

		this.setDataTransfer(this.record);

		this.setRecord(this.record);

		if (this.transition) {
			this.applyTransition(this.transition);
		}
	},

	updateRecord: function (record) {
		var enableDragging = this.Draggable && this.Draggable.isEnabled;

		this.disableDragging();
		this.setRecord(record, enableDragging);
	},

	setUpRecord () { return Promise.resolve(); },

	setRecord: function (record, enableDragging) {
		this.removeAll(true);

		this.setUpRecord(record)
			.then(() => {
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

				if (enableDragging || (this.Draggable && this.Draggable.isEnabled)) {
					this.enableDragging();
				}
			});
	},

	getDragHandle: function () {
		return this.el && this.el.dom && this.el.dom.querySelector('.controls');
	},

	getPreviewType: function (/*record*/) {},

	getPreview: function (record) {
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
			navigate: this.doNavigation.bind(this),
			inEditMode: true
		}, item);
	},

	getControls: function (record, bundle) {
		var controls = [];

		if (ContentPrompt.canEdit(record)) {
			controls.push({
				xtype: 'overview-editing-controls-synclock',
				record: record,
				parentRecord: this.parentRecord,
				root: this.lessonOverview,
				bundle: bundle
			});
			controls.push({
				xtype: 'overview-editing-controls-edit',
				record: record,
				parentRecord: this.parentRecord,
				root: this.lessonOverview,
				bundle: bundle,
				outlineNode: this.outlineNode,
				onPromptOpen: function () {},
				onPromptClose: () => this.onPromptClose()
			});
		}

		return {
			xtype: 'container',
			cls: 'controls',
			layout: 'none',
			items: controls
		};
	},


	doNavigation (config) {
		if (this.navigate) {
			this.navigate(config);
		}
	},


	onPromptClose () {
		if (this.updateLessonOverview) {
			this.updateLessonOverview();
		}
	}
});
