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
			/*tag: 'iframe',*/ cls:'video', name: 'slide-video', id: '{id}-video',
			frameBorder: 0, scrolling: 'no', seamless: true
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
		videoEl: '.video',
		checkboxEl: 'div.video-checkbox'
	},


	initComponent: function(){
		this.callParent(arguments);
		//default the value
		if(typeof(this.synchronizeWithSlides) !== 'boolean'){
			this.synchronizeWithSlides = true;
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		function enterFilter(e) { var k = e.getKey(); return (k === e.ENTER || k === e.SPACE); }

		this.mon(this.checkboxEl,{
			scope:this,
			click:this.checkboxClicked,
			keydown: Ext.Function.createInterceptor(this.checkboxClicked,enterFilter,this,null)
		});
		this.updateCheckbox();
	},


	updateCheckbox: function(){
		this.checkboxEl[this.synchronizeWithSlides?'addCls':'removeCls']('checked');
	},


	checkboxClicked: function(){
		this.synchronizeWithSlides = !this.synchronizeWithSlides;
		this.updateCheckbox();
	},


	//called by the event of selecting something in the slide queue.
	updateVideoFromSelection: function(queueCmp, slide){

//		this.videoEl.set({src:
//		Ext.String.format(this.YOUTUBE_URL_PATTERN,
//				slide.get('video'),
//				encodeURIComponent(this.videoEl.id),
//				encodeURIComponent(location.protocol+'//'+location.host)
//		)});

		var startTime = slide.get('video-start'),
			videoId = slide.get('video');

		if(!this.ytPlayer){
			this.ytPlayer = new YT.Player(this.videoEl.id, {
				videoId: videoId,
				height: '221',
				width: '392',
				playerVars: {
					autohide: 1,
					modestbranding: 1,
					rel: 0,
					showinfo: 0,
					start: startTime
				},
				events: {
					'onReady': function(){console.log('ready!');},
					'onStateChange': function(){console.log('state!');}
				}
			});
			return;
		}

		this.ytPlayer.loadVideoById(videoId, startTime, "medium");
//		this.ytPlayer.seekTo(startTime,true);
	}
});
