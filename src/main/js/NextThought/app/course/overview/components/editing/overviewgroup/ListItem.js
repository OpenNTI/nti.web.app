Ext.define('NextThought.app.course.overview.components.editing.overviewgroup.ListItem', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-overviewgroup-listitem',

	requires: [
		'NextThought.app.course.overview.components.editing.overviewgroup.Preview',
		'NextThought.app.course.overview.components.editing.contentlink.ListItem',
		'NextThought.app.course.overview.components.editing.discussion.ListItem',
		'NextThought.app.course.overview.components.editing.poll.ListItem',
		'NextThought.app.course.overview.components.editing.questionset.ListItem',
		'NextThought.app.course.overview.components.editing.survey.ListItem',
		'NextThought.app.course.overview.components.editing.timeline.ListItem',
		'NextThought.app.course.overview.components.editing.video.ListItem',
		'NextThought.app.course.overview.components.editing.videoroll.ListItem'
	],

	initComponent: function() {
		this.callParent(arguments);

		var base = NextThought.app.course.overview.components.editing,
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

		this.setCollection(this.record);
	},


	getBodyContainer: function() {
		return this.down('[isBodyContainer]');
	},


	setCollection: function(collection) {
		this.removeAll(true);

		this.add([
			{xtype: 'overview-editing-overviewgroup-preview', group: collection},
			{xtype: 'container', layout: 'none', isBodyContainer: true, items: []}
		]);


		this.callParent(arguments);
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
