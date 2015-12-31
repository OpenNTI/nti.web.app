Ext.define('NextThought.app.course.overview.components.outline.OutlineNode', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline-group',

	requires: [
		'NextThought.model.app.MoveInfo',
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.app.course.overview.components.editing.outline.contentnode.AddNode',
		'NextThought.app.course.overview.components.editing.outline.Prompt'
	],

	mixins: {
		'EllipsisText': 'NextThought.mixins.EllipsisText',
		'OrderingItem': 'NextThought.mixins.dnd.OrderingItem',
		'OrderingContainer': 'NextThought.mixins.dnd.OrderingContainer'
	},

	cls: 'outline-group',
	bodyCls: 'items',

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.setDataTransfer(new NextThought.model.app.MoveInfo({
			OriginContainer: this.outlineNode.parent.getId(),
			OriginIndex: this.outlineNode.listIndex
		}));

		this.setDataTransfer(this.outlineNode);

		this.setDataTransferHandler(NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType, {
			onDrop: this.onDrop.bind(this),
			isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		this.setCollection(this.outlineNode);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.truncateLabels();
	},


	truncateLabels: function() {
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


	getOrderingItems: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},


	getDropzoneTarget: function() {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},


	getDragHandle: function() {
		return this.el && this.el.dom && this.el.dom.querySelector('.outline-row');
	},


	beforeSetCollection: function() {
		this.disableOrderingContainer();
	},


	afterSetCollection: function() {
		if (this.isEditing) {
			this.enableOrderingContainer();
		}
	},


	buildHeader: function(collection) {
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


	buildFooter: function(collection) {
		var me = this,
			OutlinePrompt = NextThought.app.course.overview.components.editing.outline.Prompt,
			inlineEditor = OutlinePrompt.getInlineEditor(this.outlineNode.mimeType);

		//TODO: make this more general to support more complicated outline structures
		if (this.isEditing && collection && collection.isTopLevel()) {
			return {
				xtype: 'overview-editing-new-node',
				title: 'Add Lesson',
				InlineEditor: inlineEditor && inlineEditor.editor,
				parentRecord: collection,
				doSelectNode: this.doSelectNode
			};
		}
	},


	xsetCollection: function(collection) {
		this.disableOrderingContainer();
		this.removeAll(true);

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

		this.add([
			{
				xtype: 'box',
				isNode: true,
				autoEl: {
					cls: classes.join(' '),
					'data-qtip': collection.getTitle(),
					cn: items
				}
			},
			{
				xtype: 'container',
				bodyContainer: true,
				cls: 'items',
				layout: 'none',
				items: []
			}
		]);

		this.nodeCmp = this.down('[isNode]');

		this.callParent(arguments);

		if (this.isEditing) {
			this.startEditing();
		}
	},


	onClick: function(e) {
		var isDisabled = Boolean(e.getTarget('.disabled'));

		if (e.getTarget('.outline-row') && (!isDisabled || this.isEditing)) {
			this.doSelectNode(this.outlineNode);
		}
	},


	selectRecord: function(record) {
		var body = this.getBodyContainer(),
			header = this.currentHeader,
			bodyListEl = this.el && this.el.up('.outline-list');

		if (record.getId() === this.outlineNode.getId()) {
			header.addCls('selected');

			if (bodyListEl) {
				this.el.scrollIntoView(bodyListEl);
			}
		} else {
			header.removeCls('selected');
			header.removeCls('out-of-view');
		}

		body.items.each(function(item) {
			if (item && item.selectRecord) {
				item.selectRecord(record);
			}
		});
	},


	stopEditing: function() {
		var body = this.getBodyContainer();
		if (this.addNodeCmp) {
			this.remove(this.addNodeCmp, true);
		}
		delete this.addNodeCmp;
		delete this.isEditing;
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates,
				doSelectNode: this.doSelectNode,
				isEditing: this.isEditing
			});
		}

		console.warn('Unknown type: ', record);
	},


	onDrop: function(record, newIndex, moveInfo) {
		return this.outlineNode.moveToFromContainer(record, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.outline);
	}
});
