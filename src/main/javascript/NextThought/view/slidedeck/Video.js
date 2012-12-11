Ext.Loader.loadScript({
	url:'//www.youtube.com/iframe_api',
	onError:function(){console.error('YouTube API failed to load');},
	onLoad:function(){console.log('YouTube API loaded');}
});

Ext.define('NextThought.view.slidedeck.Video',{
	extend: 'Ext.Component',
	alias: 'widget.slidedeck-video',

	plain: true,
	ui: 'slidedeck-video',

	YOUTUBE_URL_PATTERN: '//www.youtube.com/embed/{0}?enablejsapi=1&playerapiid={1}&origin={2}',

	renderTpl: Ext.DomHelper.markup([{
		cls: 'video-wrapper', cn: [{
			//YouTube's player will replace this div and copy all its attributes
			/*tag: 'iframe',*/ cls:'video', name: 'slide-video', id: '{id}-youtube-video',
			frameBorder: 0, scrolling: 'no', seamless: true
		},{
			tag: 'iframe', cls:'video', name: 'slide-video', id: '{id}-vimeo-video',
			frameBorder: 0, scrolling: 'no', seamless: true
		},{
			tag: 'video', cls: 'video', name: 'slide-video', id: '{id}-native-video'
		},{
			cls: 'video placeholder', name: 'slide-video', id: '{id}-curtain'
		}]
	},{
		cls: 'video-checkbox',
		html: 'Synchronize video with slides',
		tabIndex: 0,
		role: 'button'
	}]),

	// YouTube: https://developers.google.com/youtube/iframe_api_reference
	// Embed Code: http://www.youtube.com/embed/VIDEO_ID?enablejsapi=1&playerapiid=player_id&origin=http://example.com
	// use ytPlayer.at(millies,callback)

	// Vimeo: http://developer.vimeo.com/player/js-api
	// https://github.com/vimeo/player-api/tree/master/javascript
	//  or direct postMessages: http://jsfiddle.net/bdougherty/UTt2K/light/

	// Embed Code: http://player.vimeo.com/video/VIDEO_ID?api=1&player_id=player_id
	// use event "playProgress" and keep track of our times to fire an event like "at" for youtube.


	renderSelectors: {
		checkboxEl: 'div.video-checkbox'
	},


	initComponent: function(){
		this.callParent(arguments);
		//default the value
		if(typeof(this.synchronizeWithSlides) !== 'boolean'){
			this.synchronizeWithSlides = true;
		}

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
	},


	afterRender: function(){
		this.callParent(arguments);

		function enterFilter(e) { var k = e.getKey(); return (k === e.ENTER || k === e.SPACE); }

		this.updateCheckbox();

		this.mon(this.checkboxEl,{
			scope:this,
			click:this.checkboxClicked,
			keydown: Ext.Function.createInterceptor(this.checkboxClicked,enterFilter,this,null)
		});

		this.players.youtube = new YT.Player(this.playerIds.youtube, {
			//videoId: 'u1zgFlCw8Aw',
			height: '221',
			width: '392',
			playerVars: {
				autohide: 1,
				modestbranding: 1,
				rel: 0,
				showinfo: 0
			},
			events: {
				'onReady': Ext.bind(this.youtubePlayerReady,this)
			}
		});

		this.maybeSwitchPlayers(null);
	},


	updateCheckbox: function(){
		this.checkboxEl[this.synchronizeWithSlides?'addCls':'removeCls']('checked');
	},


	checkboxClicked: function(){
		this.synchronizeWithSlides = !this.synchronizeWithSlides;
		this.updateCheckbox();
	},


	youtubePlayerReady: function(){
		this.players.youtube.isReady = true;
		var q = this.commandQueue.youtube;
		while(q.length>0){
			Ext.callback(this.issueCommand,this, q.shift());
		}
	},


	issueCommand: function(target, command, args){
		var t = this.players[target];
		if(!t.isReady){
			this.commandQueue[target].push([target,command,args]);
			return null;
		}
		return Ext.callback(t[command],t,args);
	},


	stopPlayback: function(){
		this.currentVideoId = null;
		this.issueCommand('youtube','clearVideo');
		//this.issueCommand('vimeo','stop');
		//this.issueCommand('html5','stop');
	},


	setVideoAndPosition: function(videoId,startAt){
		if(this.currentVideoId ===videoId){
			this.issueCommand('youtube','seekTo',[startAt,true]);
		}
		else {
			this.currentVideoId = videoId;
			if(videoId){
				this.issueCommand('youtube','loadVideoById',[videoId, startAt, "medium"]);
			}
			else {
				this.stopPlayback();
			}
		}

		this.issueCommand('youtube','pauseVideo');
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


	//called by the event of selecting something in the slide queue.
	updateVideoFromSelection: function(queueCmp, slide){

		var startTime = slide.get('video-start') || 0,
			videoId = slide.get('video') || null,
			videoService = slide.get('video-type') || null;


		console.log(videoService, videoId, startTime);

		this.maybeSwitchPlayers(videoService);
		this.setVideoAndPosition(videoId,startTime);

		//Hide player?
		/*
		if(!videoService){
			this.hide();
		} else if(!this.isVisible()){
			this.show();
		}
		*/
	}
});
