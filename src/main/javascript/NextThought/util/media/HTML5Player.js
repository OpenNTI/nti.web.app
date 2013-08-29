Ext.define('NextThought.util.media.HTML5Player', {

	statics: {
		kind:  'audio',
		type:  'html5',
		valid: function () {
			return !!document.createElement('audio').canPlayType;
		}
	},

	mixins: {
		observable: 'Ext.util.Observable'
	},

	playerTpl: Ext.DomHelper.createTemplate({
												tag:      'audio', cls: 'audio', name: 'audio', id: '{id}',
												controls: ''
											}),


	constructor: function (config) {
		this.mixins.observable.constructor.call(this);
		this.el = null;
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId + '-native-' + this.self.kind;
		this.player = null;
		this.width = config.width;
		this.height = config.height;

		this.playerSetup();
	},


//	SAJ: The HTML5 player code is part of the browser and is always ready to load a media source.
	isReady:     true,

	playerSetup: function () {
//		Inject HTML5 Player HTML
		this.playerTpl.append(this.parentEl, {id: this.id, height: this.height, width: this.width});
		console.log(this.id);
		this.el = Ext.get(this.id);
		this.player = Ext.getDom(this.id);
		this.mon(this.el, {
			'click': 'togglePlayback',
			'error': 'playerError',

//			'stalled':'',
//			'waiting':'',
//			'canplaythrough':'',
//			'loadedmetadata':'',
//			'loadeddata':'',
//
//			'timeupdate':'',
//
			'ended': 'notify',
			'pause': 'notify',
//			'playing':'',
			'play':  'notify'
		});
	},


	togglePlayback: function (e) {
		var p = this.player, y = e.getY(), rect = p.getBoundingClientRect();
		if ((rect.bottom - y) > 40) {
			p[p.paused ? 'play' : 'pause']();
		}
	},


	notify: function (e) {
		console.debug(this.id + ' - ' + e.type);
		this.fireEvent('player-event-' + e.type, this.id, this);
	},


	playerError: function () {
		this.fireEvent('player-error', 'html5');
	},


	getCurrentTime: function () {
		return this.player.currentTime;
	},

	getPlayerState: function () {
		var playerState = -1;

		if (this.player.paused) {
			playerState = 2;
		}
		else if (this.player.ended) {
			playerState = 0;
		}
		else if (this.player.readyState === 2 || this.player.readyState === 3) {
			playerState = 3;
		}
		else {
			playerState = 1;
		}

		return playerState;
	},

	load: function (source, offset) {
		var sourceTpl = Ext.DomHelper.createTemplate({tag: 'source', src: '{src}', type: '{type}'}),
				player = this.player,
				i = 0,
				len = (source && source.length) || 0, src;

		// Remove any sources that may be there
		if (player.innerHTML) {
			player.innerHTML = '';
			player.load();
		}

		for (i = 0; i < len; i++) {
			src = source[i].source;
			src = /^\/\//i.test(src) ? (location.protocol + src) : src;
			sourceTpl.append(player, {src: src, type: source[i].type}, false);
		}

		player.load();

		if (offset > 0.0) {
			this.el.on('loadedmetadata', function () {player.currentTime = offset;}, this, {single: true});
		}
	},

	play: function () {
		this.player.play();
	},


	deactivate: function () {
		return this.pause.apply(this, arguments);
	},


	activate: Ext.emptyFn,


	pause: function () {
		this.player.pause();
	},

	seek: function (offset) {
		var player = this.player;
		if (player.readyState === 0) {
			this.el.on('loadedmetadata', function () {player.currentTime = offset;}, this, {single: true});
		}
		else {
			player.currentTime = offset;
		}
	},

	stop: function () {
		// Remove the current sources and trigger a load to free the used memory
		this.player.innerHTML = '';
		this.player.load();
	},

	cleanup: function () {
		if (this.player) {
			this.stop();
		}
		if (this.el) {
			this.el.clearListeners();
		}
	}
});
