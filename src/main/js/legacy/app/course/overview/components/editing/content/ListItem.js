const Ext = require('extjs');
const {RemoveButton} = require('nti-web-commons');
const {ProgressWidgets} = require('nti-web-course');

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
				var preview = this.getPreview(record);

				this.mon(record, {
					single: true,
					destroyable: true,
					'update': this.updateRecord.bind(this, record)
				});

				this.addControlsIfNecessary(record, this.course);

				if(preview) {
					this.add({
						xtype: 'container',
						cls: 'body',
						layout: 'none',
						items: [preview]
					});
				}

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

	getTargetId: function (record) {
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

		return id;
	},


	getRequireControl: function (record, bundle) {
		const targetId = this.getTargetId(record);

		const onChange = async (value) => {
			const completionPolicy = this.course.get('CompletionPolicy');

			const requirementLink = completionPolicy.getLink('Required');
			const nonRequirementLink = completionPolicy.getLink('NotRequired');

			const encodedID = encodeURIComponent(targetId);

			if(value === REQUIRED) {
				await Service.put(requirementLink, {
					ntiid: targetId
				});

				await Service.requestDelete(nonRequirementLink + '/' + encodedID);
			}
			else if(value === OPTIONAL) {
				await Service.put(nonRequirementLink, {
					ntiid: targetId
				});

				await Service.requestDelete(requirementLink + '/' + encodedID);
			}
			else if(value === DEFAULT) {
				await Service.requestDelete(requirementLink + '/' + encodedID);
				await Service.requestDelete(nonRequirementLink + '/' + encodedID);
			}

			this.course.get('CompletionPolicy').fireEvent('requiredValueChanged', { ntiid: targetId, value });
		};

		this.course.get('CompletionPolicy').on('requiredValueChanged', ({ntiid, value}) => {
			if(this.requireControl && targetId === ntiid) {
				this.requireControl.setProps({value});
			}
		});

		const transformed = {
			IsCompletionDefaultState: record.get('IsCompletionDefaultState'),
			CompletionRequired: record.get('CompletionRequired'),
			CompletionDefaultState: record.get('CompletionDefaultState')
		};

		return {
			xtype: 'react',
			component: ProgressWidgets.RequirementControl,
			record: transformed,
			onChange
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


	addControlsIfNecessary: function (record, bundle) {
		if(!ContentPrompt.canEdit(record)) {
			return;
		}

		this.controlsWrapper = this.add({
			xtype: 'container',
			cls: 'controls-wrapper',
			layout: 'none'
		});

		this.controls = this.controlsWrapper.add({
			xtype: 'container',
			cls: 'controls',
			layout: 'none'
		});

		this.controls.add({
			xtype: 'overview-editing-controls-synclock',
			record: record,
			parentRecord: this.parentRecord,
			root: this.lessonOverview,
			bundle: bundle
		});

		if(this.course.get('CompletionPolicy') && Object.keys(record.rawData).includes('CompletionRequired')) {
			this.requireControl = this.controls.add(this.getRequireControl(record, bundle));
		}

		this.controls.add({
			xtype: 'overview-editing-controls-edit',
			record: record,
			parentRecord: this.parentRecord,
			root: this.lessonOverview,
			bundle: bundle,
			outlineNode: this.outlineNode,
			onPromptOpen: function () {},
			onPromptClose: () => this.onPromptClose()
		});

		this.controls.add(this.getRemoveButton(record, bundle));
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
