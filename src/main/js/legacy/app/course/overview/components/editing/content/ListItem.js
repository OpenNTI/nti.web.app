const Ext = require('@nti/extjs');
const { RemoveButton } = require('@nti/web-commons');
const { Overview } = require('@nti/web-course');
const Globals = require('internal/legacy/util/Globals');
const MoveInfo = require('internal/legacy/model/app/MoveInfo');

const getTargetId = require('../../../../util/get-target-id');
const saveRequireStatus = require('../../../../util/save-require-status');
const { ROUTE_BUILDERS } = require('../../Constants');

const ContentPrompt = require('./Prompt');

require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/mixins/dnd/OrderingItem');
require('internal/legacy/mixins/Transition');
require('../controls/Edit');
require('../controls/Synclock');
require('../Controls');

const DEFAULT = 'Default';
const REQUIRED = 'Required';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.ListItem',
	{
		extend: 'Ext.container.Container',

		mixins: {
			OrderingItem: 'NextThought.mixins.dnd.OrderingItem',
			Transition: 'NextThought.mixins.Transition',
		},

		cls: 'overview-editing-listitem',
		layout: 'none',
		items: [],
		canEdit: false,

		initComponent: function () {
			this.callParent(arguments);

			this.setDataTransfer(
				new MoveInfo({
					OriginContainer: this.record.parent.getId(),
					OriginIndex: this.record && this.record.listIndex,
				})
			);

			this.setDataTransfer(this.record);

			this.setRecord(this.record);

			if (this.transition) {
				this.applyTransition(this.transition);
			}

			if (
				this.outline &&
				this.outline.hasSharedEntries &&
				this.outline.hasSharedEntries()
			) {
				this.addCls('has-shared-entries');
			}
		},

		updateRecord: function (record) {
			var enableDragging = this.Draggable && this.Draggable.isEnabled;

			this.disableDragging();
			this.setRecord(record, enableDragging);
		},

		setUpRecord() {
			return Promise.resolve();
		},

		setRecord: function (record, enableDragging) {
			this.removeAll(true);

			this.setUpRecord(record).then(async () => {
				const preview = await this.getPreview(record);

				this.mon(record, {
					single: true,
					destroyable: true,
					update: this.updateRecord.bind(this, record),
				});

				this.addControlsIfNecessary(record, this.course);

				if (preview) {
					this.add({
						xtype: 'container',
						cls: 'body',
						layout: 'none',
						items: [preview],
					});
				}

				if (
					enableDragging ||
					(this.Draggable && this.Draggable.isEnabled)
				) {
					this.enableDragging();
				}
			});
		},

		getDragHandle: function () {
			return (
				this.el && this.el.dom && this.el.dom.querySelector('.controls')
			);
		},

		getPreviewType: function (/*record*/) {},

		getRouteFor(object, context) {
			const builder = ROUTE_BUILDERS[object.MimeType];

			// pass true for editMode.  Types that support going to edit straight from overview edit
			// should honor this flag.. other types will ignore it
			return builder
				? builder(
						this.course,
						this.currentOutlineNode,
						object,
						context,
						true
				  )
				: null;
		},

		getPreview: async function (record) {
			var rawItem = record.getRaw(),
				type = this.getPreviewType(record);

			if (!type) {
				return null;
			}

			const item = await record.getInterfaceInstance();
			const course = await this.course.getInterfaceInstance();
			this.currentOutlineNode =
				await this.outlineNode.getInterfaceInstance();

			const targetId = getTargetId(record);

			const onRequirementChange = (value, target) => {
				let id = targetId;

				if (target) {
					id = target.NTIID;
				}

				saveRequireStatus(this.course, id, value).then(() => {
					if (target && target.refresh && target.onChange) {
						target.refresh().then(() => target.onChange);
					} else {
						record.set(
							'IsCompletionDefaultState',
							value === DEFAULT
						);
						record.set(
							'CompletionRequired',
							value === REQUIRED ||
								(value === DEFAULT &&
									record.get('CompletionDefaultState'))
						);
					}
				});
			};

			return Ext.applyIf(
				{
					xtype: 'react',
					component: Overview.OverviewContents,
					outlineNode: this.currentOutlineNode,
					course,
					layout: Overview.Lesson.Grid,
					overview: { Items: [item], getID: () => {} },
					baseroute: '/',
					getRouteFor: this.getRouteFor.bind(this),
					addHistory: true,
					editMode: true,
					noProgress: true,
					onRequirementChange,
				},
				rawItem
			);
		},

		getRemoveButton: function (record, bundle) {
			const onRemove = () => {
				this.parentRecord
					.removeRecord(this.record)
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
				confirmationMessage: 'Deleted items cannot be recovered.',
			};
		},

		addControlsIfNecessary: function (record, bundle) {
			if (!ContentPrompt.canEdit(record)) {
				return;
			}

			this.controlsWrapper = this.add({
				xtype: 'container',
				cls: 'controls-wrapper',
				layout: 'none',
			});

			this.controls = this.controlsWrapper.add({
				xtype: 'container',
				cls: 'controls',
				layout: 'none',
			});

			this.controls.add({
				xtype: 'overview-editing-controls-synclock',
				record: record,
				parentRecord: this.parentRecord,
				root: this.lessonOverview,
				bundle: bundle,
			});

			if (!this.unavailable) {
				this.controls.add({
					xtype: 'overview-editing-controls-edit',
					record: record,
					parentRecord: this.parentRecord,
					root: this.lessonOverview,
					bundle: bundle,
					outlineNode: this.outlineNode,
					onPromptOpen: function () {},
					onPromptClose: () => this.onPromptClose(),
				});
			}

			this.controls.add(this.getRemoveButton(record, bundle));
		},

		addUnavailableMask() {
			this.unavailable = true;

			this.unavailableMask = this.add({
				xtype: 'box',
				cls: 'unavaiable-overview-item-mask',
				autoEl: { html: 'Unavailable in this course.' },
			});
		},

		removeUnavailableMask() {
			this.unavailable = false;

			if (this.unavailableMask) {
				this.unavailableMask.destroy();
				delete this.unavailableMask;
			}
		},

		doNavigation(config) {
			if (this.navigate) {
				this.navigate(config);
			}
		},

		onPromptClose() {
			if (this.updateLessonOverview) {
				this.updateLessonOverview();
			}
		},
	}
);
