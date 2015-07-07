Ext.define('NextThought.app.course.dashboard.components.tiles.Topic', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Post',
	alias: 'widget.dashboard-topic',

	requiers: ['NextThought.app.course.dashboard.components.tiles.parts.TopicComment'],

	cls: 'dashboard-post topic',

	statics: {
		HEIGHT: 200,
		COMMENT_HEIGHT: 100,

		getTileConfig: function(record) {
			var comments = Math.min(record.get('PostCount'), 2);

			return Promise.resolve({
				xtype: this.xtype,
				baseHeight: this.HEIGHT + (comments * this.COMMENT_HEIGHT),
				width: this.WIDTH
			});
		}
	},

	initComponent: function(){
		this.callParent(arguments);
		this.WindowActions = NextThought.app.windows.Actions.create();
	},


	handleNavigation: function(e) {
		this.WindowActions.pushWindow(this.record, null, e, {afterClose: this.onWindowClose.bind(this)}, {course: this.course});
	},

	onWindowClose: function() {
		this.removeAll(true);
		this.updateBody(); // Safe guard for now
		this.showComments();
	},

	containedIn: function(forums) {
		forums = Ext.isArray(forums) ? forums : [forums];

		var id = this.record.get('ContainerId'),
			contained = false;

		forums.forEach(function(forum) {
			contained = contained || forum.getId() === id;
		});

		return contained;
	},


	getPath: function() {
		return Promise.resolve(['', 'Discussions', 'Forums']);
	},


	getTitle: function() {
		return this.record.get('title');
	},


	getSharedWith: function() {
		return 'Public';
	},


	getBody: function() {
		var headline = this.record.get('headline'),
			whiteboardSize = this.self.WHITEBOARD_SIZE;

		return new Promise(function(fulfill) {
			headline.compileBodyContent(fulfill, null, null, whiteboardSize);
		});
	},


	getCommentCount: function() {
		return this.record.get('PostCount');
	},


	hasComments: function() {
		return this.record.get('PostCount') > 0;
	},


	loadComments: function() {
		var link = this.record.getLink('contents');

		return StoreUtils.loadItems(link, this.self.COMMENT_PARAMS);
	},


	getCmpForComment: function(comment) {
		return {
			xtype: 'dashboard-topic-comment-part',
			record: comment,
			course: this.course
		};
	},

	updateBody: function(){
		this.setBody(this.getBody().value);
	}
});
