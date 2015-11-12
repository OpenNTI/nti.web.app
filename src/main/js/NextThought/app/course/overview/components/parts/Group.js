Ext.define('NextThought.app.course.overview.components.parts.Group', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-group',

	requires: [
		'NextThought.app.course.overview.components.parts.ContentLink',
		'NextThought.app.course.overview.components.parts.Discussion',
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.IframeWindow',
		'NextThought.app.course.overview.components.parts.Poll',
		'NextThought.app.course.overview.components.parts.QuestionSet',
		'NextThought.app.course.overview.components.parts.SectionHeader',
		'NextThought.app.course.overview.components.parts.Spacer',
		'NextThought.app.course.overview.components.parts.Survey',
		'NextThought.app.course.overview.components.parts.Timeline',
		'NextThought.app.course.overview.components.parts.Topic',
		'NextThought.app.course.overview.components.parts.Videos',
		'NextThought.app.course.overview.components.types.Base'
	],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'course-overview-section',
				title: this.record.get('title'),
				color: this.record.get('accentColor'),
				type: 'content-driven'
			},
			{
				xtype: 'container',
				bodyContainer: true,
				layout: 'none',
				items: []
			}
		]);

		this.setCollection(this.record);
	},


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	setCollection: function(collection) {
		var items = this.getItems(collection);

		items = (items || []).reduce(function(item) {

		});
	}
});
