var Ext = require('extjs');

const VimeoResolver = require('legacy/model/resolvers/videoservices/Vimeo');


module.exports = exports = Ext.define('NextThought.util.media.VimeoPlayer', {

	statics: {
		PLAYER_ORIGIN: 'https://player.vimeo.com',
		kind: 'video',
		type: 'vimeo',
		valid: function () { return true; }
	},

	mixins: {
		observable: 'Ext.util.Observable'
	},

	frameTpl: Ext.DomHelper.createTemplate({id: '{id}', cls: 'vimeo-wrapper', style: {width: '{width}px', height: '{height}px'}}),

	playerTpl: {
		tag: 'iframe', cls: 'vimeo', id: '{id}-player', width: '{width}', height: '{height}',
		frameborder: 0,
		webkitallowfullscreen: 1,
		mozallowfullscreen: 1,
		allowfullscreen: 1
	},


	constructor: function (config) {
		this.mixins.observable.constructor.call(this);
		this.el = null;
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId + '-vimeo-' + this.self.kind;
		this.playerId = this.id + '-player';
		this.playerState = NextThought.Video.states.UNSTARTED;
		this.player = null;
		this.width = config.width;
		this.height = config.height;

		this.playerTpl = Ext.DomHelper.createTemplate(Ext.apply({
			src: this.self.PLAYER_ORIGIN + '/video/{videoId}?' +
			Ext.Object.toQueryString({
				api: 1,
				'player_id': this.playerId,
				//autopause: 0, //we handle this for other videos, but its nice we only have to do this for cross-provider videos.
				autoplay: 0,
				badge: 0,
				byline: 0,
				loop: 0,
				portrait: 0,
				title: 0
			})
		}, this.playerTpl));
		this.handleMessage = this.handleMessage.bind(this);
		this.playerSetup();
	},

	//We cannot preload the vimeo player. They do not have a "load" command.
	// So, to "load" we will drop a new iframe sourced to the video id. Therefor,
	// we are 'ready' at first and will become 'not ready' as soon as we inject
	// the iframe.
	isReady: true,


	playerSetup: function () {
		// Inject Player Markup
		this.frameTpl.append(this.parentEl, {id: this.id, height: this.height, width: this.width});
		this.el = Ext.get(this.id);
		window.addEventListener('message', this.handleMessage, false);
	},

	handleMessage: function (event) {
		if (event.origin.toLowerCase() !== this.self.PLAYER_ORIGIN) {
			return;
		}
		var data = Ext.decode(event.data, true) || {}, method;

		if (data.player_id !== this.playerId) {
			return;
		}

		console.debug(data);
		method = 'on' + Ext.String.capitalize(data.event || data.method);
		if (!this[method]) {
			console.warn('Missing implementation: ' + method);
			return;
		}

		this[method](data);
	},


	postMessage: function (method, params) {
		var context = this.getPlayerContext(), data;
		if (!context) {
			console.warn(this.id, ' No Player Context!');
			return;
		}

		if (!this.playerReadyForCommands) {
			//console.error(this.id, 'not ready', arguments); //uncomment to debug
			return;
		}

		data = {
			method: method,
			value: params
		};

		console.log(this.id + ' Posting message to vimeo player', data);

		context.postMessage(Ext.encode(data), this.playerSourceURL);
	},


	onReady: function () {
		//because when we are brought out of ready state, we destroy the iframe,
		// we should always register our listeners when we become ready.

		this.playerReadyForCommands = true;
		//this.postMessage('addEventListener', 'loadProgress');
		this.postMessage('addEventListener', 'playProgress');
		this.postMessage('addEventListener', 'play');
		this.postMessage('addEventListener', 'pause');
		this.postMessage('addEventListener', 'finish');
		this.postMessage('addEventListener', 'seek');
		this.postMessage('getDuration', null);

		this.isReady = true;

		this.fireEvent('player-ready', 'vimeo');

		if (this.seekWhenReady) {
			this.seek(this.seekWhenReady);
			delete this.seekWhenReady;
		}
	},


	load: function (source, offset) {
		this.cleanPlayer();
		this.el.select('iframe.vimeo').remove();
		var o = this.playerTpl.append(this.el, {id: this.id, videoId: source, height: this.height, width: this.width});
		this.player = Ext.getDom(this.playerId) || o;
		this.playerSourceURL = this.player.getAttribute('src').split('?')[0];
		this.seekWhenReady = offset;

		//If we can't do a head request for the source, assume that vimeo is blocked
		//and treat it as an error
		VimeoResolver.getVideo(source)
			.catch(() => {
				this.fireEvent('unrecoverable-player-error', 'vimeo');
			});
	},


	getPlayerContext: function () {
		var iframe = Ext.getDom(this.player);
		return iframe && (iframe.contentWindow || window.frames[iframe.name]);
	},


	notify: function (type) {
		//We must fire: play, pause, ended
		this.fireEvent('player-event-' + type, this.id, this);
	},


	playerError: function () {
		this.fireEvent('player-error', 'vimeo');
	},


	onPlayProgress: function (event) {
		this.currentPosition = event.data.seconds;
	},


	getCurrentTime: function () {
		return this.currentPosition;
	},


	getPlayerState: function () {
		//we must track this ourselves
		//return YT style state enum
		return this.playerState;
	},


	play: function () {
		this.postMessage('play');
	},


	onPlay: function () {
		this.playerState = NextThought.Video.states.PLAYING;
		this.notify('play');
	},


	pause: function () {
		this.postMessage('pause');
	},


	onPause: function () {
		this.playerState = NextThought.Video.states.PAUSED;
		this.notify('pause');
	},


	seek: function (offset) {
		this.postMessage('seekTo', offset);
	},


	onSeek: function (event) {
		var end = event.data.seconds;

		if (!this.seeking) {
			this.seeking = true;
			this.seekingStart = this.currentPosition;
		}

		this.detectSeekingStop(end);

		this.notify('seek');
	},

	detectSeekingStop: function (val) {
		clearTimeout(this.seekEndTimer);
		this.seekEndTimer = setTimeout(this.onSeekEnd.bind(this, val), 750);
	},

	onSeekEnd: function (end) {
		if (this.seeking) {
			this.fireEvent('player-seek', {start: this.seekingStart, end: end});
			this.notify('seekEnd');
			delete this.seeking;
			delete this.seekingStart;
		}
	},


	stop: function () {
		this.currentPosition = 0;
		this.playerState = NextThought.Video.states.UNSTARTED;
		this.postMessage('unload');
	},


	onFinish: function () {
		this.playerState = NextThought.Video.states.ENDED;
		this.notify('ended');
	},


	activate: Ext.emptyFn,


	deactivate: function () {
		this.stop();
	},


	cleanPlayer: function () {
		this.playerState = NextThought.Video.states.UNSTARTED;
		delete this.playerReadyForCommands;
		this.isReady = false;
		if (this.player) {
			this.stop();
		}
		Ext.destroy(this.player);
		delete this.player;
	},


	cleanup: function () {
		this.cleanPlayer();
		Ext.destroy(this.el);
		delete this.el;
		window.removeEventListener('message', this.handleMessage, false);
	},


	onGetDuration: function (e) {
		var value = e.value;

		//value is in seconds so make it milliseconds
		//like everything else in JS
		this['video_duration'] = value * 1000;
	},


	getDuration: function () {
		return this['video_duration'] || 0;
	}
});
