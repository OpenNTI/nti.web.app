const Ext = require('extjs');

const DndOrderingContainer = require('legacy/mixins/dnd/OrderingContainer');
const MoveInfo = require('legacy/model/app/MoveInfo');
const CourseOutlineNode = require('legacy/model/courses/navigation/CourseOutlineNode');
const CourseOutlineContentNode = require('legacy/model/courses/navigation/CourseOutlineContentNode');

const OutlinePrompt = require('../editing/outline/Prompt');

require('legacy/common/components/BoundCollection');
require('legacy/mixins/EllipsisText');
require('legacy/mixins/dnd/OrderingItem');
require('legacy/model/courses/navigation/CourseOutlineCalendarNode');
require('../editing/outline/contentnode/AddNode');

const OutlineNode = module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.OutlineNode', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline-group',

	mixins: {
		'EllipsisText': 'NextThought.mixins.EllipsisText',
		'OrderingItem': 'NextThought.mixins.dnd.OrderingItem',
		'OrderingContainer': 'NextThought.mixins.dnd.OrderingContainer'
	},

	cls: 'outline-group',
	bodyCls: 'items',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.setDataTransfer(new MoveInfo({
			OriginContainer: this.outlineNode.parent.getId(),
			OriginIndex: this.outlineNode.listIndex
		}));

		this.setDataTransfer(this.outlineNode);

		this.setDataTransferHandler(CourseOutlineContentNode.mimeType, {
			onDrop: this.onDrop.bind(this),
			isValid: DndOrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		this.setCollection(this.outlineNode);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.truncateLabels();
	},

	truncateLabels: function () {
		var me = this,
			label = me.currentHeader && me.currentHeader.el && me.currentHeader.el.dom.querySelector('.label');

		if (!me.el) {
			me.onceRendered.then(me.truncateLabels.bind(me));
			return;
		}

		if (label) {
			me.truncateText(label, null, true);
		}
	},

	getOrderingItems: function () {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},

	getDropzoneTarget: function () {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},

	getDragHandle: function () {
		return this.el && this.el.dom && this.el.dom.querySelector('.outline-row');
	},

	beforeSetCollection: function () {
		this.disableOrderingContainer();
	},

	afterSetCollection: function () {
		if (this.isEditing) {
			this.enableOrderingContainer();
		}
		if (this.Draggable && this.Draggable.isEnabled) {
			this.enableDragging();
		}
	},

	setHeaderForCollection: function () {
		this.callParent(arguments);

		if (this.selectedRecord) {
			this.selectRecord(this.selectedRecord);
		}
	},

	buildHeader: function (collection) {
		var startDate = collection.get('startDate'),
			classes = ['outline-row', collection.get('type')],
			items = [];

		if (!collection.get('isAvailable')) {
			classes.push('disabled');
		}

		items.push({cls: 'label', html: collection.getTitle()});

		if (this.shouldShowDates && startDate) {
			items.push({
				cls: 'date',
				cn: [
					{html: Ext.Date.format(startDate, 'M')},
					{html: Ext.Date.format(startDate, 'j')}
				]
			});
		}

		return {
			xtype: 'box',
			isNode: true,
			autoEl: {
				cls: classes.join(' '),
				'data-qtip': collection.getTitle(),
				cn: items
			},
			listeners: {
				click: {
					element: 'el',
					fn: this.onClick.bind(this)
				}
			}
		};
	},

	setFooterForCollection: function (collection) {
		// NOTE: Only, create a new footer if we don't the old one.
		if (!this.currentFooter) {
			const footer = this.buildFooter && this.buildFooter(collection);
			this.currentFooter = this.insert(2, footer);
		}
	},

	buildFooter: function (collection) {
		var me = this,
			allowedTypes = this.outlineNode.getAllowedTypes();

		if (this.isEditing) {
			return allowedTypes.reduce(function (acc, type) {
				var inlineEditor = OutlinePrompt.getInlineEditor(type),
					button;

				inlineEditor = inlineEditor && inlineEditor.editor;

				if (!inlineEditor) { return acc; }

				button = {
					xtype: 'overview-editing-new-node',
					title: inlineEditor.creationText,
					InlineEditor: inlineEditor,
					parentRecord: collection,
					doSelectNode: me.doSelectNode,
					afterSave: function () {
						if (me.selectedRecord && me.selectWithoutNavigation) {
							me.selectWithoutNavigation(me.selectedRecord);
						}
					}
				};


				if (!acc) {
					acc = button;
				} else if (Array.isArray(acc)) {
					acc.push(button);
				} else {
					acc = [acc, button];
				}

				return acc;
			}, null);
		}
	},

	onClick: function (e) {
		var isDisabled = Boolean(e.getTarget('.disabled'));

		if (e.getTarget('.outline-row') && (!isDisabled || this.isEditing)) {
			this.doSelectNode(this.outlineNode);
		}
	},

	selectRecord: function (record, scrollTo) {
		var body = this.getBodyContainer(),
			header = this.currentHeader,
			bodyListEl = this.el && this.el.up('.outline-list');

		this.selectedRecord = record;

		if (record.getId() === this.outlineNode.getId()) {
			header.addCls('selected');

			if (bodyListEl && scrollTo) {
				this.el.scrollIntoView(bodyListEl);
			}
		} else {
			header.removeCls('selected');
			header.removeCls('out-of-view');
		}

		body.items.each(function (item) {
			if (item && item.selectRecord) {
				item.selectRecord(record, scrollTo);
			}
		});
	},

	stopEditing: function () {
		if (this.addNodeCmp) {
			this.remove(this.addNodeCmp, true);
		}
		delete this.addNodeCmp;
		delete this.isEditing;
	},

	getCmpForRecord: function (record) {
		if (record instanceof CourseOutlineNode) {
			return OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates,
				doSelectNode: this.doSelectNode,
				isEditing: this.isEditing
			});
		}

		console.warn('Unknown type: ', record);
	},

	onDrop: function (record, newIndex, moveInfo) {
		return this.outlineNode.moveToFromContainer(record, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.outline);
	}
});
