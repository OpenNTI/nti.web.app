Ext.define('NextThought.controller.SlideDeck',{
	extend: 'Ext.app.Controller',
	models:[
		'transcript.TranscriptItem'
	],
	views: [
		'slidedeck.Overlay',
		'slidedeck.Queue',
		'slidedeck.Slide',
		'slidedeck.Video',
		'slidedeck.View',
		'slidedeck.Transcript',
		'slidedeck.media.Viewer'
	],

	init: function(){
		this.listen({
			'component':{
				'*':{
					'start-media-player':'launchMediaPlayer'
				}
			}
		});
	},

	launchMediaPlayer: function(video, videoId){
		console.log('Controller should media player for video: ', arguments);

		//See if we have a transcript.
		var reader = Ext.ComponentQuery.query('reader-content')[0].getContent(),
			frag = video && video.get('dom-clone'),
			videoEl = frag.querySelector('object[type$=ntivideo]'),
			m = videoEl && NextThought.model.transcript.TranscriptItem.fromDom(videoEl, reader);

		if(Ext.isEmpty(video)){
			console.error('Could not open the video: insufficient info', arguments);
			return;
		}

		// NOTE: this is overly simplified in the future,
		// instead of just passing the transcript, we will pass all the associated items.
		this.activeMediaPlayer = Ext.widget('media-viewer', {
			video:video,
			transcript:m,
			autoShow: true
		});
	}
});
