const Ext = require('@nti/extjs');

const DndOrderingContainer = require('legacy/mixins/dnd/OrderingContainer');
const CourseOutlineNode = require('legacy/model/courses/navigation/CourseOutlineNode');
const CourseOutlineContentNode = require('legacy/model/courses/navigation/CourseOutlineContentNode');

const OutlineOutlineNode = require('./outline/OutlineNode');
const OutlinePrompt = require('./editing/outline/Prompt');

require('legacy/common/components/BoundCollection');
require('legacy/model/courses/navigation/CourseOutlineCalendarNode');
require('./outline/Header');
require('./outline/progress/Header');
require('./editing/outline/outlinenode/AddNode');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.Outline', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline',

	mixins: {
		OrderedContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},

	ui: 'course',
	cls: 'nav-outline course scrollable',

	items: [
		{xtype: 'container', cls: 'outline-header-container', items: []},
		{xtype: 'container', cls: 'outline-list', layout: 'none', items: [
			{xtype: 'container', cls: 'body', bodyContainer: true, layout: 'none', items: []}
		]}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.setDataTransferHandler(CourseOutlineNode.mimeType, {
			onDrop: this.onDrop.bind(this),
			isValid: DndOrderingContainer.hasMoveInfo,
			effect: 'move'
		});
	},

	addBodyConfig: function () {},

	afterRender: function () {
		this.callParent(arguments);

		this.headerContainer = this.items.items[0]; // how to really get this?
		this.outlineHeader = this.headerContainer.add({xtype: 'overview-outline-header'});
		this.headerCmp = this.down('overview-outline-header');

		var body = this.getBodyContainer();

		this.mon(body.el, 'scroll', this.onScroll.bind(this));

		if (this.SYNCED_TOP) { this.syncTop(this.SYNCED_TOP); }

		//adding role: navigation allows users to exit out of lesson list with a screen reader
		const navOutline = this.el.dom;
		navOutline.setAttribute('role', 'navigation');
	},


	onBeforeRouteActivate () {
		if (this.progressHeader) {
			this.progressHeader.onBeforeRouteActivate();
		}
	},


	onRouteActivate () {
		if (this.progressHeader) {
			this.progressHeader.onRouteActivate();
		}
	},


	onRouteDeactivate () {
		if (this.progressHeader) {
			this.progressHeader.onRouteDeactivate();
		}
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

	showHeader: function (showProgress, course) {
		if(showProgress) {
			if(this.progressHeader) {
				// if already showing progress header, just update
				this.progressHeader.updateCourse(course);
			}
			else {
				// otherwise, add a new progress header since one doesn't exist
				this.progressHeader = this.headerContainer.add({xtype: 'overview-outline-progress-header', course});
			}

			if(this.outlineHeader) {
				// remove outline header if one exists
				this.headerContainer.remove(this.outlineHeader, true);
				delete this.outlineHeader;
			}
		}
		else {
			if(this.progressHeader) {
				// remove progress header if one exists
				this.headerContainer.remove(this.progressHeader, true);
				delete this.progressHeader;
			}

			if(!this.outlineHeader) {
				// add outline header if one does not already exist
				this.outlineHeader = this.headerContainer.add({xtype: 'overview-outline-header'});
			}
		}
	},

	showProgressHeader: function (bundle) {
		this.showHeader(true, bundle);
	},


	clear () {
		delete this.outline;
		delete this.outlineContentsHash;
		delete this.outlineWasEditing;

		this.clearCollection();
	},


	setOutline: function (bundle, outline) {
		if (!this.rendered) {
			this.on('afterrender', () => this.setOutline(bundle, outline), this, {single: true});
			return;
		}

		var me = this;

		if(bundle.get('CompletionPolicy')) {
			bundle.getInterfaceInstance().then(bundleModel => {
				bundle.get('CompletionPolicy').on('requiredValueChanged', () => {
					this.showProgressHeader(bundleModel);
				});

				this.showProgressHeader(bundleModel);
			});
		}
		else {
			// no CompletionPolicy, show normal header
			me.showHeader(false);
		}

		//If we have an outline, its the same outline as what we are setting, and the contents haven't changed
		if (this.outline && this.outline.getId() === outline.getId() && this.outlineContentsHash === outline.get('ContentsHash') && this.outlineWasEditing === this.isEditing) {
			this.addCollectionMonitors(this.outline);
			return;
		}

		this.disableOrderingContainer();

		var catalog = bundle.getCourseCatalogEntry(),
			body = this.getBodyContainer();

		this.activeBundle = bundle;
		this.outline = outline;
		this.outlineContentsHash = outline.get('ContentsHash');
		this.outlineWasEditing = this.isEditing;
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
		if (record instanceof CourseOutlineNode) {
			return OutlineOutlineNode.create({
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
		if (this.isEditing || record instanceof CourseOutlineContentNode) {
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
	},


	showNewUnit () {
		if (this.addNodeCmp) {
			this.addNodeCmp.showEditor();
		}
	}
});
