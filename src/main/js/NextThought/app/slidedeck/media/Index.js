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
		this.addRoute('/:id', this.showVideoViewer.bind(this));
		this.addDefaultRoute(this.showVideoGrid.bind(this));
	},

	showVideoViewer: function(route, subRoute) {
		var videoId = route.params.id,
			video = route.precache.video,
			basePath = route.precache.basePath,
			rec = route.precache.rec,
			options = route.precache.options || {},
			transcript, me = this;

		videoId = ParseUtils.decodeFromURI(videoId);
		options.rec = rec;

		// Cache the lesson if it was passed to us.
		me.lesson = route.precache.lesson;

		if (video && video.isModel) {
			if(!basePath && basePath != "") {
				basePath = me.currentBundle.getContentRoots()[0];					
			}

			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
			me.setContent(video, transcript, options);
		}
		else{
			this.LibraryActions.getVideoIndex(me.currentBundle)
				.then(function(videoIndex) {
					var o = videoIndex[videoId];
					if (!o) { return; }

					basePath = me.currentBundle.getContentRoots()[0];
					video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
					transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
					
					me.setContent(video, transcript, options);
				});
		}
	}
});