const Ext = require('extjs');

const StoreUtils = require('legacy/util/Store');
const PathActions = require('legacy/app/navigation/path/Actions');
const WindowsActions = require('legacy/app/windows/Actions');

require('./Post');
require('./parts/TopicComment');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.Topic', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Post',
	alias: 'widget.dashboard-topic',
	cls: 'dashboard-post topic',

	statics: {
		HEIGHT: 200,
		COMMENT_HEIGHT: 100,

		getTileConfig: function (record, course, width, removeOnDelete) {
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

	initComponent: function () {
		this.callParent(arguments);
		this.WindowActions = WindowsActions.create();
		this.NavigationActions = PathActions.create();
	},

	handleNavigation: function (e) {
		if (this.removeOnDelete) {
			this.record.destroyDoesNotClearListeners = true;
		}

		this.WindowActions.pushWindow(this.record, null, e, {afterClose: this.onWindowClose.bind(this)}, {course: this.course});
	},

	onWindowClose: function () {
		this.removeAll(true);
		this.updateBody(); // Safe guard for now
		this.setTitle(this.getTitle());
		this.showComments();
	},

	containedIn: function (forums) {
		forums = Ext.isArray(forums) ? forums : [forums];

		var id = this.record.get('ContainerId'),
			contained = false;

		forums.forEach(function (forum) {
			contained = contained || forum.getId() === id;
		});

		return contained;
	},

	getPath: function () {
		return this.NavigationActions.getBreadCrumb(this.record)
			.then(function (path) {
				return path.map(function (item) {
					return item.label;
				});
			});
	},

	getTitle: function () {
		return this.record.get('title');
	},

	getSharedWith: function () {
		return 'Public';
	},

	getBody: function () {
		var headline = this.record.get('headline'),
			whiteboardSize = this.self.WHITEBOARD_SIZE;

		return new Promise(function (fulfill) {
			headline.compileBodyContent(fulfill, null, null, whiteboardSize);
		});
	},

	getCommentCount: function () {
		return this.record.get('PostCount');
	},

	hasComments: function () {
		return this.record.get('PostCount') > 0;
	},

	loadComments: function () {
		var link = this.record.getLink('contents');

		return StoreUtils.loadItems(link, this.self.COMMENT_PARAMS);
	},

	getCmpForComment: function (comment) {
		return {
			xtype: 'dashboard-topic-comment-part',
			record: comment,
			course: this.course
		};
	}
});
