Ext.define('NextThought.view.slidedeck.Video',{
	extend: 'Ext.Component',
	alias: 'widget.slidedeck-video'

	// YouTube: https://developers.google.com/youtube/js_api_reference
	// http://www.youtube.com/v/VIDEO_ID?enablejsapi=1&version=3&playerapiid=player_id
	// function onYouTubePlayerReady(){}
	// use ytPlayer.at(millies,callback)

	// Vimeo: http://developer.vimeo.com/player/js-api
	// https://github.com/vimeo/player-api/tree/master/javascript or direct postMessages
	// http://player.vimeo.com/video/VIDEO_ID?api=1&player_id=player_id
	// use event "playProgress" and keep track of our times to fire an event like "at" for youtube.
});
