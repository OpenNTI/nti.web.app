/*jslint */
/*globals Globals, LocationProvider, NextThought, YT */
Ext.define('NextThought.view.video.Video',{
	extend: 'Ext.Component',
	alias: 'widget.content-video',

	requires: [
		'NextThought.model.PlaylistItem'
	],

	ui: 'content-video',
	cls: 'content-video',

	listeners: {
		destroy: 'cleanup'
	},

	states: {
		UNSTARTED: -1,
		ENDED: 0,
		PLAYING: 1,
		PAUSED: 2,
		BUFFERING: 3,
		CUED: 5
	},

	commands: {
		'cleanup': {
			'youtube': 'clearVideo',
			'html5': 'cleanup'
		},
		'getCurrentTime': {
			'youtube' : 'getCurrentTime',
			'html5': 'getCurrentTime'
		},
		'getPlayerState': {
			'youtube' : 'getPlayerState',
			'html5': 'getPlayerState'
		},
		load: {
			'youtube' : 'loadVideoById',
			'html5': 'load'
		},
		play: {
			'youtube' : 'playVideo',
			'html5': 'play'
		},
		pause: {
			'youtube' : 'pauseVideo',
			'html5': 'pause'
		},
		seek: {
			'youtube' : 'seekTo',
			'html5': 'seek'
		},
		stop: {
			'youtube' : 'clearVideo',
			'html5': 'stop'
		}
	},

	renderTpl: Ext.DomHelper.markup([
//		SAJ: Template lines are commented out because the video frame has not been styled yet.
//		{ cls: 'meta', cn: [
//			{ cls:'title', html:'{title}' },
//			{ cls:'description', html:'{description}' }
//		]},
		{ cls: 'video-wrapper', cn: [
			{ tag: 'iframe', cls:'video', name: 'video', id: '{id}-vimeo-video',
				frameBorder: 0, scrolling: 'no', seamless: true
			},
			{ tag: 'video', cls: 'video', name: 'video', id: '{id}-native-video',
				'controls': '', 'width': '{html5-width}', 'height': '{html5-height}'
			},
			{ cls: 'video placeholder', name: 'video', id: '{id}-curtain'}
		]}
	]),


	initComponent: function(){
		Ext.applyIf(this, {playlist: []});

		this.playlist.getIds = function(s){
			var i = [];
			Ext.each(this,function(o){
				i.push.apply(i, o.getSources(s));
			});
			return i;
		};

		this.callParent(arguments);

		this.commandQueue = {
			'youtube': [],
			'vimeo': [],
			'html5': [],
			'none': []
		};

		this.playerIds = {
			'vimeo': this.id+'-vimeo-video',
			'html5': this.id+'-native-video',
			'none': this.id+'-curtain'
		};

		this.players = {};
		Ext.applyIf(this.self, {playerBlacklist: []});

		this.playlistIndex = 0;

		this.renderData = Ext.apply(this.renderData||{},this.data);

		Ext.applyIf(this.storedRenderData, this.renderData);

		this.activeVideoService = 'none';
		this.currentVideoId = null;

		this.taskMediaHeartBeat = {
			interval: 1000,
			scope: this,
			run: function(){this.fireEvent('media-heart-beat');},
			onError: function(){console.error(arguments);}
		};

		Ext.TaskManager.start(this.taskMediaHeartBeat);
		this.on('destroy',function cleanUpTask(){Ext.TaskManager.stop(this.taskMediaHeartBeat);});
	},


	initRenderData: function(){
		var ret;
		ret = this.callParent(arguments);
		this.storedRenderData = Ext.apply({}, ret);
		return ret;
	},


	afterRender: function(){
		this.callParent(arguments);

		this.playerSetup();

		console.log('Players initialized.');
//		Set the curtain as the active player while we figure out which other one to use.
		this.maybeSwitchPlayers('none');

//		SAJ: We really should not be doing this type of thing here. This will make much
// 		more sense when the event loop is moved here.
//
//		this.activeVideoService = this.playlist[this.playlistIndex].activeSource().service;
//		this.maybeSwitchPlayers(this.activeVideoService);
//		this.setVideoAndPosition(this.playlist[this.playlistIndex].activeSource().source);
	},


	playerSetup: function(){
		console.log('Initializing the players.');
		if(window.YT){
			this.youtubePlayerSetup();
		}
		else if (!Ext.Array.contains(this.self.playerBlacklist, 'youtube')){
			this.self.playerBlacklist.push('youtube');
		}

		this.players.html5 = new NextThought.util.HTML5Player({
			el: Ext.get(this.playerIds.html5)
		});

		this.players.none = {};
		this.players.none.isReady = false;
	},


	youtubePlayerSetup: function(){
		var youtubeTpl = Ext.DomHelper.createTemplate({
				tag: 'iframe', cls:'video', name: 'video', id: '{id}-youtube-video',
				frameBorder: 0, scrolling: 'no', seamless: true, width: '640', height: '360',
				src: location.protocol+'//www.youtube.com/embed/?{youtube-params}'
			}),
			pl = Ext.Array.unique(this.playlist.getIds('youtube')).join(','),
			params = [
				'html5=1',
				'enablejsapi=1',
				'autohide=1',
				'modestbranding=1',
				'wmode=transparent',
				'rel=0',
				'showinfo=0',
				'list='+encodeURIComponent(pl),
				'origin='+encodeURIComponent(location.protocol+'//'+location.host)
			];

// 		Inject Youtube HTML
		youtubeTpl.append(this.el.down('.video-wrapper'), {id: this.id, 'youtube-params': params});

//		Add the YouTube element id to the list
		this.playerIds.youtube = this.id+'-youtube-video';

		this.players.youtube = new YT.Player(this.playerIds.youtube, {
			html5: '1',
			enablejsapi: '1',
			autohide: '1',
			modestbranding: '1',
			wmode: 'transparent',
			rel: '0',
			showinfo: '0',
			list: pl,
			origin: location.protocol+'//'+location.host,
			events: {
				'onReady': Ext.bind(this.youtubePlayerReady,this),
				'onError': Ext.bind(this.youtubePlayerError, this)
			}
		});
		this.players.youtube.isReady = false;
	},


	youtubePlayerReady: function(){
		(this.players.youtube||{}).isReady = true;
		var q = this.commandQueue.youtube;
		while(q.length>0){
			Ext.callback(this.issueCommand,this, q.shift());
		}
	},


	youtubePlayerError: function(error){
		var oldVideoId;
		console.warn('YouTube player died with error: ' + error.data);

//		SAJ: If we receive error 5 from YouTube that is mostly likely due to a bad
//		interaction with the browsers built-in HTML5 player, so lets try, try again.
//		SAJ: We should probably also give up after X tries and just go to the next source
//		or playlist entry.
		if (error.data === 5){
			console.warn('There was an issue with the YouTube HTML5 player. Cleaning-up and trying again.');
			this.cleanup();
			Ext.destroy(Ext.get(this.playerIds.youtube));
			this.youtubePlayerSetup();
			oldVideoId = this.currentVideoId;
			this.currentVideoId = null;
			this.setVideoAndPosition(oldVideoId, this.currentStartAt);
			this.resumePlayback();
		}
		else {
			this.self.playerBlacklist.push('youtube');
			this.playlistSeek(this.playlistIndex);
		}
	},


	isPlaying: function(){
		var status = this.queryPlayer(),
			state;
		if(!status) { return null; }

		state = status.state;

		return state === 1 || state === 3;
	},


	queryPlayer: function(){
		var target = this.activeVideoService,
			t = this.players[target];
		if(!t || !t.isReady){
			return null;
		}

		return {
			service: target,
			video: this.currentVideoId,
			time: this.issueCommand(target,this.commands.getCurrentTime),
			state: this.issueCommand(target,this.commands.getPlayerState)
		};
	},


	issueCommand: function(target, command, args){
		var t = this.players[target];
		if(!t || !t.isReady){
			this.commandQueue[target].push([target,command,args]);
			return null;
		}

		function call(fn,o,args){
			if(!o || !Ext.isFunction(fn)){return null;}
			return fn.apply(o,args);
		}

		return call(t[command[target]],t,args);
	},


	stopPlayback: function(){
		this.currentVideoId = null;

		if(this.activeVideoService){
			this.issueCommand(this.activeVideoService,this.commands.stop);
		}
	},


	pausePlayback: function(){
		if(this.activeVideoService && this.isPlaying()){
			this.issueCommand(this.activeVideoService,this.commands.pause);
			return true;
		}
		return false;
	},

	resumePlayback: function(){
		if(this.activeVideoService && !this.isPlaying()){
			this.issueCommand(this.activeVideoService,this.commands.play);
			return true;
		}
		return false;
	},

	setVideoAndPosition: function(videoId,startAt){
		var pause = (this.isPlaying() === false),
			compareSources = NextThought.model.PlaylistItem.compareSources;

		// Save our the startAt value in case of failover
		this.currentStartAt = (startAt || 0);

		if(this.videoTriggeredTransition){
			delete this.videoTriggeredTransition;
			pause = false;
			if(compareSources(this.currentVideoId, videoId)){
				return;
			}
		}

		if(compareSources(this.currentVideoId, videoId)){
			this.issueCommand(this.activeVideoService,this.commands.seek, [startAt,true]);
		}
		else {
			this.currentVideoId = videoId;
			if(videoId){
				this.issueCommand(this.activeVideoService,this.commands.load, [videoId, startAt, "medium"]);
			}
			else {
				console.log('stopping');
				this.stopPlayback();
			}
		}

		if(pause || !videoId){ console.log('pausing'); this.issueCommand(this.activeVideoService,this.commands.pause); }
	},


	maybeSwitchPlayers: function(service){
		var me = this;

		service = service || 'none';
		if(!this.playerIds[service]){
			console.warn('Attempting to switch to non-existent player ' + service);
			service = 'none';
		}
		me.activeVideoService = service;

		Ext.Object.each(me.playerIds,function(k,id){
			var v = Ext.get(id);
			v.setVisibilityMode(Ext.dom.Element.DISPLAY);

			if(v.isVisible()){
				if(k!==service){ v.hide(); }
				//else leave it visible
			}
			//not visible
			else if(k===service){
				v.show();
				me.stopPlayback();
			}

		});

	},


	playlistSeek: function(newIndex){
		var source;
		if ((newIndex >= 0) && (newIndex < this.playlist.length) ){
			this.playlistIndex = newIndex;
			this.activeVideoService = this.playlist[this.playlistIndex].activeSource().service;
			while( Ext.Array.contains(this.self.playerBlacklist, this.activeVideoService) ){
				if(!this.playlist[this.playlistIndex].useNextSource()){
					this.activeVideoService = 'none';
					this.currentVideoId = null;
					this.maybeSwitchPlayers(this.activeVideoService);
					return;
				}
				this.activeVideoService = this.playlist[this.playlistIndex].activeSource().service;
			}
			source = this.playlist[this.playlistIndex].activeSource().source;
			this.maybeSwitchPlayers(this.activeVideoService);
			this.setVideoAndPosition(source, this.playlist[this.playlistIndex].get('start'));
			this.resumePlayback();
		}
	},


	playlistNext: function(){
		this.playlistSeek(this.playlistIndex + 1);
	},


	playlistPrevious: function(){
		this.playlistSeek(this.playlistIndex - 1);
	},

	cleanup: function(){
		this.issueCommand('html5',this.commands.pause);
		this.issueCommand('youtube',this.commands.pause);
		this.issueCommand('html5',this.commands.cleanup);
		this.issueCommand('youtube',this.commands.cleanup);
	}
}, function(){
	Globals.loadScript(location.protocol+"//www.youtube.com/iframe_api");
});
