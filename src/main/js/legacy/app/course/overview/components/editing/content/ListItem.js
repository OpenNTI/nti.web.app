const Ext = require('extjs');
const {SelectBox, RemoveButton} = require('nti-web-commons');

const Globals = require('legacy/util/Globals');
const MoveInfo = require('legacy/model/app/MoveInfo');

const ContentPrompt = require('./Prompt');

require('legacy/overrides/ReactHarness');
require('legacy/mixins/dnd/OrderingItem');
require('legacy/mixins/Transition');
require('../controls/Edit');
require('../controls/Synclock');
require('../Controls');

const DEFAULT = 'Default';
const REQUIRED = 'Required';
const OPTIONAL = 'Optional';


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


	getRequireControl: function (record, bundle) {
		const onChange = (value) => {
			// TODO: hit this.course's link for setting required/optional status
		};

		return {
			xtype: 'react',
			component: SelectBox,
			value: DEFAULT,	// TODO: pull the actual value from the record
			onChange,
			showSelectedOption: true,
			options: [
				{ label: DEFAULT, value: DEFAULT },
				{ label: REQUIRED, value: REQUIRED },
				{ label: OPTIONAL, value: OPTIONAL }
			]
		};
	},


	getRemoveButton: function (record, bundle) {
		const onRemove = () => {
			this.parentRecord.removeRecord(this.record)
				.then(function () {
					return true;
				})
				.catch(function (reason) {
					console.error('Failed to delete content: ', reason);
					return false;
				})
				.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
				.then(this.onPromptClose.bind(this));
		};

		return {
			xtype: 'react',
			component: RemoveButton,
			onRemove,
			confirmationMessage: 'Deleted items cannot be recovered.'
		};
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
			// TODO: Check record for required fields.  If there are some, add control.
			// If there are none, assume this type doesn't support required/optional state
			// and don't show the control at all
			controls.push(this.getRequireControl(record, bundle));
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
			controls.push(this.getRemoveButton(record, bundle));
		}

		return {
			xtype: 'container',
			cls: 'controls-wrapper',
			layout: 'none',
			items: [
				{
					xtype: 'container',
					cls: 'controls',
					layout: 'none',
					items: controls
				}
			]
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
