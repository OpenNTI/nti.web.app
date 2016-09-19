var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var MixinsRouter = require('../../mixins/Router');
var MixinsState = require('../../mixins/State');
var PathActions = require('../navigation/path/Actions');
var PartsTranscript = require('./components/reader/parts/Transcript');
var MediaviewerActions = require('./Actions');
var ComponentsView = require('./components/View');
const { decodeFromURI } = require('nti-lib-ntiids');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-window-view',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	layout: 'none',

	initComponent: function (argument) {
		this.callParent(argument);

		this.initRouter();

		this.PathActions = NextThought.app.navigation.path.Actions.create();
		this.MediaActions = NextThought.app.mediaviewer.Actions.create();
		this.LibraryActions = NextThought.app.library.Actions.create();
		this.addRoute('/:id', this.showMediaView.bind(this));
		this.addDefaultRoute(this.showVideoGrid.bind(this));
		this.__addKeyMapListeners();
	},

	showMediaView: function (route, subRoute) {
		var basePath = route.precache.basePath,
			rec = route.precache.rec || (route.object.id && decodeFromURI(route.object.id)) || null,
			options = route.precache.options || {},
			me = this, id;

		id = decodeFromURI(route.params.id);

		if (Ext.isEmpty(basePath)) {
			basePath = this.currentBundle.getContentRoots()[0];
		}

		if (this.activeMediaView && (this.mediaId === id)) {
			// We are already there.
			this.activeMediaView.hideGridViewer();
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
				.then(function (video) {
					me.video = video;
					me.videoId = me.mediaId;
					me.slidedeckId = me.video.get('slidedeck') || '';

					if(me.slidedeckId) {
						me.__presentSlidedeck(me.slidedeckId, null, options);
					} else {
						delete me.slidedeck;
						delete me.slidedeckId;

						me.__presentVideo(me.mediaId, basePath, options);
					}
				})
				.catch(function () {
					me.__presentSlidedeck(me.mediaId, null, options);
				});
		}
	},

	__presentVideo: function (videoId, basePath, options) {
		var me = this, prec = Promise.resolve();

		if(options.rec) {
			prec = options.rec.isModel ? Promise.resolve(options.rec) : Service.getObject(options.rec);
		}

		Promise.all([
			me.resolveVideo(videoId),
			prec
		])
		.then(([videoRec, record]) => {
			if(record) {
				options.rec = record;
			}
			me.video = videoRec;
			me.transcript = NextThought.model.transcript.TranscriptItem.fromVideo(me.video, basePath);
			me.activeMediaView.setContent(me.video, me.transcript, options);
		});
	},

	__presentSlidedeck: function (slidedeckId, slidedeck, options) {
		var me = this,
			p = slidedeck && slidedeck.isModel ? Promise.resolve(slidedeck) : Service.getObject(slidedeckId),
			prec = Promise.resolve();

		if(options.rec) {
			prec = options.rec.isModel ? Promise.resolve(options.rec) : Service.getObject(options.rec);
		}

		Promise.all([
			p,
			prec
		])
		.then(([deck, record]) => {
			if(record) { options.rec = record; }

			me.slidedeck = deck;
			me.slidedeckId = slidedeckId;
			delete me.video;
			delete me.videoId;

			me.MediaActions.buildSlidedeckPlaylist(deck)
				.then((obj) => {
					me.activeMediaView.setSlidedeckContent(deck, obj.videos, obj.items, options);
				});
		});
	},

	showVideoGrid: function (route, subRoute) {
		//TOOD: not yet handled
		console.error('route not yet implemented: ', arguments);
	},

	__addKeyMapListeners: function () {
		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.exitViewer,
				scope: this
			}]
		});

		this.on('destroy', function () {keyMap.destroy(false);});
	},

	afterRender: function () {
		this.callParent(arguments);
		this.maybeMask();
	},

	destroy: function () {
		this.activeMediaView.destroy();
		this.callParent(arguments);
	},

	allowNavigation: function () {
		var me = this;

		return !me.activeMediaView || me.activeMediaView.allowNavigation();
	},

	resolveVideo: function (id) {
		var me = this, video;

		if (!id || !this.currentBundle) {
			return Promise.reject();
		}

		if (me.video && me.video.isModel && me.video.getId() === id) {
			return Promise.resolve(me.video);
		}

		return me.currentBundle.getVideoForId(id)
			.then(function (o) {
				if (!o) {
					return Service.getObject(id);
				}

				video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
				return video;
			});
	},

	getContext: function () {
		var me = this;

		return me.resolveVideo(me.mediaId)
				.catch(function () {
					if (me.slidedeck && me.slidedeck.getId() === me.mediaId) {
						return me.slidedeck;
					}

					return Service.getObject(me.mediaId);
				});
	},

	containsId: function (contextRecord, id) {
		var result = false;
		if (contextRecord.getId() === this.slidedeckId) {
			result = this.slidedeck.containsSlide(id);

			if (!result) {
				result = this.slidedeck.containsVideo(id);
			}
		}
		return result;
	},

	bundleChanged: function (bundle) {
		if (bundle && bundle !== this.currentBundle) {
			// TODO: Do more, maybe?
			this.currentBundle = bundle;
		}
	},

	maybeMask: function () {
		if (!this.rendered || this.hasCls('loading')) {
			return;
		}

		this.addCls('loading');
		this.el.mask('Loading media viewer comtents...', 'loading');
	},

	maybeUnmask: function () {
		if (this.rendered) {
			this.removeCls('loading');
			this.el.unmask();
		}
	},

	exitViewer: function () {
		var me = this,
			mediaId = this.videoId || this.slidedeckId;

		me.PathActions.getPathToObject(mediaId, this.currentBundle)
			.then(function (path) {
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
			.catch(function () {
				return Ext.isEmpty(me.parentLesson) ? Promise.reject() : me.__navigateToParent(me.parentLesson);
			})
			.catch(function () {
				me.pushRootRoute('Library', '/library');
			});
	},

	__navigateToParent: function (lesson) {
		var me = this;

		return new Promise(function (fulfill, reject) {
			me.PathActions.getPathToObject(lesson)
				.then(function (path) {
					if (path) {
						// Get rid of the pageInfo part,
						// since we want to navigate to the CourseOutlineNode.
						path.pop();
						me.Router.root.attemptToNavigateToPath(path);
						fulfill();
					}
				})
				.catch(reject);
		});
	}
});
