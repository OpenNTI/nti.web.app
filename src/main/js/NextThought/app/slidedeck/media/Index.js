Ext.define('NextThought.app.slidedeck.media.Index', {
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

		this.LibraryActions = NextThought.app.library.Actions.create();
		this.addRoute('/:id', this.showMediaView.bind(this));
		this.addDefaultRoute(this.showVideoGrid.bind(this));
		this.__addKeyMapListeners();
	},

	
	showMediaView: function(route, subRoute) {
		debugger;
		var videoId = route.params.id,
			video = route.precache.video,
			basePath = route.precache.basePath,
			rec = route.precache.rec,
			options = route.precache.options || {},
			transcript, me = this;

		videoId = ParseUtils.decodeFromURI(videoId);
		options.rec = rec;

		if(!me.activeMediaView) {
			me.activeMediaView = Ext.widget('media-view', {
				currentBundle: me.currentBundle,
				autoShow: true,
				handleNavigation: me.handleNavigation.bind(me),
				parentContainer: this
			});
		}

		if (video && video.isModel) {
			if(!basePath && basePath != "") {
				basePath = me.currentBundle.getContentRoots()[0];					
			}

			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
			me.activeMediaView.setContent(video, transcript, options);
		}
		else{
			this.LibraryActions.getVideoIndex(me.currentBundle)
				.then(function(videoIndex) {
					var o = videoIndex[videoId];
					if (!o) { return; }

					basePath = me.currentBundle.getContentRoots()[0];
					video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
					transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
					
					me.activeMediaView.setContent(video, transcript, options);
				});
		}
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
		debugger;
		var me = this;
		
		if(me.activeMediaView.beforeClose() === false) {
			return;
		}

		if (this.handleClose) {
			wait(120)
				.then(me.handleClose.bind(me));
		}
	}
});