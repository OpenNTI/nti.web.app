const Ext = require('extjs');

const AnalyticsUtil = require('legacy/util/Analytics');
const Globals = require('legacy/util/Globals');
const ObjectUtils = require('legacy/util/Object');
const PageVisibility = require('legacy/util/Visibility');
const PlaylistItem = require('legacy/model/PlaylistItem');
const VideoPosters = require('legacy/model/resolvers/VideoPosters');
const Vimeo = require('legacy/model/resolvers/videoservices/Vimeo');
const Youtube = require('legacy/model/resolvers/videoservices/Youtube');
const HTML5Player = require('legacy/util/media/HTML5Player');
const HTML5VideoPlayer = require('legacy/util/media/HTML5VideoPlayer');
const KalturaPlayer = require('legacy/util/media/KalturaPlayer');
const VimeoPlayer = require('legacy/util/media/VimeoPlayer');
const YouTubePlayer = require('legacy/util/media/YouTubePlayer');

const PlayStates = require('./PlayStates');
const SupportedVideoTypes = require('./SupportedVideoTypes');

require('legacy/mixins/InstanceTracking');

const MEDIA = [
	HTML5Player,
	HTML5VideoPlayer,
	KalturaPlayer,
	VimeoPlayer,
	YouTubePlayer
];


