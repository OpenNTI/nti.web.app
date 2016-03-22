Ext.define('NextThought.app.course.overview.components.editing.outline.Items', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-outline-items',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.ListItem',
		'NextThought.app.course.overview.components.editing.outline.calendarnode.ListItem',
		'NextThought.app.course.overview.components.editing.outline.contentnode.ListItem'
	],


	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer',
		FillScreen: 'NextThought.mixins.FillScreen'
	},

	autoUpdate: false,

	cls: 'outline-items',

	emptyText: 'Add a lesson to get started.',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.setCollection(this.record);

		this.setDataTransferHandler(NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType, {
			onDrop: this.onDrop.bind(this),
			isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		// Keeps track of the selected item for each control
		// This is handy since when we are about to show the same control on a different listitem,
		// we have access to the previously active control for each type and hide or destroy it if necessary.
		this.activeControls = {};
	},


	afterRender: function() {
		this.callParent(arguments);

		this.fillScreen(this.el.dom, 20);
	},


	onceLoaded: function() {
		var items = this.getOrderingItems();

		return Promise.all(items.map(function(item) {
			if (item && item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
	},


	getDropzoneTarget: function() {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},


	getOrderingItems: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},


	beforeSetCollection: function() {
		this.disableOrderingContainer();
	},


	afterSetCollection: function() {
		this.enableOrderingContainer();
	},


	buildHeader: function(collection) {
		var items = this.getItems(collection);

		if (!items || !items.length) {
			return null;
		}

		return {
			xtype: 'box',
			autoEl: {
				cls: 'header',
				cn: [
					{cls: 'date-column', html: 'Date'},
					{cls: 'title-column', html: 'Lesson Name'},
					{cls: 'controls-column', html: 'Publish Status'}
				]
			}
		};
	},


	buildFooter: function() {
		return {
			xtype: 'container',
			cls: 'outline-overview-footer',
			layout: 'none',
			items: [
				{
					xtype: 'overview-editing-controls-add',
					name: 'Add Lesson',
					parentRecord: this.record,
					root: this.outline
				}
			]
		};
	},


	beforeShowMenuControl: function(control, menu, type) {
		var prevControl = this.activeControls[type];
		if (prevControl !== control) {
			if (prevControl && prevControl.hideMenu) {
				prevControl.hideMenu();
			}
			this.activeControls[type] = control;
		}
	},


	getCmpForRecord: function(record) {
		var cmp,
			base = NextThought.app.course.overview.components.editing.outline,
			bundle = this.bundle;


		if (record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			cmp = base.contentnode.ListItem.create({
				record: record,
				bundle: bundle,
				navigateToOutlineNode: this.navigateToOutlineNode,
				beforeShowMenuControl: this.beforeShowMenuControl.bind(this)
			});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineCalendarNode) {
			cmp = base.calendarnode.ListItem.create({
				record: record,
				bundle: bundle,
				navigateToOutlineNode: this.navigateToOutlineNode,
				beforeShowMenuControl: this.beforeShowMenuControl.bind(this)
			});
		} else if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			cmp = base.outlinenode.ListItem.create({
				record: record,
				bundle: bundle,
				navigateToOutlineNode: this.navigateToOutlineNode,
				beforeShowMenuControl: this.beforeShowMenuControl.bind(this)
			});
		} else {
			console.warn('Unknown type: ', record);
		}

		return cmp;
	},


	onDrop: function(record, newIndex, moveInfo) {
		return this.record.moveToFromContainer(record, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.outline);
	}
});
