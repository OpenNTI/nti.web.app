/*jslint */
/*globals Globals, NextThought, YT */
Ext.define('NextThought.util.media.YouTubePlayer',{

	statics:{
		kind:'video',
		type: 'youtube',
		valid: function(){
			return Boolean(window.YT);
		}
	},

	requires: [
		'NextThought.util.Globals'
	],

	mixins: {
		observable: 'Ext.util.Observable'
	},

	playerTpl: Ext.DomHelper.createTemplate({
		id: '{id}'
	}),

	constructor: function(config){
		this.mixins.observable.constructor.call(this);
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId+'-youtube-video';
		this.player = null;
		this.width = config.width;
		this.height = config.height;

		this.playerSetup();
	},


	playerSetup: function(){
		this.isReady = false;

//		Inject Youtube HTML
		this.playerTpl.append(this.parentEl, {id: this.id});
		console.log(this.id);

		this.player = new YT.Player(this.id, {
			width: this.width,
			height: this.height,
			playerVars: {
				modestbranding: 1,
				autohide: 1,
				wmode: 'transparent',
				rel: 0,
				showinfo: 0
			},
			origin: location.protocol+'//'+location.host,
			events: {
				'onReady': Ext.bind(this.playerReady, this),
				'onError': Ext.bind(this.playerError, this)
			}
		});
	},

	playerReady: function(){
		this.isReady = true;
		this.fireEvent('player-ready', 'youtube');
	},

	playerError: function(error){
		var oldSource;
		console.warn('YouTube player died with error: ' + error.data);

		if(error.data === 2){
			console.log('Data Dump: ',this.currentSource,error);
			this.cleanup();
			return;
		}

//		SAJ: If we receive error 5 from YouTube that is mostly likely due to a bad
//		interaction with the browsers built-in HTML5 player, so lets try, try again.
//		SAJ: We should probably also give up after X tries and just go to the next source
//		or playlist entry.
		if (error.data === 5){
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
			this.fireEvent('player-error', 'youtube');
		}
	},

	getCurrentTime: function(){
		return this.player.getCurrentTime();
	},

	getPlayerState: function(){
		return this.player.getPlayerState();
	},

	load: function(source, offset){
		this.currentSource = source;
		this.currentStartAt = offset;
		this.player.cueVideoById({
			videoId:source,
			startSeconds:offset,
			suggestedQuality:"medium"
		});
	},

	play: function(){
		this.player.playVideo();
	},

	pause: function(){
		this.player.pauseVideo();
	},

	seek: function(offset, seekAhead){
		this.currentStartAt = offset;
		this.player.seekTo(offset, seekAhead);
	},

	stop: function(){
		this.player.clearVideo();
	},

	cleanup: function(){
		var el = Ext.get(this.id);
		this.stop();
		this.isReady = false;
		el.clearListeners();
		Ext.destroy(el);
	}
}, function(){
	Globals.loadScript(location.protocol+"//www.youtube.com/iframe_api");
});
