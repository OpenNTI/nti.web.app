Ext.define('NextThought.view.courseware.dashboard.tiles.Lessons', {
	extend: 'NextThought.ux.Carousel',
	alias: 'widget.dashboard-lessons',

	label: 'New Lessons Available',


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.getLessons
			.then(function(lessons) {
				return lessons.map(me.buildCmp);
			})
			.then(me.add.bind(me));
	},


	buildCmp: function(node) {
		var title = node.get('title');

		return {
			xtype: 'box',
			cls: 'test',
			autoEl: {html: title}
		};
	}
});
