Ext.Loader.loadScript({
	url:'https://www.youtube.com/iframe_api',
	onError:function(){console.error('YouTube API failed to load');},
	onLoad:function(){console.log('YouTube API loaded');}
});

Ext.define('NextThought.view.slidedeck.Video',{
	extend: 'Ext.Component',
	alias: 'widget.slidedeck-video',

	requires:['swfobject'],

	plain: true,
	ui: 'slidedeck-video',

	states: {
		UNSTARTED: -1,
		ENDED: 0,
		PLAYING: 1,
		PAUSED: 2,
		BUFFERING: 3,
		CUED: 5
	},

	renderTpl: Ext.DomHelper.markup([{
		cls: 'video-wrapper', cn: [{
			tag: 'iframe', cls:'video', name: 'slide-video', id: '{id}-youtube-video',
			frameBorder: 0, scrolling: 'no', seamless: true,
			src: 'https://www.youtube.com/embed/?{youtube-params}'
		},{
			tag: 'iframe', cls:'video', name: 'slide-video', id: '{id}-vimeo-video',
			frameBorder: 0, scrolling: 'no', seamless: true
		},{
			tag: 'video', cls: 'video', name: 'slide-video', id: '{id}-native-video'
		},{
			cls: 'video placeholder', name: 'slide-video', id: '{id}-curtain'
		}]
	},{
		cls: 'controls',
		cn: [{
			cls: 'buttons',
			cn: [{ cls: 'next', tabIndex: 0 },{ cls: 'prev', tabIndex: 0 }]
		},{
			cls: 'video-checkbox',
			html: 'Link video with slides',
			tabIndex: 0,
			role: 'button'
		}]
	}]),

	// Vimeo: http://developer.vimeo.com/player/js-api
	// https://github.com/vimeo/player-api/tree/master/javascript
	//  or direct postMessages: http://jsfiddle.net/bdougherty/UTt2K/light/

	// Embed Code: http://player.vimeo.com/video/VIDEO_ID?api=1&player_id=player_id
	// use event "playProgress" and keep track of our times to fire an event like "at" for youtube.


	renderSelectors: {
		checkboxEl: 'div.video-checkbox',
		nextEl: 'div.next',
		prevEl: 'div.prev'
	},


	initComponent: function(){
		this.callParent(arguments);
		//default the value
		if(typeof(this.linkWithSlides) !== 'boolean'){
			this.linkWithSlides = true;
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

		//build playlist

		this.playlist = [];
		this.store.each(function(s){ this.playlist.push(this.getVideoInfoFromSlide(s)); },this);
		this.playlist.getIds = function(s){
			var i = []; Ext.each(this,function(o){
				if(!s || s=== o.service){i.push(o.id);}
			}); return i;
		};

		var pl = Ext.Array.unique(this.playlist.getIds('youtube')).join(','),
			params = [
			'html5=1',
			'enablejsapi=1',
			'autohide=1',
			'modestbranding=1',
			'rel=0',
			'showinfo=0',
			'list='+encodeURIComponent(pl),
			'origin='+encodeURIComponent(location.protocol+'//'+location.host)
		];

		this.renderData = Ext.apply(this.renderData||{},{
			'youtube-params':params.join('&')
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		function enterFilter(e) { var k = e.getKey(); return (k === e.ENTER || k === e.SPACE); }

		this.updateCheckbox();

		this.mon(this.nextEl,{
			scope:this.queue,
			click:this.queue.nextSlide,
			keydown: Ext.Function.createInterceptor(this.queue.nextSlide,enterFilter,this,null)
		});

		this.mon(this.prevEl,{
			scope:this.queue,
			click:this.queue.previousSlide,
			keydown: Ext.Function.createInterceptor(this.queue.previousSlide,enterFilter,this,null)
		});

		this.mon(this.checkboxEl,{
			scope:this,
			click:this.checkboxClicked,
			keydown: Ext.Function.createInterceptor(this.checkboxClicked,enterFilter,this,null)
		});


		this.players.youtube = new YT.Player(this.playerIds.youtube, {
			events: {
				'onReady': Ext.bind(this.youtubePlayerReady,this)
			}
		});

		this.maybeSwitchPlayers(null);

		this.taskVideoQuery = {
			interval: 1000,
			scope: this,
			run: this.videoQueryTask,
			onError: function(){console.error(arguments);}
		};

		Ext.TaskManager.start(this.taskVideoQuery);
		this.on('destroy',function cleanUpTask(){Ext.TaskManager.stop(this.taskVideoQuery);});
	},


	videoQueryTask: function videoQueryTask(){
		var s = this.queryPlayer(),
			pl= this.playlist,
			ix= this.playlistIndex,
			o= pl[ix],
			newIx;

		if(!s || !this.linkWithSlides){return;}

		if(!o || ix < 0) {
			console.warn("No playlist item", pl, ix);
			return;
		}

		if(this.queue.justChanged()){
			console.log('Slide just changed');
			return;
		}


		/**
		 * Note, this is simply polling the active player and searching the playlist (slides) for where it should go,
		 * and if it matches the current slide it stops.
		 *
		 * For Slides that jump around segments of a video in non-linear order and accounting for users jumping around
		 * the slides and/or video position this gets pretty complicated.  We don't fully handle all edge cases, this
		 * will probably end up with an over-arching timeline controlling everything. Still need to figure out how to
		 * hide the YouTube/Vimeo/etc player controls so that we an super-impose our own scrub bar to accomodate that.
		 *
		 * These current changes attempt to make IE happier. It was incorrectly jumping to various slides and was also
		 * failing to switch videos on slide change.
		 */

		if(s.state === this.states.PLAYING){

			console.log('[video status] service: '+ s.service
						+', state: '+s.state
						+', id: '+s.video
						+', time: '+s.time
						+', [slide start: '+o.start
						+', slide end: '+o.end+']');

			//for people who jump around...
			newIx = this.findPlaylistIndexFor(s.service, s.video, s.time);
			console.log('[playlist] new index '+newIx+', old index: '+ix);
			if(Ext.isArray(newIx)){
				console.log('Not sure what to do here.',newIx);
				return;
			}

			if(newIx === ix){return;}

			if(s.time >= o.end || (newIx === -1 && Math.abs(s.time - o.end) < 1)){
				newIx = ix+1;
				console.log('[End of Video]');
			}

			this.videoTriggeredTransition = true;
			this.queue.selectSlide(newIx);
		}
	},


	findPlaylistIndexFor: function(service,id,time){
		var matching = [], len;

//		time = Math.round(time);

		Ext.each(this.playlist,function(o,i){
			/* slideId, id, service, start, end */
			var dE = Math.abs(time - o.end),
				dS = Math.abs(o.start - time);

			if(o.service === service && o.id === id){
				console.log('[playlist-search]: '+i+': Start diff: '+dS+', End diff: '+dE+', start: '+ o.start+', end: '+o.end);
				if((o.start <= time || dS < 1) && (time < o.end && dE > 1)){
					matching.push(i);
				}
			}
		});

		len = matching.length;


		return len > 1
				? matching
				: len === 0
					? -1
					: matching[0];
	},


	updateCheckbox: function(){
		this.checkboxEl[this.linkWithSlides?'addCls':'removeCls']('checked');
	},


	checkboxClicked: function(){
		this.linkWithSlides = !this.linkWithSlides;
		this.updateCheckbox();
	},


	youtubePlayerReady: function(){
		this.players.youtube.isReady = true;
		var q = this.commandQueue.youtube;
		while(q.length>0){
			Ext.callback(this.issueCommand,this, q.shift());
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
		if(!t || !t.isReady){return null;}


		return {
			service: target,
			video: this.currentVideoId,
			time: this.issueCommand(target,'getCurrentTime'),
			state: this.issueCommand(target,'getPlayerState')
		};
	},


	issueCommand: function(target, command, args){
		var t = this.players[target];
		if(!t.isReady){
			this.commandQueue[target].push([target,command,args]);
			return null;
		}

		function call(fn,o,args){
			if(!o || !Ext.isFunction(fn)){return null;}
			return fn.apply(o,args);
		}

		return call(t[command],t,args);
	},


	stopPlayback: function(){
		this.currentVideoId = null;
		this.issueCommand('youtube','clearVideo');
		//this.issueCommand('vimeo','stop');
		//this.issueCommand('html5','stop');
	},


	setVideoAndPosition: function(videoId,startAt){
		var pause = (this.isPlaying() === false && !this.linkWithSlides);

		if(this.videoTriggeredTransition){
			delete this.videoTriggeredTransition;
			pause = false;
			if(this.currentVideoId === videoId){
				return;
			}
		}

		if(this.currentVideoId ===videoId){
			this.issueCommand('youtube','seekTo',[startAt,true]);
		}
		else {
			this.currentVideoId = videoId;
			if(videoId){
				this.issueCommand('youtube','loadVideoById',[videoId, startAt, "medium"]);
			}
			else {
				console.log('stopping');
				this.stopPlayback();
			}
		}


		if(pause || !videoId){ console.log('pausing'); this.issueCommand('youtube','pauseVideo'); }
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


	getVideoInfoFromSlide: function(slide){
		return {
			slideId: slide.getId(),
			id: slide.get('video') || null,
			service: slide.get('video-type') || null,
			start: slide.get('video-start') || 0,
			end: slide.get('video-end') || -1
		};
	},


	getVideoInfoIndex: function(videoInfo){
		var index = -1, id = videoInfo.slideId;
		Ext.each(this.playlist,function(i,ix){
			if(i.slideId===id){index=ix;}
			return index < 0;//stop once found
		});
		return index;
	},


	//called by the event of selecting something in the slide queue.
	updateVideoFromSelection: function(queueCmp, slide){

		var video,
			hasNext = Boolean(slide.getSibling(1)),
			hasPrev = Boolean(slide.getSibling(-1));

		this.nextEl[hasNext?'removeCls':'addCls']('disabled');
		this.prevEl[hasPrev?'removeCls':'addCls']('disabled');

		if(!this.linkWithSlides){return;}

		video = this.getVideoInfoFromSlide(slide);

		this.maybeSwitchPlayers(video.service);
		this.setVideoAndPosition(video.id,video.start);

		this.playlistIndex = this.getVideoInfoIndex(video);

		//Hide player?
		/*
		if(!video.service){
			this.hide();
		} else if(!this.isVisible()){
			this.show();
		}
		*/
	}
});
