Ext.define('NextThought.app.course.overview.components.Outline', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.course-outline',

	requires: [
		'NextThought.app.course.overview.components.outline.Header',
		'NextThought.app.course.overview.components.outline.OutlineNode',
		'NextThought.model.courses.navigation.CourseOutlineNode'
	],

	ui: 'course',
	cls: 'nav-outline course scrollable',

	items: [
		{xtype: 'overview-outline-header'},
		{xtype: 'container', cls: 'outline-list', bodyContainer: true, layout: 'none', items: []}
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
		var catalog = bundle.getCourseCatalogEntry();

		this.activeBundle = bundle;
		this.shouldShowDates = !catalog.get('DisableOverviewCalendar');
		this.setCollection(outline);
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.navigation.CourseOutlineNode) {
			return NextThought.app.course.overview.components.outline.OutlineNode.create({
				outlineNode: record,
				shouldShowDates: this.shouldShowDates,
				doSelectNode: this.doSelectNode.bind(this)
			});
		}

		console.warn('Unknown type: ', record);
	},


	doSelectNode: function(record) {
		this.fireEvent('select-lesson', record);
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
	}
});
