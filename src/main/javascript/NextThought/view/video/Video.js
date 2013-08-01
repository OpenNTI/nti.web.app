/*jslint */
/*globals Globals, NextThought, ObjectUtils, YT */
Ext.define('NextThought.view.video.Video',{
	extend: 'Ext.Component',
	alias: 'widget.content-video',

	requires: [
		'NextThought.util.Globals',
		'NextThought.util.media.HTML5Player',
		'NextThought.util.media.YouTubePlayer',
		'NextThought.model.PlaylistItem'
	],

	ui: 'content-video',
	cls: 'content-video',

	listeners: {
		destroy: 'cleanup',
		'player-ready': 'playerReady',
		'player-error': 'playerError'
	},

	states: {
		UNSTARTED: -1,
		ENDED: 0,
		PLAYING: 1,
		PAUSED: 2,
		BUFFERING: 3,
		CUED: 5
	},

	loadFirstEntry: true,
	playerWidth: 640,
	playerHeight: function(){
		return Math.round(this.playerWidth * 0.5625);
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
			{ cls: 'video placeholder', name: 'video', id: '{id}-curtain'}
		]}
	]),


	onClassExtended: function(cls, data, hooks) {
		var onBeforeClassCreated = hooks.onBeforeCreated;

		//merge with subclass's render selectors
		data.listeners = Ext.applyIf(data.listeners||{},cls.superclass.listeners);
		if(data.cls){
			data.cls = [cls.superclass.cls,data.cls].join(' ');
		}

		hooks.onBeforeCreated = function(cls, data) {
			if(data.cls){
				data.cls = [cls.superclass.cls,data.cls].join(' ');
			}
			data.listeners = Ext.applyIf(data.listeners||{},cls.superclass.listeners);
			onBeforeClassCreated.call(this, cls, data, hooks);
		};
	},


	constructor: function(config){
		this.playerWidth = config.width || config.playerWidth || this.playerWidth;
		Ext.apply(config,{
			width: this.playerWidth,
			height: this.playerHeight
		});
		this.callParent([config]);
	},


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
		Ext.defer(this.updateLayout, 1, this);

		console.log('Players initialized.');

//		If loadFirstEntry is true, we load the first playlist entry. For some subclasses this behavior is not desired.
		if(this.loadFirstEntry){
			this.activeVideoService = this.playlist[this.playlistIndex].activeSource().service;
			this.maybeSwitchPlayers(this.activeVideoService);
			this.setVideoAndPosition(this.playlist[this.playlistIndex].activeSource().source);
		}
		else{
//			Set the curtain as the active player while we figure out which other one to use.
			this.maybeSwitchPlayers('none');
		}
	},


	playerSetup: function(){
		console.log('Initializing the players.');
		if(window.YT){
			this.players.youtube = new NextThought.util.media.YouTubePlayer({
				el: Ext.get(this.el.down('.video-wrapper')),
				parentId: this.id,
				width: this.playerWidth,
				height: this.playerHeight,
				parentComponent: this
			});
			this.playerIds.youtube = this.players.youtube.id;
		}
		else if (!Ext.Array.contains(this.self.playerBlacklist, 'youtube')){
			this.self.playerBlacklist.push('youtube');
		}

		this.players.html5 = new NextThought.util.media.HTML5Player({
			el: Ext.get(this.el.down('.video-wrapper')),
			parentId: this.id,
			width: this.playerWidth,
			height: this.playerHeight,
			parentComponent: this
		});
		this.playerIds.html5 = this.players.html5.id;

		this.players.none = {};
		this.players.none.isReady = false;
	},


	playerError: function(player){
		this.self.playerBlacklist.push(player);
		this.playlistSeek(this.playlistIndex);
	},


	playerReady: function(player){
		var q = this.commandQueue[player];
		while(q.length>0){
			Ext.callback(this.issueCommand,this, q.shift());
		}
	},


	isPlaying: function(){
		var status = this.queryPlayer(),
			state;
		if(!status) { return false; }

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
			time: this.issueCommand(target,'getCurrentTime'),
			state: this.issueCommand(target,'getPlayerState')
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
		this.fireEvent('player-command-'+command);
		return call(t[command],t,args);
	},


	stopPlayback: function(){
		this.currentVideoId = null;

		if(this.activeVideoService){
			this.issueCommand(this.activeVideoService,'stop');
		}
	},


	pausePlayback: function(){
		if(this.activeVideoService && this.isPlaying()){
			this.issueCommand(this.activeVideoService,'pause');
			return true;
		}
		return false;
	},

	resumePlayback: function(){
		if(this.activeVideoService && !this.isPlaying()){
			this.issueCommand(this.activeVideoService,'play');
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
			this.issueCommand(this.activeVideoService,'seek', [startAt,true]);
		}
		else {
			this.currentVideoId = videoId;
			if(videoId){
				this.issueCommand(this.activeVideoService,'load', [videoId, startAt, "medium"]);
			}
			else {
				console.log('stopping');
				this.stopPlayback();
			}
		}

		if(pause || !videoId){ console.log('pausing'); this.issueCommand(this.activeVideoService,'pause'); }
		else{ this.issueCommand(this.activeVideoService,'play'); }
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
			if(this.playlistIndex !== newIndex){
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
			}
			return this.resumePlayback();
		}
		return false;
	},


	playlistNext: function(){
		this.playlistSeek(this.playlistIndex + 1);
	},


	playlistPrevious: function(){
		this.playlistSeek(this.playlistIndex - 1);
	},

	cleanup: function(){
		this.issueCommand('html5','pause');
		this.issueCommand('youtube','pause');
		this.issueCommand('html5','cleanup');
		this.issueCommand('youtube','cleanup');
	}
},
	function(){
		ObjectUtils.defineAttributes(this.prototype, {
			playerHeight: {getter: this.prototype.playerHeight}});
	}
);
