Ext.define('NextThought.app.course.overview.components.Outline', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline',

	requires: [
		'NextThought.app.course.overview.components.outline.Header',
		'NextThought.app.course.overview.components.outline.OutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.model.courses.navigation.CourseOutlineContentNode',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.AddNode'
	],

	ui: 'course',
	cls: 'nav-outline course scrollable',

	items: [
		{xtype: 'overview-outline-header'},
		{xtype: 'container', cls: 'outline-list', layout: 'none', items: [
			{xtype: 'container', cls: 'body', bodyContainer: true, layout: 'none', items: []}
		]}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.headerCmp = this.down('overview-outline-header');
	},


	afterRender: function() {
		this.callParent(arguments);

		var body = this.getBodyContainer();

		this.mon(body.el, 'scroll', this.onScroll.bind(this));

		if (this.SYNCED_TOP) { this.syncTop(this.SYNCED_TOP); }
	},


	onScroll: function() {
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


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	setOutline: function(bundle, outline) {
		var catalog = bundle.getCourseCatalogEntry(),
			bodyListEl = this.el && this.el.down('.outline-list'),
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
			this.selectRecord(this.selectedRecord);
		}

		if (this.isEditing) {
			this.createAddUnitNode();
		}
	},


	createAddUnitNode: function(){
		var OutlineEditor = NextThought.app.course.overview.components.editing.outline.Editor,
			mimeType = NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
			inlineEditor = OutlineEditor.getInlineEditor(mimeType);

		if (inlineEditor && !this.addNodeCmp) {
			this.addNodeCmp = this.add({
				xtype: 'overview-editing-new-unit-node',
				title: 'Add Unit',
				InlineEditor: inlineEditor && inlineEditor.editor,
				afterSave: this.onAddRecord.bind(this),
				parentRecord: this.outline,
				doSelectNode: this.doSelectNode.bind(this)
			});	
		}
	},


	onAddRecord: function(record){
		var body = this.getBodyContainer(),
			cmp  = this.getCmpForRecord(record), newCmp,
			bodyListEl = this.el.down('.outline-list');
		
		if (cmp && body) {
			newCmp = body.add(cmp);
			wait()
				.then(function(){
					newCmp.el.scrollIntoView(bodyListEl);
				});
		}
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates,
				doSelectNode: this.doSelectNode.bind(this),
				isEditing: this.isEditing
			});
		}

		console.warn('Unknown type: ', record);
	},


	doSelectNode: function(record) {
		if (this.isEditing || record instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			this.selectOutlineNode(record);
		}
	},


	selectRecord: function(record) {
		var body = this.getBodyContainer();

		this.selectedRecord = record;

		body.items.each(function(item) {
			item.selectRecord(record);
		});

		return record;
	},


	getActiveItem: function() {
		return this.selectedRecord;
	},

	MIN_TOP: 90,
	MAX_TOP: 150,

	syncTop: function(top) {
		top = Math.max(top, this.MIN_TOP);
		top = Math.min(top, this.MAX_TOP);

		this.SYNCED_TOP = top;

		if (this.rendered) {
			this.el.dom.style.top = top + 'px';
		}
	},


	startEditing: function() {
		this.isEditing = true;
		this.addCls('editing');

		if (this.addNodeCmp) {
			this.addNodeCmp.show();
		}
	},


	stopEditing: function() {
		delete this.isEditing;
		this.removeCls('editing');
		if (this.addNodeCmp) {
			this.addNodeCmp.hide();
		}
	}
});
