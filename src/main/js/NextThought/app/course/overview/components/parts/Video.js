Ext.define('NextThought.app.course.overview.components.parts.Video', {
	extend: 'Ext.container.Container',
	alias: ['widget.course-overview-video', 'widget.course-overview-ntivideo'],

	statics: {
		isVideo: true
	},

	cls: 'overview-video',
	ui: 'course',
	layout: 'none',
	items: [],

	requires: [
		'NextThought.model.PlaylistItem',
		'NextThought.app.video.Video',
		'Ext.data.reader.Json',
		'NextThought.app.library.Actions',
		'NextThought.app.course.overview.components.parts.Curtain'
	],

	renderSelectors: {
		screenEl: '.video-player'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.videoPlayer = this.add({
			cls: 'video-player',
			xtype: 'container',
			layout: 'none',
			items: []
		});

		this.curtain = this.add({
			cls: 'curtain',
			xtype: 'container',
			layout: 'none',
			items: []
		});
	},

	constructor: function(){
		this.callParent(arguments);
		this.playerWidth = 512;

		if(!this.isVideoRoll){
			this.addCls('singular');
			this.playerWidth = 704;
		}

		this.getVideo()
			.then(this.addVideo.bind(this));
	},

	addVideo: function(video){
		this.video = video;
		var curtainClicked = this.curtainClicked.bind(this);

		this.playlist = [NextThought.model.PlaylistItem.create({
			'mediaId': this.video.title || this.video.get('title'),
			'sources': this.video.sources || this.video.get('sources'),
			'NTIID': this.video.ntiid || this.video.get('NTIID'),
			'slidedeck': this.video.slidedeck || (this.video.get && this.video.get('slidedeck')) || ''
		})];

		this.curtain.removeAll(true);
		this.curtain.add({
			xtype: 'course-overview-curtain',
			video: video,
			curtainClicked: curtainClicked
		});
	},

	getVideo: function(){
		var me = this;

		if(me.record){
			return me.course.getSlidedeckForVideo(me.record.ntiid || me.record.get('NTIID'))
				.then(function(slidedeck){
					me.record.slidedeck = slidedeck;
					return Promise.resolve(me.record);
				})
				.fail(function(){
					return Promise.resolve(me.record);
				});
		}

		// TODO: Get the video from the video index
	},

	curtainClicked: function(e){
		e.stopEvent();

		var video = this.playlist[0],
			slidedeck =  video.get('slidedeck'),
			slideActions;

		if (!Ext.isEmpty(slidedeck)) {
			this.maybePauseCurrentVideo();
			this.navigateToSlidedeck(slidedeck);
		} else if (e && e.getTarget('.edit')) {
			// TODO: Open Editing Video
			// this.WindowActions.showWindow('edit-video', null, null, {});
		} else if (!e.getTarget('.launch-player') && e.getTarget('.transcripts')) {
			this.maybePauseCurrentVideo();
			this.navigateToTarget(video, this.locationInfo.root);
		} else {
			this.maybeCreatePlayer();

			if (!this.video || !this.player) {
				console.warn('Ignoring on curtain click', this, this.video);
				return;
			}

			if (e && e.shiftKey && this.player.canOpenExternally()) {
				this.player.openExternally();
			} else {
				console.log('Masking z curtain');
				this.hideCurtain();
				this.player.resumePlayback(true);
			}
		}
	},

	hideCurtain: function(){
		this.curtain.hide();
	},

	showCurtain: function(){
		this.curtain.show();
		wait().then(this.setProgress.bind(this));
	},

	maybeCreatePlayer: function(){
		var single = this.isVideoRoll !== true;

		if (!this.rendered) {
			this.on({afterRender: Ext.bind(this.maybeCreatePlayer, this, arguments), single: true});
			return;
		}

		if (single) {
			this.removeCls('viewed');
		}

		if (this.player) {
			return;
		}

		console.error('CREATING PLAYER');

		this.showCurtain();

		var p = this.player = Ext.widget({
			xtype: 'content-video',
			playlist: this.playlist,
			renderTo: this.screenEl,
			playerWidth: this.playerWidth,
			floatParent: this,
			playlistIndex: 0
		});

		this.on({
			scope: p,
			beforedestroy: function() {
				return p.fireEvent('beforedestroy');
			},
			destroy: 'destroy'
		});

		this.mon(p, {
			'player-event-ended': 'showCurtain',
			'player-error': 'onPlayerError'
		});

		this.relayEvents(p, [
			'player-command-play',
			'player-command-stop',
			'player-command-pause',
			'player-event-play',
			'player-event-pause',
			'player-event-ended',
			'player-error'
		]);
	},

	maybePauseCurrentVideo: function(){
		if (!this.player) { return; }

		if (this.player.isPlaying()) {
			console.debug('Pausing video for media');
			this.player.pausePlayback();
		} else {
			console.warn('Player did not report being in a state where the media viewer would interfere');
		}

		if (this.hasCls('playing')) { return; }
	},

	navigateToTarget: function(videoItem, basePath) {
		if (!this.navigate) {
			console.error('No navigate set on content link');
			return;
		}

		var me = this;

		this.course.getVideoForId(videoItem.getId())
			.then(function(o) {
				var video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));
				video.basePath = basePath;
				me.navigate.call(null, video);
			});
	},

	navigateToSlidedeck: function(slidedeckId) {
		var me = this;
		if (slidedeckId) {
			Service.getObject(slidedeckId)
				.then(function(slidedeck) {
					me.navigate.call(null, slidedeck);
				});
		}
	},

	setProgress: function(progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress || !this.video) { return; }

		var me = this,
			single = this.isVideoRoll !== true;

		if (progress.hasBeenViewed(this.video.get('id'))) {
			if (single) {
				me.addCls('viewed');
			} else {
				this.video.set('viewed', true);
				this.video.set('viewedCls', 'viewed');
			}
		}
	}
});
