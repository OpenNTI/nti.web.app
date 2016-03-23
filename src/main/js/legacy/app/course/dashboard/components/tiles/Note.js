var Ext = require('extjs');
var LocationMeta = require('../../../../../cache/LocationMeta');
var UserRepository = require('../../../../../cache/UserRepository');
var ContentUtils = require('../../../../../util/Content');
var StoreUtils = require('../../../../../util/Store');
var TilesPost = require('./Post');
var MixinsQuestionContent = require('../../../../../mixins/QuestionContent');
var PartsNoteComment = require('./parts/NoteComment');
var ContextContainerContext = require('../../../../context/ContainerContext');
var PathActions = require('../../../../navigation/path/Actions');


/*globals RangeUtils:false*/
module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.Note', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Post',
	alias: 'widget.dashboard-note',

	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},

	statics: {
		HEIGHT: 200,
		COMMENT_HEIGHT: 100,
		VIDEO_THUMB_ASPECT: 1.77,

		/*
			For notes we need to know if it is in a video to determine the height of the tile
			so wait to determine this and cache the useful async stuff we do along the way
		 */
		getTileConfig: function(record, course, width, removeOnDelete) {
			var me = this,
				context = NextThought.app.context.ContainerContext.create({
					container: record.get('ContainerId'),
					range: record.get('applicableRange'),
					course: course,
					contextRecord: record
				});

			return context.load('card')
				.then(function(context) {
					var height = Math.min((record.get('ReplyCount') || 0), 2) * me.COMMENT_HEIGHT;

					if (context) {
						if (context.type === NextThought.app.context.types.Video.type) {
							height += me.WIDTH / me.VIDEO_THUMB_ASPECT;
							context.width = width || me.WIDTH;
							context.height = Math.round(me.WIDTH / me.VIDEO_THUMB_ASPECT);
						}
						else {
							// Max-Height
							height = 95;
							context.height = height;
						}
					}

					return {
						xtype: me.xtype,
						baseHeight: me.HEIGHT + height,
						width: width || me.WIDTH,
						record: record,
						removeOnDelete: removeOnDelete,
						CACHE: {
							context: Promise.resolve(context)
						}
					};
				}).fail(function() {
					return {
						xtype: me.xtype,
						baseHeight: me.HEIGHT,
						width: width || me.WIDTH,
						record: record,
						removeOnDelete: removeOnDelete,
						CACHE: {
							context: Promise.reject()
						}
					};
				});
		}
	},

	initComponent: function() {
		this.callParent(arguments);
		this.WindowActions = NextThought.app.windows.Actions.create();
		this.PathActions = NextThought.app.navigation.path.Actions.create();
	},

	handleNavigation: function(e) {
		if (this.removeOnDelete) {
			this.record.destroyDoesNotClearListeners = true;
		}

		this.WindowActions.pushWindow(this.record, null, e, {afterClose: this.onWindowClose.bind(this)}, {course: this.course});
	},

	onWindowClose: function() {
		this.removeAll(true);
		this.updateBody(); // Safe guard for now
		this.showComments();
	},

	getMeta: function() {
		this.CACHE.loadMeta = this.CACHE.loadMeta || LocationMeta.getMeta(this.record.get('ContainerId'));

		return this.CACHE.loadMeta;
	},

	getNavigationPath: function() {
		return this.PathActions.getBreadCrumb(this.record)
			.then(function(path) {
				path = path && path.slice(0, 3) || [];

				return path.map(function(item) {
					return item.label;
				});
			});
	},

	getPath: function() {
		var rec = this.record;

		if (!this.course) {
			return this.getNavigationPath();
		}

		//XXX: This doesn't look like its "caching" anything...
		this.CACHE.loadLineage = ContentUtils.getLineageLabels(rec.get('ContainerId'), true, this.course);

		return this.CACHE.loadLineage
			.then(function(paths) {
				var path = paths[0] || [];

				path.pop();
				path.push('Lessons');

				return path;
			});
	},

	getCurrent: function() {
		return this.getPath()
			.then(function(path) {
				path = Ext.clone(path);
				return path.first();
			});
	},

	getSharedWith: function() {
		var sharedWith = this.record.get('sharedWith') || [];

		return UserRepository.getUser(sharedWith.slice());
	},

	getTitle: function() {
		return this.record.get('title');
	},

	getBody: function() {
		var rec = this.record,
			whiteboardSize = this.self.WHITEBOARD_SIZE;

		return new Promise(function(fulfill) {
			rec.compileBodyContent(fulfill, null, null, whiteboardSize);
		});
	},

	getCommentCount: function() {
		return this.record.getReplyCount();
	},

	getContext: function() {
		if (this.CACHE.context) {
			return this.CACHE.context;
		}

		var context = NextThought.app.context.ContainerContext.create({
			container: this.record.get('ContainerId'),
			course: this.course
		});

		this.CACHE.context = context;

		return this.CACHE.context;
	},

	hasComments: function() {
		return this.record.get('ReplyCount') > 0;
	},

	loadComments: function() {
		var rec = this.record,
			link = rec.getLink('replies');

		return StoreUtils.loadItems(link, this.self.COMMENT_PARAMS);
	},

	getCmpForComment: function(comment) {
		return {
			xtype: 'dashboard-note-comment',
			record: comment
		};
	}
});
