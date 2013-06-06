/*jslint */
/*globals LocationProvider, NextThought, YT */
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
			{ tag: 'iframe', cls:'video', name: 'video', id: '{id}-youtube-video',
				frameBorder: 0, scrolling: 'no', seamless: true, width: '640', height: '360',
				src: 'https://www.youtube.com/embed/?{youtube-params}'
			},
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
		var youtubeParams = [
			'html5=1',
			'enablejsapi=1',
			'autohide=1',
			'modestbranding=1',
			'rel=0',
			'showinfo=0',
			'origin='+encodeURIComponent(location.protocol+'//'+location.host)
		];

		this.callParent(arguments);

		this.commandQueue = {
			'youtube': [],
			'vimeo': [],
			'html5': []
		};

		this.playerIds = {
			'youtube': this.id+'-youtube-video',
			'vimeo': this.id+'-vimeo-video',
			'html5': this.id+'-native-video',
			'none': this.id+'-curtain'
		};

		this.players = {};

		Ext.applyIf(this, {playlist: []});

		this.playlist.getIds = function(s){
			var i = [];
			Ext.each(this,function(o){
				i.push.apply(i, o.getSources(s));
			});
			return i;
		};
		this.playlistIndex = 0;

		this.renderData = Ext.apply(this.renderData||{},this.data);
		this.renderData = Ext.apply(this.renderData,{
			'youtube-params':youtubeParams.join('&'),
			'html5-width': 640,
			'html5-height': 360
		});

		this.activeVideoService = 'none';
		this.currentVideoId = null;
	},

	afterRender: function(){
		this.callParent(arguments);

		if(window.YT){
			this.players.youtube = new YT.Player(this.playerIds.youtube, {
				events: {
					'onReady': Ext.bind(this.youtubePlayerReady,this),
					'onError': Ext.bind(this.youtubePlayerError, this)
				}
			});
		}
		else{
			this.youtubePlayerError();
		}

		this.players.html5 = new NextThought.util.HTML5Player({
			el: Ext.get(this.playerIds.html5)
		});

//		SAJ: We really should not be doing this type of thing here. This will make much
// 		more sense when the event loop is moved here.
//
//		this.activeVideoService = this.playlist[this.playlistIndex].activeSource().service;
//		this.maybeSwitchPlayers(this.activeVideoService);
//		this.setVideoAndPosition(this.playlist[this.playlistIndex].activeSource().source);
	},


	youtubePlayerReady: function(){
		(this.players.youtube||{}).isReady = true;
		var q = this.commandQueue.youtube;
		while(q.length>0){
			Ext.callback(this.issueCommand,this, q.shift());
		}
	},

	youtubePlayerError: function(){
		var currentItem = this.playlist[this.playlistIndex];

		currentItem.set('sourceIndex', currentItem.get('sourceIndex') + 1 );
		if (currentItem.get('sourceIndex') < currentItem.get('sources').length){
			this.activeVideoService = currentItem.activeSource().service;
		}
		else{
			this.activeVideoService = 'none';
		}

		this.maybeSwitchPlayers(this.activeVideoService);
		this.setVideoAndPosition(currentItem.activeSource().source, (this.currentStartAt || 0));
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
			this.commandQueue[target].push([target,command[target],args]);
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

		me.activeVideoService = service;

		service = service || 'none';

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

	cleanup: function(){
		this.issueCommand('html5',this.commands.cleanup);
		this.issueCommand('youtube',this.commands.cleanup);
	}
});
