/*globals RangeUtils:false*/
Ext.define('NextThought.app.course.dashboard.components.tiles.Note', {
	extend: 'NextThought.app.course.dashboard.components.tiles.Post',
	alias: 'widget.dashboard-note',

	requires: ['NextThought.app.course.dashboard.components.tiles.parts.NoteComment'],

	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},

	statics: {
		HEIGHT: 200,
		COMMENT_HEIGHT: 100,
		VIDEO_THUMB_ASPECT: 1.77,

		loadContext: function(record) {
			return new Promise(function(fulfill) {
					ContentUtils.findContentObject(record.get('ContainerId'), function(obj) {
						fulfill(obj);
					});
				});
		},

		/*
			For notes we need to know if it is in a video to determine the height of the tile
			so wait to determine this and cache the useful async stuff we do along the way
		 */
		getTileConfig: function(record) {
			var me = this,
				loadMeta = LocationMeta.getMeta(record.get('ContainerId')),
				context = loadMeta
							.then(function() {
								return {};
							})
							.fail(me.loadContext.bind(me, record));

			return context
					.then(function(obj) {
						//add height for the number of comments we are going to show
						var height = Math.min((record.get('ReplyCount') || 0), 2) * me.COMMENT_HEIGHT;

						//if we are in a video add height for the thumbnail
						if (obj && /ntivideo/.test(obj.mimeType || obj.MimeType)) {
							height += me.WIDTH / me.VIDEO_THUMB_ASPECT;
						}

						return {
							xtype: me.xtype,
							baseHeight: me.HEIGHT + height,
							width: me.WIDTH,
							CACHE: {
								context: context,
								loadMeta: loadMeta
							}
						};
					});
		}
	},


	handleNavigation: function() {
		var cid = this.record.get('ContainerId');

		this.fireEvent('navigation-selected', cid, this.record, null, this.course);
	},


	getMeta: function() {
		this.CACHE.loadMeta = this.CACHE.loadMeta || LocationMeta.getMeta(this.record.get('ContainerId'));

		return this.CACHE.loadMeta;
	},


	getPath: function() {
		var rec = this.record;

		this.CACHE.loadLineage = this.CACHE.loadLineage || this.getMeta()
			.then(function(meta) {
				return ContentUtils.getLineageLabels((meta && meta.NTIID) || rec.get('ContainerId'), true, this.course);
			})
			.fail(function() {
				return ContentUtils.getLineageLabels(rec.get('ContainerId'), true, this.course);
			});

		return this.CACHE.loadLineage
			.then(function(paths) {
				var path = paths[0];

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


	__loadContextFromMeta: function(meta) {
		var me = this,
			record = me.record;

		return new Promise(function(fulfill, reject) {
			ContentUtils.spider(meta.NTIID, function spiderComplete() {
				fulfill('');
			}, function parse(doc) {
				doc = ContentUtils.parseXML(ContentUtils.fixReferences(doc, meta.absoluteContentRoot));

				var newContext = RangeUtils.getContextAroundRange(record.get('applicableRange'), doc, doc, record.get('ContainerId')),
					temp = Ext.fly(newContext);

				Ext.fly(newContext).select('object').remove();
				Ext.fly(newContext).select('input').addCls('preview').set({readonly: true});

				return fulfill({
					text: me.buildContent(newContext, true)
				});
			}, reject);
		});
	},


	__loadContextFromObj: function() {
		var me = this;

		return me.CACHE.context
				.then(function(obj) {
					var src;

					if (obj && /ntivideo/.test(obj.mimeType || obj.MimeType)) {
						if (!Ext.isEmpty(obj.sources)) {
							src = obj.sources.first();
						}
					}

					if (src) {
						return me.getCurrent()
								.then(function(current) {
									return {
										thumbnail: src.thumbnail,
										name: current,
										source: src
									};
								});
					}

					return {};
				});
	},


	getContext: function() {
		var me = this;

		return this.getMeta()
			.then(this.__loadContextFromMeta.bind(this))
			.fail(this.__loadContextFromObj.bind(this));
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
