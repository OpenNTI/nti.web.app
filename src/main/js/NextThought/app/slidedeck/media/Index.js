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
		var videoId = route.params.id,
			basePath = route.precache.basePath,
			rec = route.precache.rec,
			options = route.precache.options || {},
			me = this;

		videoId = ParseUtils.decodeFromURI(videoId);
		options.rec = rec;
		this.video = route.precache.video;

		if(!me.activeMediaView) {
			me.activeMediaView = Ext.widget('media-view', {
				currentBundle: me.currentBundle,
				autoShow: true,
				handleNavigation: me.handleNavigation.bind(me),
				parentContainer: this
			});
		}

		if (this.video && this.video.isModel) {
			if(!basePath && basePath != "") {
				basePath = me.currentBundle.getContentRoots()[0];					
			}

			me.transcript = NextThought.model.transcript.TranscriptItem.fromVideo(this.video, basePath);
			me.activeMediaView.setContent(this.video, me.transcript, options);
		}
		else{
			this.LibraryActions.getVideoIndex(me.currentBundle)
				.then(function(videoIndex) {
					var o = videoIndex[videoId];
					if (!o) { return; }

					basePath = me.currentBundle.getContentRoots()[0];
					me.video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
					me.transcript = NextThought.model.transcript.TranscriptItem.fromVideo(me.video, basePath);
					
					me.activeMediaView.setContent(me.video, me.transcript, options);
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


	getContext: function() {
		return this.video;
	},


	bundleChanged: function(bundle){
		if(bundle && bundle !== this.currentBundle) {
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