module.exports = exports = Ext.define('NextThought.app.video.Video', {
	extend: 'Ext.Component',
	alias: 'widget.content-video',

	mixins: {
		instanceTracking: 'NextThought.mixins.InstanceTracking'
	},

	ui: 'content-video',
	cls: 'content-video',

	listeners: {
		destroy: 'cleanup',
		'player-ready': 'playerReady',
		'player-error': 'playerError',
		'unrecoverable-player-error': 'unrecoverablePlayerError'
	},

	ASPECT_RATIO: 0.5625,
	loadFirstEntry: true,
	playerWidth: 640,

	playerHeight: function () {
		return Math.round(this.playerWidth * this.ASPECT_RATIO) + this.getControlHeight();
	},

	renderTpl: Ext.DomHelper.markup([
		//		SAJ: Template lines are commented out because the video frame has not been styled yet.
		//		{ cls: 'meta', cn: [
		//			{ cls:'title', html:'{title}' },
		//			{ cls:'description', html:'{description}' }
		//		]},
		{ cls: 'video-wrapper', cn: [
			//			{ tag: 'iframe', cls:'video', name: 'video', id: '{id}-vimeo-video',
			//				frameBorder: 0, scrolling: 'no', seamless: true
			//			},
			{ cls: 'video placeholder', name: 'video', id: '{id}-curtain'}
		]}
	]),

	onClassExtended: function (cls, data, hooks) {
		const onBeforeClassCreated = hooks.onBeforeCreated;

		//merge with subclass's render selectors
		data.listeners = Ext.applyIf(data.listeners || {},cls.superclass.listeners);
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}

		hooks.onBeforeCreated = function (clazz, classData) {
			if (classData.cls) {
				classData.cls = [clazz.superclass.cls, classData.cls].join(' ');
			}
			classData.listeners = Ext.applyIf(classData.listeners || {}, clazz.superclass.listeners);
			onBeforeClassCreated.call(this, clazz, classData, hooks);
		};
	},

	inheritableStatics: {
		states: PlayStates
	},

	statics: {
		urlToPlaylist: function (url) {
			var item = PlaylistItem.fromURL(url);
			return item && [item];
		},


		resolvePosterFromEmbedded: function (embedded) {
			var PosterResolver = VideoPosters,
				type = embedded.type,
				url = embedded.embedURL,
				id;

			if (type === PosterResolver.YOUTUBE) {
				id = Youtube.getIdFromURL(url);
			} else if (type === PosterResolver.VIMEO) {
				id = Vimeo.getIdFromURL(url);
			} else {
				return Promise.resolve(Globals.CANVAS_BROKEN_IMAGE.src);
			}

			return PosterResolver.resolvePoster(type, id);
		}
	},

	refreshHeight: function () {
		this.height = this.playerHeight;
		this.setHeight(this.height);
		console.log(this.height);
		if (this.rendered) {
			this.updateLayout();
		}
	},

	constructor: function (config) {

		if (!Ext.isEmpty(config.url)) {
			config.playlist = config.playlist || this.self.urlToPlaylist(config.url);
			delete config.url;
		}

		this.playerWidth = config.width || config.playerWidth || this.playerWidth;
		Ext.apply(config, {
			width: this.playerWidth,
			height: this.playerHeight
		});
		this.callParent([config]);

		this.trackThis();
	},

	initComponent: function () {
		Ext.applyIf(this, {playlist: []});

		Ext.apply(this.playlist, {
			getIds: function (s) {
				var i = [], o, x, l = this.length;
				for (x = 0; x < l; x++) {
					o = this[x];
					i.push.apply(i, o.getSources(s));
				}
				return i;
			},

			usesService: function (s) {
				var x = this.length - 1;
				for (x; x >= 0; x--) {
					if (this[x].usesService && this[x].usesService(s)) {
						return true;
					}
				}
				return false;
			}

		});



		this.callParent(arguments);

		this.commandQueue = {};

		this.playerIds = {
			//			'vimeo': this.id+'-vimeo-video',
			'none': this.id + '-curtain'
		};

		this.players = {};
		Ext.applyIf(this, {playerBlacklist: []});

		this.playlistIndex = this.playlistIndex || 0;

		this.renderData = Ext.apply(this.renderData || {},this.data);

		Ext.applyIf(this.storedRenderData, this.renderData);

		this.activeVideoService = 'none';
		this.currentVideoId = null;
		this.playerBlacklist.push('none');

		this.taskMediaHeartBeat = {
			interval: 1000,
			scope: this,
			run: function () {
				this.onHeartBeat();
				this.fireEvent('media-heart-beat');
			},
			onError: function () {
				console.error(arguments);
			}
		};

		Ext.TaskManager.start(this.taskMediaHeartBeat);
		this.on({
			scope: this,
			'destroy': function cleanUpTask () {Ext.TaskManager.stop(this.taskMediaHeartBeat);},
			'beforedestroy': function () {
				this.stopPlayback();
			}
		});

		//this.checkForFlash();
	},

	initRenderData: function () {
		var ret;
		ret = this.callParent(arguments);
		this.storedRenderData = Ext.apply({}, ret);
		return ret;
	},

	afterRender: function () {
		var item;
		this.callParent(arguments);

		this.playerSetup();
		Ext.defer(this.updateLayout, 1, this);

		this.log('Players initialized.');

		//		If loadFirstEntry is true, we load the first playlist entry. For some subclasses this behavior is not desired.
		if (this.loadFirstEntry) {
			item = this.playlist[this.playlistIndex];
			this.maybeSwitchPlayers(item && item.activeSource && (item.activeSource() || {}).service);
			if (item) {
				this.setVideoAndPosition(item.activeSource && (item.activeSource() || {}).source);
			}
		}
		else {
			//			Set the curtain as the active player while we figure out which other one to use.
			this.maybeSwitchPlayers('none');
		}

		function monitorCardChange (cmp, me) {
			var c = cmp.up('{isOwnerLayout("card")}');
			me = me || cmp;
			if (c) {
				me.debug(me.id + ' is listening on deactivate on ' + c.id);
				me.mon(c, {
					activate: 'maybeActivatePlayer',
					deactivate: 'deactivatePlayer',
					scope: me
				});
				monitorCardChange(c, me);
			}
		}

		monitorCardChange(this);
		this.maybeActivatePlayer();
	},

	maybeActivatePlayer: function () {
		var me = this,
			doActivate = me.isVisible(true);

		me.debug('should reactivate?', doActivate ? 'yes' : 'no');

		function deactivateOthers (other) {
			if (other !== me) {
				other.deactivatePlayer();
			}
		}

		if (!doActivate) {
			return;
		}

		Ext.each(me.getInstances(), deactivateOthers);

		me.activatePlayer();
	},

	playerConfigOverrides: function (name) { return {}; },

	playerSetup: function () {
		this.log('Initializing the players.');
		var me = this,
			blacklist = this.playerBlacklist || [];

		MEDIA.forEach(cls => {
			if (cls.kind !== 'video') {return;}
			if (!cls.valid() || !me.playlist.usesService(cls.type)) {
				if (!Ext.Array.contains(blacklist, cls.type)) {
					blacklist.push(cls.type);
				}
				return;
			}

			var p = me.players[cls.type] = cls.create(Ext.apply({
				el: Ext.get(me.el.down('.video-wrapper')),
				parentId: me.id,
				parent: me,
				width: me.playerWidth,
				height: me.playerHeight
			}, me.playerConfigOverrides(cls.type)));

			me.on('destroy', 'destroy',
				me.relayEvents(p, [
					'player-ready',
					'player-error',
					'player-event-play',
					'player-event-pause',
					'player-event-ended',
					'player-seek',
					'unrecoverable-player-error'
				]));

			me.mon(p, 'playback-speed-changed', 'playBackSpeedChanged');

			me.playerIds[cls.type] = p.id;
		});
		this.initializedPlayers = Ext.Object.getKeys(this.players);

		this.players.none = {isReady: false};
	},

	unrecoverablePlayerError: function (player) {
		this.playerBlacklist.push(player);

		const newIndex = this.playlistIndex + 1;

		if (newIndex < this.players.length) {
			this.playlistSeek(newIndex);
		} else {
			this.activeVideoService = 'none';
			this.playlistSeek(this.playlistIndex);
		}
	},

	playerError: function () {
		console.error('Player encountered an error', arguments);
	},

	playerReady: function (player) {
		var q = this.commandQueue[player],
			p = this.players[player],
			state = this.queryPlayer();

		while (q && q.length > 0) {
			Ext.callback(this.issueCommand, this, q.shift());
			if (!p.isReady) {
				return;
			}
		}

		if (state) {
			this.fireEvent('player-state-ready', state);
		}
	},

	getPlayerState: function () {
		var status = this.queryPlayer();
		if (!status) { return false; }

		return status.state;
	},

	isPlaying: function () {
		var state = this.getPlayerState();

		return state === 1 || state === 3;
	},

	queryPlayer: function () {
		var target = this.activeVideoService,
			t = this.players[target],
			debug = this.self.debug;

		if (!t || !t.isReady) {
			return null;
		}

		try {
			this.self.debug = false;//prevent these two commands from flooding the logs
			return {
				service: target,
				video: this.currentVideoId,
				time: this.issueCommand(target, 'getCurrentTime'),
				state: this.issueCommand(target, 'getPlayerState'),
				duration: t.getDuration ? t.getDuration() : 0,
				speed: t.getPlaybackSpeed ? t.getPlaybackSpeed() : 1
			};
		}
		finally {
			this.self.debug = debug;
		}
	},

	issueCommand: function (target, command, args, force/*Only to be used internally*/) {
		var t = this.players[target];
		if (!t || (!t.isReady && !force)) {
			if (!this.commandQueue[target]) {
				this.commandQueue[target] = [];
			}
			this.debug(this.id, 'Enqueing command ', command, arguments);
			this.commandQueue[target].push([target, command, args]);
			return null;
		}

		function call (fn, o, cargs) {
			if (!o || !Ext.isFunction(fn)) {return null;}
			return fn.apply(o, cargs);
		}

		this.debug(this.id, 'Invoking command ', command, arguments);
		this.fireEvent('player-command-' + command);
		return call(t[command], t, args);
	},

	activatePlayer: function () {
		if (this.activeVideoService) {
			try {
				this.issueCommand(this.activeVideoService, 'activate', [this.currentVideoId], true);
			}
			catch (e) {
				console.warn('Error caught activating video', e.stack || e.message || e);
			}
			return true;
		}
		return false;
	},

	deactivatePlayer: function () {
		if (this.activeVideoService) {
			try {
				this.log('Clearing command queue for ', this.activeVideoService, ' as part of deactivate');
				delete this.commandQueue[this.activeVideoService];
				this.issueCommand(this.activeVideoService, 'deactivate', null, true);
				this.fireEvent('player-deactivated');
			}
			catch (e) {
				console.warn('Error caught deactivating video', e.stack || e.message || e);
			}
			return true;
		}
		return false;
	},

	playBackSpeedChanged: function (oldSpeed, newSpeed) {
		var state = this.queryPlayer(),
			time = state && state.time,
			current = this.playlist[this.playlistIndex],
			id = current && current.getId();

		//if we dont' have a player state, we aren't suppose to capture analytics,
		//or we don't have a resource id don't send any events
		if (!state || this.doNotCaptureAnalytics || !id) { return; }

		AnalyticsUtil.sendEvent(id, {
			type: 'VideoSpeedChange',
			oldPlaySpeed: oldSpeed,
			newPlaySpeed: newSpeed,
			videoTime: time
		});
	},

	onHeartBeat: function () {
		var state = this.queryPlayer(),
			time = state && state.time,
			diff = this.lasttime ? time - this.lasttime : 0,
			threshold = 5,
			current = this.playlist[this.playlistIndex],
			id = current && current.getId(),
			hasTranscript = !!this.up('media-view');

		//if we don't have a player state, we aren't suppose to capture analytics,
		//or we don't have a resource id don't send any events
		if (!state || this.doNotCaptureAnalytics || !id) { return; }

		//if the time has changed more than the threshold or we have come backwards
		//stop the watch event
		if (this.hasWatchEvent && (diff > threshold || diff < 0)) {
			delete this.hasWatchEvent;
			AnalyticsUtil.stopEvent(id, 'VideoWatch', {
				videoEndTime: this.lasttime,
				duration: state.duration / 1000
			});

			//send a seek event saying the skipped over this part of the video
			//if the player is still ready and not reset
			if (state.state !== this.self.states.UNSTARTED) {
				AnalyticsUtil.sendEvent(id, {
					type: 'VideoSkip',
					withTranscript: hasTranscript,
					videoStartTime: this.lasttime,
					videoEndTime: time
				});
			}
		}

		// If we were playing and just paused the video, end the previous watch event.
		if (this.hasWatchEvent && (state.state === this.self.states.PAUSED)) {
			delete this.hasWatchEvent;
			AnalyticsUtil.stopEvent(id, 'VideoWatch', {
				videoEndTime: this.lasttime,
				duration: state.duration / 1000
			});
		}

		//Not an else if so a new timer will start when the other one ends
		if (!this.hasWatchEvent && ((state.state === this.self.states.PLAYING) || (state.state === this.self.states.BUFFERING))) {
			AnalyticsUtil.startEvent(id, {
				type: 'VideoWatch',
				withTranscript: hasTranscript,
				videoStartTime: time,
				duration: state.duration / 1000,
				playSpeed: state.speed
			});
			this.hasWatchEvent = true;

			PageVisibility.lockActive();
		}

		this.lasttime = time;
	},

	stopPlayback: function () {
		var current, state = this.queryPlayer();

		if (this.hasWatchEvent && !this.doNotCaptureAnalytics) {
			current = this.playlist[this.playlistIndex];
			delete this.hasWatchEvent;
			AnalyticsUtil.stopEvent(current.getId(), 'VideoWatch', {
				videoEndTime: state && state.time
			});
		}

		PageVisibility.unlockActive();

		this.currentVideoId = null;

		if (this.activeVideoService) {
			this.issueCommand(this.activeVideoService, 'stop');
		}
	},

	pausePlayback: function () {
		this.maybeActivatePlayer();
		if (this.activeVideoService && this.isPlaying()) {
			this.issueCommand(this.activeVideoService, 'pause');
			return true;
		}
		return false;
	},

	resumePlayback: function (force) {
		this.maybeActivatePlayer();

		if (this.activeVideoService && (force || !this.isPlaying())) {
			this.issueCommand(this.activeVideoService, 'play');
			return true;
		}
		return false;
	},

	activeClass: function () {
		if (!this.activeVideoService) {
			return null;
		}

		return MEDIA.find(cls => cls.type === this.activeVideoService);
	},

	openExternally: function () {
		var cls = this.activeClass(),
			//Potential BUG: assuming currentVideoId is an array that you can treat as Args. If its an array, you want to pass the entire array as ONE argument!
			html = cls ? cls.contentForExternalViewer.apply(cls, this.currentVideoId) : '<body><h1>Unable to load video</h1></body>',
			w;

		w = window.open('', 'nti_external_video', 'height=768,width=1050,toolbar=no,resizable=no,location=no,status=no,titlebar=no, directories=no');

		w.document.body.innerHTML = '';

		w.document.write(Ext.DomHelper.markup({
			tag: 'div',
			html: html
		}));
		w.focus();
	},

	canOpenExternally: function () {
		var cls = this.activeClass();
		return cls && Ext.isFunction(cls.contentForExternalViewer);
	},

	setVideoAndPosition: function (videoId, startAt) {
		var compareSources = PlaylistItem.compareSources;
		const playlistItem = this.playlist[this.playlistIndex];

		this.maybeActivatePlayer();

		// Save our the startAt value in case of failover
		this.currentStartAt = (startAt || 0);

		if (compareSources(this.currentVideoId, videoId)) {
			this.log('Seeking to ', startAt, ' because ', this.currentVideoId, videoId);
			this.issueCommand(this.activeVideoService, 'seek', [startAt, true]);
		}
		else {
			this.currentVideoId = videoId;
			if (videoId) {
				this.issueCommand(this.activeVideoService, 'load', [videoId, startAt, 'medium', playlistItem.getCaptions()]);
			}
			else {
				this.log('stopping');
				this.stopPlayback();
			}
		}
	},

	jumpToVideoLocation: function (videoId, startAt) {
		var r = Ext.Array.findBy(this.playlist, function (item) {
				return item.get('NTIID') === videoId;
			}),
			id = r && r.activeSource().source;

		this.maybeActivatePlayer();

		if (id) {
			this.setVideoAndPosition(id, startAt);
		}
		else {
			console.warn('Could not find video with id: ', videoId, ' in the playlist ', this.playlist);
		}
	},

	getControlHeight: function () {
		var l = this.players,
			k = this.activeVideoService;

		return (k && l && l[k] && l[k].CONTROL_HEIGHT) || 0;
	},

	maybeSwitchPlayers: function (service) {
		var me = this;

		service = service || 'none';
		if (!this.playerIds[service]) {
			console.warn('Attempting to switch to non-existent player ' + service);
			service = 'none';
		}

		if (me.activeVideoService !== service) {
			me.stopPlayback();
		}


		//TODO: make each player handle switching.
		Ext.Object.each(me.playerIds, function (k, id) {
			var v = Ext.get(id);
			if (!v) {
				console.warn('Skipping ' + id + ' because dom does not contain it.');
			} else {
				v.setVisibilityMode(Ext.dom.Element.DISPLAY);
				//hide/show handle checking if they need to do anything...lets not worry about it and just call them.
				v[(k === service) ? 'show' : 'hide']();
			}
		});

		me.activeVideoService = service;
		this.fireEvent('height-change');
	},

	playlistSeek: function (newIndex) {
		var source, item, service;
		if ((newIndex >= 0) && (newIndex < this.playlist.length)) {
			if (this.playlistIndex !== newIndex || this.activeVideoService === 'none') {
				this.playlistIndex = newIndex;
				item = this.playlist[this.playlistIndex];
				service = item && item.activeSource().service;
				this.log('Playlist seek setting active service to ', service);
				while (item && Ext.Array.contains(this.playerBlacklist, service)) {
					if (!item.useNextSource()) {
						service = 'none';
						this.log('Active service is none');
						this.currentVideoId = null;
						this.maybeSwitchPlayers(service);
						return false;
					}

					service = item.activeSource().service;
				}

				source = item && item.activeSource().source;
				this.maybeSwitchPlayers(service);
				this.setVideoAndPosition(source, item && item.get('start'));
			}
			return true;
		}
		return false;
	},

	playlistNext: function () {
		this.playlistSeek(this.playlistIndex + 1);
	},

	playlistPrevious: function () {
		this.playlistSeek(this.playlistIndex - 1);
	},

	cleanup: function () {
		var me = this;
		Ext.each(me.initializedPlayers, function (service) {
			me.issueCommand(service, 'pause');
			me.issueCommand(service, 'cleanup');
		});
	},

	debug: function () {
		if (this.self.debug) {
			console.debug.apply(console, arguments);
		}
	},

	log: function () {
		if (this.self.debug) {
			console.log.apply(console, arguments);
		}
	}
}, function () {

	window.swfobject = window.swfobject || {hasFlashPlayerVersion: function (v) {return false;}};

	this.ASPECT_RATIO = this.prototype.ASPECT_RATIO;

	ObjectUtils.defineAttributes(this.prototype, {
		playerHeight: {getter: this.prototype.playerHeight}});


	this.supports = SupportedVideoTypes;
});
