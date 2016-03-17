export default Ext.define('NextThought.app.course.dashboard.components.tiles.Blog', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Topic',
	alias: 'widget.dashboard-blog',

	statics: {
		HEIGHT: 200,
		COMMENT_HEIGHT: 100,

		getTileConfig: function(record, course, width, removeOnDelete) {
			var comments = Math.min(record.get('PostCount'), 2);

			return Promise.resolve({
				xtype: this.xtype,
				baseHeight: this.HEIGHT + (comments * this.COMMENT_HEIGHT),
				width: width || this.WIDTH,
				record: record,
				removeOnDelete: removeOnDelete
			});
		}
	},


	getCommentCount: function() {
		return this.record.get('PostCount');
	},


	hasComments: function() {
		return this.record.get('PostCount') > 0;
	}
});
