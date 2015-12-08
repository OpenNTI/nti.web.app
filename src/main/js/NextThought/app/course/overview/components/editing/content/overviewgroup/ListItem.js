Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-overviewgroup-listitem',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer',
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	requires: [
		'NextThought.app.course.overview.components.editing.content.overviewgroup.Preview',
		'NextThought.app.course.overview.components.editing.content.contentlink.ListItem',
		'NextThought.app.course.overview.components.editing.content.discussion.ListItem',
		'NextThought.app.course.overview.components.editing.content.poll.ListItem',
		'NextThought.app.course.overview.components.editing.content.questionset.ListItem',
		'NextThought.app.course.overview.components.editing.content.survey.ListItem',
		'NextThought.app.course.overview.components.editing.content.timeline.ListItem',
		'NextThought.app.course.overview.components.editing.content.video.ListItem',
		'NextThought.app.course.overview.components.editing.content.videoroll.ListItem',
		'NextThought.app.windows.Actions'
	],


	cls: 'overview-section overview-section-editing',

	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		var base = NextThought.app.course.overview.components.editing.content,
			items = [
				base.contentlink.ListItem,
				base.discussion.ListItem,
				base.poll.ListItem,
				base.questionset.ListItem,
				base.survey.ListItem,
				base.timeline.ListItem,
				base.video.ListItem,
				base.videoroll.ListItem
			];

		this.MIME_TO_CMP = items.reduce(function(acc, item) {
			var supported = item.getSupported();

			if (!Array.isArray(supported)) { supported = [supported]; }

			supported.forEach(function(key) {
				acc[key] = item;
			});

			return acc;
		}, {});

		this.setDataTransfer(this.record);

		this.setCollection(this.record);
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


	setCollection: function(collection) {
		this.disableOrderingContainer();
		this.removeAll(true);

		//TODO: add controls to edit
		this.add([
			{xtype: 'overview-editing-overviewgroup-preview', group: collection},
			{xtype: 'container', layout: 'none', isBodyContainer: true, items: []}
		]);


		this.callParent(arguments);
		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		var mimeType = record.mimeType,
			cmp = this.MIME_TO_CMP[mimeType],
			assignment;

		if (!cmp) {
			console.warn('Unknown type: ', record);
			return;
		}

		if (cmp.isAssessmentWidget) {
			assignment = this.assignments.getItem(record.get('Target-NTIID'));
		}

		return cmp.create({
			record: record,
			locationInfo: this.locInfo,
			outlineNode: this.outlineNode,
			assignment: assignment,
			course: this.course
		});

	}
});
