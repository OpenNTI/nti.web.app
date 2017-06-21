//keys that exist mean "maybe" supports.  (Apparently canPlayType doesn't return a "Yes")
const video = document.createElement('video');
const types = [
	{mime: 'video/ogg', key: 'ogg'},
	{mime: 'video/ogg; codecs="theora, vorbis"', key: 'ogg'},
	{mime: 'video/webm', key: 'webm'},
	{mime: 'video/webm; codecs="vp8, vorbis"', key: 'webm'},
	{mime: 'video/mp4', key: 'mp4'},
	{mime: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', key: 'mp4'},
	{mime: 'application/vnd.apple.mpegURL', key: 'm3u8'},
	{mime: 'application/x-mpegURL', key: 'm3u8'},
	{mime: 'video/x-mpegurl', key: 'm3u8'},
	{mime: 'audio/x-mpegurl', key: 'm3u8'},
	{mime: 'video/mpegurl', key: 'm3u8'},
	{mime: 'audio/mpegurl', key: 'm3u8'}
];

if (video && video.canPlayType) {
	for(let o of types) {
		const i = !!video.canPlayType(o.mime);
		exports[o.key] = exports[o.key] || i;
		//console.debug('Browser suggests that it ' + (i ? 'might be able to' : 'cannot') + ' play ' + o.key + ' (' + o.mime + ')');
	}
}
