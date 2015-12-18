Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.Index', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-lessonoverview',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},


	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.controls.Add',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem'
	],

	emptyText: 'No content here yet. Click add content below to get started.',

	ui: 'course',
	cls: 'course-overview course-overview-editing',

	initComponent: function() {
		this.callParent(arguments);

		this.setDataTransferHandler(NextThought.model.courses.overview.Group.mimeType, {
			onDrop: this.onGroupDrop.bind(this),
			isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		this.setCollection(this.contents);
	},


	onceLoaded: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		items = items || [];

		return Promise.resolve(items.map(function(item) {
			if (item && item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
	},


	getBodyContainer: function() {
		return this.down('[isBodyContainer]');
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


	cacheHeight: function() {
		var dom = this.el && this.el.dom;

		if (dom) {
			dom.style.height = dom.offsetHeight + 'px';
		}
	},


	uncacheHeight: function() {
		var dom = this.el && this.el.dom;

		if (dom) {
			dom.style.height = 'auto';
		}
	},


	setCollection: function(collection) {
		this.disableOrderingContainer();
		this.cacheHeight();
		this.removeAll(true);

		this.lessonOverview = collection;

		this.add([
			{xtype: 'container', isBodyContainer: true, layout: 'none', items: []},
			{
				xtype: 'container',
				cls: 'course-overview-footer',
				layout: 'none',
				items: [
					{
						xtype: 'overview-editing-controls-add',
						name: 'Add Section Break',
						parentRecord: this.lessonOverview,
						root: this.lessonOverview
					}
				]
			}
		]);

		this.callParent(arguments);

		this.uncacheHeight();
		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem.create({
				record: record,
				lessonOverview: this.lessonOverview,
				outlineNode: this.record,
				enrollment: this.enrollment,
				locInfo: this.locInfo,
				assignments: this.assignments,
				course: this.bundle
			});
		}

		console.warn('Unknown type: ', record);
	},


	onGroupDrop: function(group, newIndex, moveInfo) {
		this.contents.moveToFromContainer(group, newIndex, moveInfo.get('OriginContainer'), this.contents);
	}
});
