Ext.define('NextThought.util.media.VimeoPlayer', {

	statics: {
		PLAYER_ORIGIN: 'http://player.vimeo.com',
		kind: 'video',
		type: 'vimeo',
		valid: function() { return true; }
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


	constructor: function(config) {
		this.mixins.observable.constructor.call(this);
		this.el = null;
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId + '-vimeo-' + this.self.kind;
		this.playerId = this.id + '-player';
		this.player = null;
		this.width = config.width;
		this.height = config.height;

		this.playerTpl = Ext.DomHelper.createTemplate(Ext.apply({
			src: window.location.protocol + '//player.vimeo.com/video/{videoId}?' +
				 Ext.Object.toQueryString({
					 api: 1,
					 player_id: this.playerId,
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


	playerSetup: function() {
		// Inject Player Markup
		this.frameTpl.append(this.parentEl, {id: this.id, height: this.height, width: this.width});
		console.log(this.id);
		this.el = Ext.get(this.id);
		window.addEventListener('message', this.handleMessage, false);
	},


	handleMessage: function(event) {
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


	postMessage: function(method, params) {
		var context = this.getPlayerContext(), data;
		if (!context) {
			console.warn(this.id, ' No Player Context!');
			return;
		}

		data = JSON.stringify({
			method: method,
			value: params
		});

		console.log(this.id + ' Posting message to vimeo player(' + this.playerId + ')', data);

		context.postMessage(Ext.encode({ }), this.playerSourceURL);
	},


	onReady: function() {
		//because when we are brought out of ready state, we destroy the iframe,
		// we should always register our listeners when we become ready.

		this.playerReadyForCommands = true;
		this.postMessage('addEventListener', 'loadProgress');
		this.postMessage('addEventListener', 'playProgress');
		this.postMessage('addEventListener', 'play');
		this.postMessage('addEventListener', 'pause');
		this.postMessage('addEventListener', 'finish');
		this.postMessage('addEventListener', 'seek');

		this.isReady = true;
	},


	load: function(source, offset) {
		this.cleanPlayer();
		var o = this.playerTpl.append(this.el, {id: this.id, videoId: source, height: this.height, width: this.width});
		this.player = Ext.getDom(this.playerId) || o;
		this.playerSourceURL = this.player.getAttribute('src').split('?')[0];
		this.seekWhenReady = offset;
	},


	getPlayerContext: function() {
		var iframe = Ext.getDom(this.player);
		return iframe && (iframe.contentWindow || window.frames[iframe.name]);
	},


	togglePlayback: function(e) {},


	notify: function(e) {
		this.fireEvent('player-event-' + e.type, this.id, this);
	},


	playerError: function() {
		this.fireEvent('player-error', 'vimeo');
	},


	getCurrentTime: function() {
		return 0;//
	},


	getPlayerState: function() {
		return 0; //YT style state enum
	},


	play: function() {},


	pause: function() {},


	seek: function(offset) {},


	stop: function() {},


	activate: Ext.emptyFn,


	deactivate: function() {},


	cleanPlayer: function() {
		delete this.playerReadyForCommands;
		this.isReady = false;
		if (this.player) {
			this.stop();
		}
		Ext.destroy(this.player);
		delete this.player;
	},


	cleanup: function() {
		this.cleanPlayer();
		Ext.destroy(this.el);
		delete this.el;
		window.removeEventListener('message', this.handleMessage, false);
	}
});
