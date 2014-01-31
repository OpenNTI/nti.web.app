/*jslint */
/*globals Globals, NextThought, YT */
Ext.define('NextThought.util.media.YouTubePlayer', {

	statics: {
		kind: 'video',
		type: 'youtube',
		valid: function() {
			return window.YT && this.apiReady;
		}
	},

	requires: [
		'NextThought.util.Globals'
	],


	mixins: {
		observable: 'Ext.util.Observable'
	},


	playerTpl: Ext.DomHelper.createTemplate({ id: '{id}' }),


	constructor: function(config) {
		this.mixins.observable.constructor.call(this);
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId + '-youtube-video';
		this.player = null;
		this.width = config.width;
		this.height = config.height;

		this.playerSetup();
	},


	playerSetup: function() {
		this.isReady = false;

    //		Inject Youtube HTML
		this.playerTpl.append(this.parentEl, {id: this.id});
		console.log(this.id);

		this.player = new YT.Player(this.id, {
			width: this.width,
			height: this.height,
			playerVars: {
				//html5: 1,
				modestbranding: 1,
				autohide: 1,
				wmode: 'transparent',
				rel: 0,
				showinfo: 0
			},
			origin: location.protocol + '//' + location.host,
			events: {
				'onReady': Ext.bind(this.playerReady, this),
				'onError': Ext.bind(this.playerError, this),
				'onStateChange': Ext.bind(this.playerStatusChange, this)
			}
		});
	},


	playerReady: function() {
		var me = this,
			state = NaN;

		//console.debug(this.id, 'PlayerReady called', this.onReadyLoadSource, arguments);
		this.isReady = true;
		this.fireEvent('player-ready', 'youtube');

		if (this.onReadyLoadSource) {
			Ext.defer(this.load, 1, this, [this.onReadyLoadSource]);
			delete this.onReadyLoadSource;
		}


		if (!this.skipPollingForChanges) {
			//Poll the damn thing, if it ever starts firing the event we stop polling.
			clearInterval(this.stateChangeChecker);
			this.stateChangeChecker = setInterval(function() {
				var p = me.player.getPlayerState();
				if (isNaN(state) || p !== state) {
					me.playerStatusChange({data: p, fromInterval: true});
					state = p;
				}
			},500);
		}
	},


	playerError: function(error) {
		var oldSource;
		console.warn('YouTube player died with error: ' + error.data);

		if (error.data === 2) {
			console.log('Data Dump: ', this.currentSource, error);
			this.cleanup();
			return;
		}

    //		SAJ: If we receive error 5 from YouTube that is mostly likely due to a bad
    //		interaction with the browsers built-in HTML5 player, so lets try, try again.
    //		SAJ: We should probably also give up after X tries and just go to the next source
    //		or playlist entry.
		if (error.data === 5) {
			console.warn('There was an issue with the YouTube HTML5 player. Cleaning-up and trying again.');
			this.cleanup();
			this.playerSetup();
			oldSource = this.currentSource;
			this.currentSource = null;
			this.load(oldSource, this.currentStartAt);
			this.resumePlayback();
		}
		else {
			console.warn('The YouTube Player experienced an unrecoverable error.');
			this.fireEvent('unrecoverable-player-error', 'youtube');
		}
	},


	playerStatusChange: function(event) {
		var type = '';
		switch (event.data) {
			case -1: type = 'unstarted'; break;
			case YT.PlayerState.ENDED: type = 'ended'; break;
			case YT.PlayerState.PLAYING: type = 'play'; this.userActivatedPlayer = true; break;
			case YT.PlayerState.PAUSED: type = 'pause'; break;
			case YT.PlayerState.BUFFERING: type = 'buffering'; break;
			case YT.PlayerState.CUED: type = 'cued'; this.playerReady(); break;
			default: console.log(event.data); return;
		}

		//This came from an event! stop our poll
		if (!event.fromInterval) {
			this.skipPollingForChanges = true;
			clearInterval(this.stateChangeChecker);//YouTube is sending us what we want.
		}

		this.fireEvent('player-event-' + type, this.id, this);
	},


	getCurrentTime: function() {
		return this.player.getCurrentTime();
	},


	getPlayerState: function() {
		return this.player.getPlayerState();
	},


	load: function(source, offset) {
		source = Ext.isArray(source) ? source[0] : source;
		var current = this.currentSource;

		this.currentSource = source;
		this.currentStartAt = offset;

		if (source === current) {
			this.seek(offset);
			return;
		}

		this.isReady = false;
		//The HTML5 YouTube video player doesn't seem to send status changes like the FlashYouTube player. :/
		// If you have an HTML5 player... this will not crash but will not hide the currtain either. TODO: figure out the player event api.
		console.debug(this.id, 'Loading...', source, 'ready=False');
		this.player.cueVideoById({ videoId: source, startSeconds: offset, suggestedQuality: 'medium' });
		this.pause(); //-- pause has zero effect since "ready is false"
	},


	play: function() {
		if (this.player.playVideo) {
			if (Ext.is.iOS && !this.userActivatedPlayer) {//we have to wait for the player to have been touched, but after that, we can interact with it just as normal.
				return;
			}
			this.player.playVideo();
		}
	},


	deactivate: function() {
		return this.pause.apply(this, arguments);
	},


	activate: function(sourceId) {
		console.log(this.id, 'Activate triggered');
		// save the source id to be loaded whenever we are ready.
		if (!this.isReady) {
			this.onReadyLoadSource = sourceId;
		}
	},


	pause: function() {
		if (!this.isReady) { return; }
		if (this.player.pauseVideo) {
			this.player.pauseVideo();
		}
	},


	seek: function(offset, seekAhead) {
		if (!this.isReady) { return;}
		this.currentStartAt = offset;
		this.player.seekTo(offset, seekAhead);
		this.pause();
	},


	stop: function() {
		if (this.player && this.player.stopVideo) {
			this.player.stopVideo();
			//this.player.clearVideo();
			//this.player.pauseVideo();
		}
	},


	cleanup: function() {
		var el = Ext.get(this.id);

		this.stop();

		this.isReady = false;
		clearInterval(this.stateChangeChecker);
		if (el) {
			el.clearListeners();
			Ext.destroy(el);
		}
	}

}, function() {
	var me = this;

	function onReady() {
		console.debug('YouTube API Ready');
		me.apiReady = true;
	}

	window.onYouTubeIframeAPIReady = Ext.Function.createSequence(onReady, window.onYouTubeIframeAPIReady, null);
	Globals.loadScript(location.protocol + '//www.youtube.com/iframe_api');
});
