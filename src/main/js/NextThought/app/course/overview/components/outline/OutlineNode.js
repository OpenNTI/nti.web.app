Ext.define('NextThought.app.course.overview.components.outline.OutlineNode', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline-group',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.app.course.overview.components.editing.creation.AddNode',
		'NextThought.app.course.overview.components.editing.outline.Editor'
	],

	mixins: {
		'EllipsisText': 'NextThought.mixins.EllipsisText'
	},

	cls: 'outline-group',

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var node = this.outlineNode,
			startDate = node.get('startDate'),
			classes = ['outline-row', node.get('type')],
			items = [];

		if (!node.get('isAvailable')) {
			classes.push('disabled');
		}

		items.push({cls: 'label', html: node.getTitle()});

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
					'data-qtip': node.getTitle(),
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

		this.setCollection(node);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.truncateLabels();

		this.mon(this.nodeCmp.el, 'click', this.onClick.bind(this));
	},


	setCollection: function(collection) {
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
		if (e.getTarget('.outline-row')) {
			this.doSelectNode(this.outlineNode);
		}
	},


	truncateLabels: function() {
		var me = this;

		if (!me.el) {
			me.onceRendered.then(me.truncateLabels.bind(me));
			return;
		}

		wait(100).then(function() {
			var label = me.nodeCmp && me.nodeCmp.el && me.nodeCmp.el.dom.querySelector('.label');

			if (label) {
				me.truncateText(label, null, true);
			}
		});
	},


	selectRecord: function(record) {
		var body = this.getBodyContainer();

		if (record.getId() === this.outlineNode.getId()) {
			this.nodeCmp.addCls('selected');
		} else {
			this.nodeCmp.removeCls('selected');
			this.nodeCmp.removeCls('out-of-view');
		}

		body.items.each(function(item) {
			if (item && item.selectRecord) {
				item.selectRecord(record);
			}
		});
	},


	startEditing: function(){		
		var me = this, OutlineEditor, mimeType, body;

		if (this.outlineNode && this.outlineNode._depth === 1) {
			OutlineEditor = NextThought.app.course.overview.components.editing.outline.Editor;
			mimeType = NextThought.model.courses.navigation.CourseOutlineNode.mimeType;
			body = this.getBodyContainer();
			inlineEditor = OutlineEditor.getInlineEditor(mimeType);

			this.addNodeCmp = this.add({
				xtype: 'overview-editing-new-node',
				title: 'Add Lesson',
				InlineEditor: inlineEditor && inlineEditor.editor,
				afterSave: this.onAddRecord.bind(this),
				parentRecord: this.outlineNode,
				doSelectNode: this.doSelectNode
			});	
		}
	},


	stopEditing: function(){
		var body = this.getBodyContainer();
		if (this.addNodeCmp) {
			this.remove(this.addNodeCmp, true);
		}
		delete this.addNodeCmp;
		delete this.isEditing;
	},


	onAddRecord: function(record) {
		var body = this.getBodyContainer(),
			cmp  = this.getCmpForRecord(record),
			d = this.el.dom, me = this,
			insertPosition = d.querySelectorAll('.lesson').length;
		
		if (insertPosition >= 0) {
			body.insert(insertPosition, cmp);
		} 
	},


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates,
				doSelectNode: this.doSelectNode
			});
		}

		console.warn('Unknown type: ', record);
	}
});
