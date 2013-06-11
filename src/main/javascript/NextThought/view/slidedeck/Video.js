/*jslint */
/*globals NextThought */
Ext.define('NextThought.view.slidedeck.Video',{
	extend: 'NextThought.view.video.Video',
	alias: 'widget.slidedeck-video',

	plain: true,
	ui: 'slidedeck-video',

	listeners: {
		'media-heart-beat': 'videoQueryTask'
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
			tag: 'video', cls: 'video', name: 'slide-video', id: '{id}-native-video', 'controls': ''
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

		this.maybeSwitchPlayers(null);
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

			/*console.log('[video status] service: '+ s.service
						+', state: '+s.state
						+', id: '+s.video
						+', time: '+s.time
						+', [slide start: '+o.start
						+', slide end: '+o.end+']');*/

			//for people who jump around...
			newIx = this.findPlaylistIndexFor(s.service, s.video, s.time);
			//console.log('[playlist] new index '+newIx+', old index: '+ix);
			if(Ext.isArray(newIx)){
				console.log('Not sure what to do here.',newIx);
				return;
			}

			if(newIx === ix){return;}

			if(s.time >= o.get('end') || (newIx === -1 && Math.abs(s.time - o.get('end')) < 1)){
				newIx = ix+1;
				console.log('[End of Video]');
			}

			this.videoTriggeredTransition = true;
			this.queue.selectSlide(newIx);
		}
	},


	findPlaylistIndexFor: function(service,id,time){
		var matching = [], len,
			compareSources = NextThought.model.PlaylistItem.compareSources;

//		time = Math.round(time);

		Ext.each(this.playlist,function(o,i){
			/* slideId, id, service, start, end */
			var dE = Math.abs(time - o.get('end')),
				dS = Math.abs(o.get('start') - time);

			if(o.activeSource().service === service && compareSources(o.activeSource().source, id)){
				//console.log('[playlist-search]: '+i+': Start diff: '+dS+', End diff: '+dE+', start: '+ o.start+', end: '+o.end);
				if((o.get('start') <= time || dS < 1) && (time < o.get('end') && dE > 1)){
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
		if(this.linkWithSlides){
			this.videoTriggeredTransition = true;
			this.queue.selectSlide(this.playlistIndex);
		}
	},


	getVideoInfoFromSlide: function(slide){
		return slide.get('media');
	},


	getVideoInfoIndex: function(videoInfo){
		var index = -1, id = videoInfo.get('mediaId');
		Ext.each(this.playlist,function(i,ix){
			if(i.get('mediaId')===id){index=ix;}
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

		video = slide.get('media');
		this.playlistSeek(this.getVideoInfoIndex(video));

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
