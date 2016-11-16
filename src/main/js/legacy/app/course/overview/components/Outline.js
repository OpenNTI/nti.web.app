var Ext = require('extjs');
var ComponentsBoundCollection = require('../../../../common/components/BoundCollection');
var DndOrderingContainer = require('../../../../mixins/dnd/OrderingContainer');
var OutlineHeader = require('./outline/Header');
var OutlineOutlineNode = require('./outline/OutlineNode');
var NavigationCourseOutlineNode = require('../../../../model/courses/navigation/CourseOutlineNode');
var NavigationCourseOutlineCalendarNode = require('../../../../model/courses/navigation/CourseOutlineCalendarNode');
var NavigationCourseOutlineContentNode = require('../../../../model/courses/navigation/CourseOutlineContentNode');
var OutlinenodeAddNode = require('./editing/outline/outlinenode/AddNode');
var OutlinePrompt = require('./editing/outline/Prompt');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.Outline', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline',

	mixins: {
		OrderedContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},

	ui: 'course',
	cls: 'nav-outline course scrollable',

	items: [
		{xtype: 'overview-outline-header'},
		{xtype: 'container', cls: 'outline-list', layout: 'none', items: [
			{xtype: 'container', cls: 'body', bodyContainer: true, layout: 'none', items: []}
		]}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.setDataTransferHandler(NextThought.model.courses.navigation.CourseOutlineNode.mimeType, {
			onDrop: this.onDrop.bind(this),
			isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		this.headerCmp = this.down('overview-outline-header');
	},

	addBodyConfig: function () {},

	afterRender: function () {
		this.callParent(arguments);

		var body = this.getBodyContainer();

		this.mon(body.el, 'scroll', this.onScroll.bind(this));

		if (this.SYNCED_TOP) { this.syncTop(this.SYNCED_TOP); }
	},

	onScroll: function () {
		var body = this.getBodyContainer(),
			bodyRect = body && body.el && body.el.dom && body.el.dom.getBoundingClientRect(),
			selected = this.el.dom.querySelector('.outline-row.selected'),
			selectedRect = selected && selected.getBoundingClientRect();

		if (!selectedRect) { return; }

		if (selectedRect.top < bodyRect.top || selectedRect.bottom > bodyRect.bottom) {
			selected.classList.add('out-of-view');
		} else {
			selected.classList.remove('out-of-view');
		}
	},

	getBodyContainer: function () {
		return this.down('[bodyContainer]');
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


	onCollectionUpdate: function (outline) {
		if (this.activeBundle && this.outline && outline.getId() === this.outline.getId()) {
			this.activeBundle.set('Outline', outline);
		}
		this.setOutline(this.activeBundle, outline);
	},

	setOutline: function (bundle, outline) {
		if (!this.rendered) {
			this.on('afterrender', () => this.setOutline(bundle, outline), this, {single: true});
			return;
		}

		this.disableOrderingContainer();

		var catalog = bundle.getCourseCatalogEntry(),
			body = this.getBodyContainer();

		this.activeBundle = bundle;
		this.outline = outline;
		this.shouldShowDates = !catalog.get('DisableOverviewCalendar');

		// NOTE: We need to keep the height in order to make sure the scroll position
		// doesn't get affected when we refresh the outline by removing all items first and then re-adding them.
		body.el.dom.style.height = body.getHeight() + 'px';
		this.el.mask();

		this.clearCollection();
		this.setCollection(outline);

		body.el.dom.style.height = 'auto';
		this.el.unmask();

		if (this.selectedRecord) {
			this.selectRecord(this.selectedRecord, this.scrollToSelected);
			delete this.scrollToSelected;
		}

		if (this.isEditing) {
			this.enableOrderingContainer();
			this.createAddUnitNode();
		}
	},

	createAddUnitNode: function () {
		var me = this,
			allowedTypes = me.outline && me.outline.getAllowedTypes(),
			button;

		if (me.addNodeCmp) {
			me.addNodeCmp.destroy();
			delete me.addNodeCmp;
		}

		if (allowedTypes) {
			//TODO: May need to be able to handle more than one type here...
			button = allowedTypes.reduce(function (acc, type) {
				var inlineEditor = OutlinePrompt.getInlineEditor(type);

				inlineEditor = inlineEditor && inlineEditor.editor;

				if (!inlineEditor) { return acc; }

				return {
					xtype: 'overview-editing-new-unit-node',
					title: inlineEditor.creationText,
					InlineEditor: inlineEditor,
					parentRecord: me.outline,
					doSelectNode: me.doSelectNode.bind(me),
					outlineCmp: me,
					onEditorShow: function () {
						if (me.rendered) {
							me.el.addCls('editor-open');
						}
					},
					onEditorHide: function () {
						if (me.rendered) {
							me.el.removeCls('editor-open');
						}
					}
				};
			}, null);

			if (button) {
				this.addNodeCmp = this.add(button);
			}
		}
	},

	getCmpForRecord: function (record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				outline: this.outline,
				shouldShowDates: this.shouldShowDates,
				doSelectNode: this.doSelectNode.bind(this),
				isEditing: this.isEditing,
				selectWithoutNavigation: this.selectRecord.bind(this)
			});
		}

		console.warn('Unknown type: ', record);
	},

	doSelectNode: function (record) {
		if (this.isEditing || record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			this.selectOutlineNode(record);
		}
	},

	selectRecord: function (record, scrollTo) {
		var body = this.getBodyContainer();

		this.selectedRecord = record;
		this.scrollToSelected = scrollTo;

		body.items.each(function (item) {
			item.selectRecord(record, scrollTo);
		});

		return record;
	},

	getActiveItem: function () {
		return this.selectedRecord;
	},

	MIN_TOP: 90,
	MAX_TOP: 150,

	syncTop: function (top) {
		top = Math.max(top, this.MIN_TOP);
		top = Math.min(top, this.MAX_TOP);

		this.SYNCED_TOP = top;

		if (this.rendered) {
			this.el.dom.style.top = top + 'px';
		}
	},

	startEditing: function () {
		this.isEditing = true;
		this.addCls('editing');

		if (this.addNodeCmp) {
			this.addNodeCmp.show();
		}
	},

	stopEditing: function () {
		delete this.isEditing;
		this.removeCls('editing');
		if (this.addNodeCmp) {
			this.addNodeCmp.hide();
		}
	},

	onDrop: function (record, newIndex, moveInfo) {
		return this.outline.moveToFromContainer(record, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.outline);
	}
});
