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
			const keyMap = Object.keys(record.data).map(k => {
				return {
					normalized: k.toLowerCase(),
					actual: k
				};
			}).reduce((ac, v) => {
				ac[v.normalized] = v.actual;
				return ac;
			},
			{});

			const isRelatedWorkRef = /relatedwork/.test(record.get('MimeType'));

			let id;

			if(isRelatedWorkRef) {
				id = record.isContent && record.isContent() ? record.get(keyMap['target-ntiid']) || record.get('Target-NTIID') : record.get(keyMap['ntiid']);
			}
			else {
				id = record.get(keyMap['target-ntiid']) || record.get('Target-NTIID') || record.get(keyMap['ntiid']);
			}

			const encodedID = encodeURIComponent(id);

			if(value === REQUIRED) {
				Service.put(this.course.getLink('CompletionRequired'), {
					ntiid: id
				});

				Service.requestDelete(this.course.getLink('CompletionNotRequired') + '/' + encodedID);
			}
			else if(value === OPTIONAL) {
				Service.put(this.course.getLink('CompletionNotRequired'), {
					ntiid: id
				});

				Service.requestDelete(this.course.getLink('CompletionRequired') + '/' + encodedID);
			}
			else if(value === DEFAULT) {
				Service.requestDelete(this.course.getLink('CompletionRequired') + '/' + encodedID);
				Service.requestDelete(this.course.getLink('CompletionNotRequired') + '/' + encodedID);
			}
		};

		const basedOnDefault = record.get('CompletionDefaultState');
		const isRequired = record.get('CompletionRequired');
		const requiredValue = basedOnDefault ? DEFAULT : isRequired ? REQUIRED : OPTIONAL;

		return {
			xtype: 'react',
			component: SelectBox,
			value: requiredValue,
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

			if(this.course.hasLink('CompletionRequired') && Object.keys(record.rawData).includes('CompletionRequired')) {
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
			}
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
