export default Ext.define('NextThought.app.mediaviewer.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-window-view',

	requires: [
		'NextThought.app.navigation.path.Actions',
		'NextThought.app.mediaviewer.components.reader.parts.Transcript',
		'NextThought.app.mediaviewer.Actions',
		'NextThought.app.mediaviewer.components.View'
	],

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	layout: 'none',

	initComponent: function(argument) {
		this.callParent(argument);

		this.initRouter();

		this.PathActions = NextThought.app.navigation.path.Actions.create();
		this.MediaActions = NextThought.app.mediaviewer.Actions.create();
		this.LibraryActions = NextThought.app.library.Actions.create();
		this.addRoute('/:id', this.showMediaView.bind(this));
		this.addDefaultRoute(this.showVideoGrid.bind(this));
		this.__addKeyMapListeners();
	},


	showMediaView: function(route, subRoute) {
		var basePath = route.precache.basePath,
			rec = route.precache.rec,
			options = route.precache.options || {},
			me = this, id;

		id = ParseUtils.decodeFromURI(route.params.id);

		if (this.activeMediaView && (this.mediaId === id)) {
			// We are already there.
			return Promise.resolve();
		}

		this.mediaId = id;
		options.rec = rec;

		if (route.precache.video) {
			this.video = route.precache.video;
			this.videoId = this.mediaId;
		}
		if (route.precache.slidedeck) {
			this.slidedeck = route.precache.slidedeck;
			this.slidedeckId = this.mediaId;
		}

		if (!me.activeMediaView) {
			me.activeMediaView = Ext.widget('media-view', {
				currentBundle: me.currentBundle,
				autoShow: true,
				handleNavigation: me.handleNavigation.bind(me),
				parentContainer: this
			});
		}

		if (this.video && this.video.getId() === this.mediaId) {
			this.__presentVideo(this.videoId, basePath, options);
		}
		else if (this.slidedeck && this.slidedeck.getId() === this.mediaId) {
			this.__presentSlidedeck(this.slidedeckId, this.slidedeck, options);
		}
		else {
			this.resolveVideo(this.mediaId)
				.then(function(video) {
					me.video = video;
					me.videoId = me.mediaId;
					delete me.slidedeck;
					delete me.slidedeckId;

					me.__presentVideo(me.mediaId, basePath, options);
				})
				.fail(function() {
					me.__presentSlidedeck(me.mediaId, null, options);
				});
		}
	},


	__presentVideo: function(videoId, basePath, options) {
		var me = this;
		me.resolveVideo(videoId)
			.then(function(videoRec) {
				me.video = videoRec;

				if (!Ext.isEmpty(basePath)) {
					basePath = me.currentBundle.getContentRoots()[0];
				}

 				me.transcript = NextThought.model.transcript.TranscriptItem.fromVideo(me.video, basePath);
				me.activeMediaView.setContent(me.video, me.transcript, options);
			});
	},


	__presentSlidedeck: function(slidedeckId, slidedeck, options) {
		var me = this,
			p = slidedeck && slidedeck.isModel ? Promise.resolve(slidedeck) : Service.getObject(slidedeckId);

		p.then(function(deck){
			me.slidedeck = deck;
			me.slidedeckId = slidedeckId;
			delete me.video;
			delete me.videoId;

			me.MediaActions.buildSlidedeckPlaylist(deck)
				.then( function(obj) {
					me.activeMediaView.setSlidedeckContent(deck, obj.videos, obj.items, options);
				});
		});
	},


	showVideoGrid: function(route, subRoute) {
		//TOOD: not yet handled
		console.error('route not yet implemented: ', arguments);
	},


	__addKeyMapListeners: function() {
		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.exitViewer,
				scope: this
			}]
		});

		this.on('destroy', function() {keyMap.destroy(false);});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.maybeMask();
	},


	destroy: function() {
		this.activeMediaView.destroy();
		this.callParent(arguments);
	},


	allowNavigation: function() {
		var me = this;

		return !me.activeMediaView || me.activeMediaView.allowNavigation();
	},


	resolveVideo: function(id) {
		var me = this, video, basePath;

		if (!id || !this.currentBundle) {
			return Promise.reject();
		}

		if (me.video && me.video.isModel && me.video.getId() === id) {
			return Promise.resolve(me.video);
		}

		return new Promise(function(fulfill, reject) {
			me.LibraryActions.getVideoIndex(me.currentBundle)
				.then(function(videoIndex) {
					var o = videoIndex[id];
					if (!o) { return reject(); }

					basePath = me.currentBundle.getContentRoots()[0];
					video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
					fulfill(video);
				});
		});
	},


	getContext: function() {
		var me = this;
		return new Promise(function(fulfill) {
			me.resolveVideo(me.mediaId)
				.then(fulfill)
				.fail(function() {
					if (me.slidedeck && me.slidedeck.getId() === me.mediaId) {
						fulfill(me.slidedeck);
						return;
					}

					Service.getObject(me.mediaId).then(fulfill);
				});
		});
	},


	containsId: function(contextRecord, id) {
		var result = false;
		if (contextRecord.getId() === this.slidedeckId) {
			result = this.slidedeck.containsSlide(id);

			if (!result) {
				result = this.slidedeck.containsVideo(id);
			}
		}
		return result;
	},


	bundleChanged: function(bundle) {
		if (bundle && bundle !== this.currentBundle) {
			// TODO: Do more, maybe?
			this.currentBundle = bundle;
		}
	},


	maybeMask: function() {
		if (!this.rendered || this.hasCls('loading')) {
			return;
		}

		this.addCls('loading');
		this.el.mask('Loading media viewer comtents...', 'loading');
	},


	maybeUnmask: function() {
		if (this.rendered) {
			this.removeCls('loading');
			this.el.unmask();
		}
	},


	exitViewer: function() {
		var me = this,
			mediaId = this.videoId || this.slidedeckId;

		this.goToParentLesson()
			.fail(function() {
				me.PathActions.getPathToObject(mediaId)
					.then(function(path) {
						var i,
							parentPath = [];

						for (i = 0; i < path.length; i++) {
							if (path[i].get('NTIID') === mediaId) {
								break;
							}

							parentPath.push(path[i]);
						}

						me.Router.root.attemptToNavigateToPath(parentPath);
					})
					.fail(function() {
						me.pushRootRoute('Library', '/library');
					});
			});
	},



	/**
	 * This function provides a way to go to the parent lesson.
	 * Now, it's mainly used by the Slidedeck, since its libraryPath is not correct
	 * For videos, we will resolve the parent lesson based on their library path.
	 * @return {[type]} [description]
	 */
	goToParentLesson: function() {
		var me = this;

		// video object know how to get the parent path.
		if (!this.parentLesson || this.videoId) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			me.PathActions.getPathToObject(me.parentLesson)
				.then(function(path) {
					if (path) {
						// Get rid of the pageInfo part,
						// since we want to navigate to the CourseOutlineNode.
						path.pop();
						me.Router.root.attemptToNavigateToPath(path);
						fulfill();
					}
				})
				.fail(reject);
		});
	}
});
