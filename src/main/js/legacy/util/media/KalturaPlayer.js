var Ext = require('extjs');
var Globals = require('../Globals');
var {isFeature} = Globals;


/*jslint */
/*globals Globals, mw, NextThought, kWidget */
module.exports = exports = Ext.define('NextThought.util.media.KalturaPlayer', {
	reqruies: ['NextThought.util.Globals'],

	statics: {
		PARTNER_ID: '1500101',
		UICONF_ID: $AppConfig.kalturaUIID || '15491291',
		kind: 'video',
		type: 'kaltura',

		valid: function () { return true; },
		contentForExternalViewer: function (source) {
			var vid = source.split(':');

			if (!vid[1]) {
				return Ext.DomHelper.markup({ tag: 'h1', html: 'An error occurred loading the video' });
			}


			return Ext.DomHelper.markup({
				tag: 'div',
				cn: {
					tag: 'script',
					src: Ext.String.format(
							'https://cdnapisec.kaltura.com/p/{0}/sp/150010100/embedIframeJs/uiconf_id/{1}/partner_id/{2}?autoembed=true&entry_id={3}&playerId=kaltura_player_1377036702&cache_st=1377036702&width=1024&height=606&flashvars[akamaiHD.loadingPolicy]=preInitialize&flashvars[akamaiHD.asyncInit]=true&flashvars[twoPhaseManifest]=true&flashvars[streamerType]=hdnetworkmanifest&flashvars[autoPlay]=true',
							this.PARTNER_ID,
							this.UICONF_ID,
							this.PARTNER_ID,
							vid[1])
				}
			});
		},

		PlayerState: {//echo's YouTube's state map
			BUFFERING: 3,
			CUED: 5,
			ENDED: 0,
			PAUSED: 2,
			PLAYING: 1,
			UNSTARTED: -1
		}
	},

	mixins: {
		observable: 'Ext.util.Observable'
	},

	CONTROL_HEIGHT: 30,

	PLAYER_TPL: Ext.DomHelper.createTemplate({
		name: '{id}',
		id: '{id}',
		style: {
			width: '{width}px',
			height: '{height}px'
		},
		cn: [
			{
				tag: 'iframe',
				id: '{id}-iframe',
				name: '{id}-iframe',
				allowfullscreen: 'yes',
				webkitallowfullscreen: 'yes',
				'data-is-ie11-set': (Ext.isIE11p !== undefined),
				src: (Ext.isIE || Ext.isIE11p) ?
						Ext.SSL_SECURE_URL :
						Globals.EMPTY_WRITABLE_IFRAME_SRC,
				frameBorder: 0,
				scrolling: 'no',
				width: '{width}',
				height: '{height}',
				style: {
					zIndex: 1,
					overflow: 'hidden',
					width: '{width}px',
					height: '{height}px'
				}
			}
		]
	}),

	PLAYER_BODY_TPL: Ext.DomHelper.createTemplate([
		'<!DOCTYPE html>',
		{tag: 'html', lang: 'en', cn: [
			{tag: 'head', cn: [
				{ tag: 'title', html: '{id}-sandbox' },
				{ tag: 'meta', 'http-equiv': 'X-UA-Compatible', 'content': 'IE=edge' },
				{ tag: 'script', type: 'text/javascript', src: '{scheme}//cdnapisec.kaltura.com/p/{partnerid}' +
																'/sp/150010100/embedIframeJs/uiconf_id/{uiconfid}/partner_id/{partnerid}'},
				{ tag: 'style', type: 'text/css', cn: [
					'body, html { margin: 0; padding: 0; overflow:hidden; }'
				]}
			]},
			{tag: 'body', cn: [
				{
					id: '{id}', name: '{id}', style: {
						width: '{width}px',
						height: '{height}px'
					}
				},
				{
					tag: 'script',
					//defer: 'defer',
					type: 'text/javascript',
					html: '\n{code}\n'
				}
			]
			}
		]
		}
	]),

	//INITIAL_VIDEO: '0_nmgd4bvw',//This is a 1-frame bogus video to load the player w/ an initial video.
	LEAD_HTML5: (!Ext.isIE9).toString(),

	//Note: reset in the constructor

	//A queue of commands that need to be invoked when the source is actually ready
	commandQueue: [],

	//A flag that indicates if we are waiting on a changeMedia to finish
	changingMediaSource: false,

	changeMediaAttempt: 0,
	maxChangeMediaAttempts: 3,
	changeMediaAttemptIntervalMillis: 100,
	changeMediaTimeoutMillis: 1000,
	neverQueue: ['getPlayerState', 'getCurrentTime'],

	constructor: function (config) {
		var me = this;

		this.mixins.observable.constructor.call(this);

		// We need to externalize these values since they relate to our Kaltura Account.  This is okay for OU since they are paying for it.
		this.PARTNER_ID = NextThought.util.media.KalturaPlayer.PARTNER_ID;
		this.UICONF_ID = NextThought.util.media.KalturaPlayer.UICONF_ID;

		this.globals = {};
		this.el = null;
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId + '-kaltura-video';
		this.player = null;
		this.width = config.width;
		this.height = config.height + ((config.reserveControlSpace && this.CONTROL_HEIGHT) || 0);
		this.currentPosition = 0;
		this.currentState = this.self.PlayerState.UNSTARTED;
		this.makeNotReady();

		this.handleMessage = Ext.bind(this.handleMessage, this);

		this.USE_PROGRESSIVE = isFeature('kaltura.progressive').toString();

		$AppConfig.Preferences.getPreference('WebApp', function (value) {
			me.LEAD_HTML5 = value ? value.get('preferFlashVideo').toString() : 'false';
			me.playerSetup();
		});
	},

	playerSetup: function () {

		if (this.settingUp) {
			return;
		}

		var iframeId,
			data = {
				id: this.id,
				height: this.height,
				width: this.width,
				basePath: location.protocol + '//' + location.host + location.pathname,
				code: this.buildWrapperCode(),
				sheme: location.protocol,
				partnerid: this.PARTNER_ID,
				uiconfid: this.UICONF_ID
			},
			playerSetupTask = {interval: 50},
			me = this;

		this.settingUp = true;

		function stopTask (msg) {
			console[Ext.isEmpty(msg) ? 'log' : 'warn'](me.id, ' Stopping setup task ', msg || '');
			Ext.TaskManager.stop(playerSetupTask);
			delete me.settingUp;
		}

		playerSetupTask.run = function () {
			var doc;

			if (me.playerDeactivated || !Ext.getDom(iframeId)) {
				stopTask('Deactivated during setup task. Stopping');
				me.cleanup();
				return;
			}

			try {
				doc = me.getPlayerContextDocument();
				if (!me.playerDeactivated && doc) {
					if (doc.readyState === 'complete' || doc.readyState === 'uninitialized') {
						stopTask();
						doc.open();
						doc.write(me.PLAYER_BODY_TPL.apply(data));
						doc.close();
						console.log(me.id, ' Setup done for ', me.id);
					}
				}
			}
			catch (e) {
				console.error(me.id, ' Setup died a terrible death', e.stack || e.message || e);
				stopTask(e.stack || e.message || e);
				me.playerErrorHandler(e);
			}
		};

		//		Inject Kaltura Player HTML
		this.el = this.PLAYER_TPL.append(
				this.parentEl, data, true);
		this.iframe = this.el.down('iframe');

		iframeId = this.iframe.id;

		Ext.TaskManager.start(playerSetupTask);
		window.addEventListener('message', this.handleMessage, false);
	},

	handleMessage: function (event) {
		//console.debug('Message:',event);

		var filter = /^kalturaplayer\./i,
			eventData = Ext.decode(event.data, true) || {},
			eventName = eventData.event || '',
			handlerName;

		if (!filter.test(eventName) || this.id !== eventData.id) {
			//console.log('Filtered Out:', this.id, eventData.id);
			return;
		}

		//console.warn('Passed Filter:', this.id, eventData.id, eventData);

		eventName = eventName.replace(filter, '');
		handlerName = eventName + 'Handler';

		if (/error/i.test(eventName)) {
			this.playerErrorHandler(eventName, eventData);
			return;
		}

		if (!Ext.isFunction(this[handlerName])) {
			console.warn(this.id, ' Player does not handle: ' + handlerName, eventData);
			return;
		}

		this[handlerName](eventData);
	},

	setCurrentState: function (s) {
		this.currentState = s;
	},

	sendMessage: function (type, name, data) {
		var context = this.getPlayerContext();
		if (!context) {
			console.warn(this.id, ' No Kaltura Player Context!');
			return;
		}

		console.log(this.id + ' Posting message to kaltura player(' + context.playerId + ')', type, name, data);

		context.postMessage(Ext.encode({ type: type, name: name, data: data }), '*');
	},

	sendCommand: function (name, data, force) {
		var buffer = !force && !Ext.Array.contains(this.neverQueue, name);
		if (this.changingMediaSource && buffer) {
			console.log('Enqueing command ', name, ' because we are chaining sources and it wasnt forced');
			this.commandQueue.push(['command', name, data]);
			return;
		}
		console.debug(this.id + ': Invoking command ', name, 'with', data);
		this.sendMessage('command', name, data);
	},

	buildWrapperCode: function () {
		var code = [],
			me = this;

		function resolve (m, k) {
			return me[k] || m;
		}

		code.push(
			'VideoSupports = ', Ext.encode(NextThought.Video.supports), ';',
			this.playerCode.inject.toString(),
			'window.addEventListener("load",inject,false);');

		return code.join('\n').replace(/%([^%]+)%/gm, resolve);
	},

	getPlayerContext: function () {
		var iframe = Ext.getDom(this.iframe);
		return iframe && (iframe.contentWindow || window.frames[iframe.name]);
	},

	getPlayerContextDocument: function () {
		var f = Ext.getDom(this.iframe),
			w = this.getPlayerContext();

		try {
			return ((f && f.contentDocument) || (w && w.document));
		} catch (e) {
			return null;
		}
	},

	getCurrentTime: function () { return this.currentPosition; },
	getPlayerState: function () { return this.currentState; },

	load: function (src, offset, force) {
		console.log(this.id, ' Kaltura load called with source', src);
		var source = src,
			kalturaData, me = this, sourceActuallyChanging = source !== this.currentSource;

		//We seen the player get confused if you try and changeMedia while
		//its already changing media.  It doesn't happen always but sometimes
		//you end up not getting the corresponding finished loading events.
		//If we are loading buffer this new load request (possibly overwriting a prior
		//bufferened load) until the current load is done.
		if (this.changingMediaSource && !force) {
			console.log('Load in process so defering new load of source', arguments);
			this.bufferedLoad = arguments;
			//Locally queued commands are now in valid so can them
			this.commandQueue = [];
			return;
		}


		//If this source is already loaded treat it like a media ready event
		if (!sourceActuallyChanging && !force) {
			console.log('Short circuiting load because currentSource is already source', source, this.currentSource);
			this.mediaReadyHandler();
			if (offset) {
				this.seek(offset);
			}
			return;
		}


		source = Ext.isArray(source) ? source[0] : source;

		this.currentSource = source;
		this.currentStartAt = offset;

		kalturaData = source.split(':');

		if (Ext.isEmpty(kalturaData[1])) {
			this.dieOnPlay = true;
			return;
		}

		delete this.dieOnPlay;
		if (sourceActuallyChanging) {
			this.commandQueue = [];
		}
		this.changingMediaSource = true;
		this.currentLoadAttempt = [source, offset, true];
		this.changeMediaAttempt++;

		console.log(this.id, kalturaData, source, offset);
		this.sendCommand('changeMedia', {entryId: kalturaData[1]}, true);
		clearTimeout(this.changeMediaTimeout);
		this.changeMediaTimeout = setTimeout(function () {
			var args;
			console.error('Change media timed out', me.changeMediaAttempt, me.maxChangeMediaAttempts, me.bufferedLoad);
			if (me.changeMediaAttempt <= me.maxChangeMediaAttempts) {
				if (!me.maybeDoBufferedLoad(true)) {
					console.log('Attempting retry of load');
					args = me.currentLoadAttempt.slice();
					args.push(true);
					Ext.defer(me.load, me.changeMediaAttemptIntervalMillis, me, args);
				}
				else {
					console.log('Buffered load short circuited retry');
				}
			}
			else {
				console.error('Media still didnt change after', me.maxChangeMediaAttempts, 'attempts');
				me.fireEvent('player-error', 'kaltura');
				//And reset
				me.changeMediaAttempt = 0;
			}
		}, this.changeMediaTimeoutMillis);

		this.currentPosition = 0;
		this.setCurrentState(this.self.PlayerState.UNSTARTED);

		if (offset) {
			this.seek(offset);
		}

	},

	play: function (/*autoPlay*/) {
		if (this.dieOnPlay && !this.changingMediaSource) {
			console.error(this.id, ' No video id provided with source');
			this.fireEvent('player-error', 'kaltura');
			return;
		}
		if (Ext.is.iOS) {
			return;
		}
		console.log(this.id, ' Firing play event');
		this.sendCommand('doPlay');
	},

	pause: function () {
		console.log('Firing pause event');
		console.log('Triggered pause unblocks pause blocker');
		delete this.blockPause;
		this.sendCommand('doPause');
	},

	stop: function () {
		this.sendCommand('doStop');
	},

	deactivate: function () {
		if (this.playerDeactivated) {
			console.warn('Attempting to deactivate a deactivated player');
			return;
		}
		console.log('deactivate');
		delete this.currentSource;
		this.playerDeactivated = true;
		this.fireEvent('player-event-ended', 'kaltura');
		this.cleanup();
	},

	activate: function (sourceId) {
		if (!this.playerDeactivated) {
			console.log('Ignoring activate');
			return;
		}

		delete this.playerDeactivated;

		console.log(this.id, 'Activate triggered');

		if (!this.el && !this.settingUp) {
			console.log(this.id, 'Performing activate');
			this.playerSetup();
			this.onReadyLoadSource = sourceId || (this.currentLoadAttempt || [])[0];
		}
		else {
			console.log(this.id, 'Not doing player setup, but making player ready', this.el, this.settingUp);
			this.readyHandler();
		}
	},

	seek: function (offset) {
		this.currentStartAt = offset;
		this.sendCommand('doSeek', offset);
	},

	cleanup: function () {
		window.removeEventListener('message', this.handleMessage, false);
		var el = Ext.get(this.id);
		this.makeNotReady();
		delete this.el;
		if (el) {
			el.clearListeners();
			Ext.destroy(el);//because we're shelling this thing into an iframe, we can just destroy it.
		}
	},

	playerStateChangeHandler: function (event) {
		var state = event.data[0],
			stateMap = {
				'playbackError': 'onPlaybackError',
				'playing': 'doPlayHandler',
				'paused': 'doPauseHandler',
				'stop': 'doStopHandler'
			};

		if (!this.el) {
			console.error('No element reference. Runaway video!?');
		} else if (!this.el.isVisible(true)) {
			console.warn('Still got events for a Video that is not visible: ' + state);
			if (state === 'playing') {
				console.warn('Stopping hidden player and short circuit state change handler.');
				this.stop();
				return;
			}
		}

		if (this[stateMap[state]]) {
			console.log(this.id, ' Handling state', state);
			this[stateMap[state]]();
		}
		else {
			console.log(this.id, ' Not acting on state', state);
		}
	},

	makeNotReady: function () {
		console.log(this.id, ' KALTURA player is making self not ready');
		this.isReady = false;
	},

	readyHandler: (function () {
		return Ext.Function.createBuffered(function () {
			if (this.onReadyLoadSource) {
				this.load(this.onReadyLoadSource);
				delete this.onReadyLoadSource;
				return;
			}

			console.log(this.id + ' Firing player ready');
			this.isReady = true;
			this.fireEvent('player-ready', 'kaltura');
		}, 250, null, null);
	}()),

	playerUpdatePlayheadHandler: function (event) {
		var position = event.data[0];

		if (this.seekingStart && this.seekingStop) {
			this.fireEvent('player-seek', {start: this.seekingStart, end: this.seekingStop});

			delete this.seekingStart;
			delete this.seekingStop;
		}

		this.currentPosition = event.data[0];
	},

	doPlayHandler: function () {
		var me = this;
		console.log(this.id, ' Blocking pause');
		me.blockPause = true;
		setTimeout(function () {
			console.log(me.id, ' Allowing pause to occur from timeout');
			delete me.blockPause;
		}, 1000);
		console.warn(this.id, ' kaltura fired play handler called', this.currentState, arguments);
		this.setCurrentState(this.self.PlayerState.PLAYING);
		this.fireEvent('player-event-play', 'kaltura');
	},

	doPauseHandler: function () {
		console.warn(this.id, ' kaltura fired paused', this.currentState);

		if (this.blockPause) {
			console.log(this.id, ' Initating blocked pause');
			delete this.blockPause;
			this.play(true);
			this.seek(this.currentStartAt);
			return;
		}

		this.setCurrentState(this.self.PlayerState.PAUSED);
		this.fireEvent('player-event-pause', 'kaltura');
	},

	durationChangeHandler: function (message) {
		var data = message && message.data,
			obj = data && data[0],
			duration = (obj && obj.newValue) || 0;

		//duration will be in seconds so make it in milli like
		//everything else in JS
		this.video_duration = duration * 1000;
	},

	updatedPlaybackRateHandler: function (message) {
		var data = message && message.data,
			rate = data && data[0];

		rate = (rate && parseFloat(rate, 10)) || 1;

		this.fireEvent('playback-speed-changed', this.playbackSpeed || 1, rate);

		this.playbackSpeed = rate;
	},

	getDuration: function () {
		return this.video_duration;
	},

	getPlaybackSpeed: function () {
		return this.playbackSpeed || 1;
	},

	playerPlayEndHandler: function () {
		if (this.isFullScreenMode) {
			this.deferDeactivateTillExit = true;
			return;
		}
		this.deactivate();
		this.setCurrentState(this.self.PlayerState.ENDED);
		this.fireEvent('player-event-ended', 'kaltura');

		//As an optimization if we are a child of the overview-part
		//(which will activate when necessary) reactivate us so
		//we are ready to replay
		Ext.defer(this.activate, 1, this, [this.currentSource]);
	},

	openFullScreenHandler: function () {
		this.isFullScreenMode = true;
		console.log('Entered full screen mode: ', arguments);
	},

	closeFullScreenHandler: function () {
		console.log('Exited fullscreen mode: ', arguments);

		// Do the deactivation we deferred at the end of the video,
		if (this.isFullScreenMode && this.deferDeactivateTillExit) {
			Ext.defer(this.playerPlayEndHandler, 1, this);
			delete this.deferDeactivateTillExit;
		}
		delete this.isFullScreenMode;
	},

	dequeueCommands: function () {
		while (this.commandQueue && !Ext.isEmpty(this.commandQueue)) {
			var args = this.commandQueue.shift();
			this.sendMessage.apply(this, args);
		}
	},

	playerErrorHandler: function () {
		console.error(this.id, ' kaltura error ', arguments);
		this.fireEvent('player-error', 'kaltura');
		//this.onPlaybackError();
	},

	onPlaybackError: function () {
		var me = this,
			ctx = me.getPlayerContext(),
			playerMode = ctx && ctx.playerMode;

		Error.raiseForReport({
			msg: Ext.String.format('Kaltura Playback Error: PartnerID: {0}, UIConf: {1}, LEAD_HTML5: {3}, Mode: {4}, Current Source: {2}',
					me.PARTNER_ID,
					me.UICONF_ID,
					me.currentSource,
					me.LEAD_HTML5,
					playerMode
				)
		});
	},

	entryFailedHandler: function () {
		this.onPlaybackError();
	},

	entryNotAvailable: function () {
		this.onPlaybackError();
	},

	maybeDoBufferedLoad: function (force) {
		if (!Ext.isEmpty(this.bufferedLoad)) {
			console.log('Performing bufferedLoad', this.bufferedLoad);
			var args = this.bufferedLoad;
			delete this.bufferedLoad;
			this.load(args[0], args[1], force);
			return true;
		}
		return false;
	},

	playerSeekStartHandler: function () {
		this.seekingStart = this.currentPosition;
	},

	doSeekHandler: function (event) {
		this.seekingStop = event.data[0];
	},

	changeMediaHandler: function () {
		console.debug(this.id + ' ****** CHANGE MEDIA HANDLER *****');
		this.changingMediaSource = false;
		this.changeMediaAttempt = 0;
		clearTimeout(this.changeMediaTimeout);
		this.maybeDoBufferedLoad();

		//For the html5 player we could dequeue here, but the flash player
		//doesn't like getting the play event until it fires media ready.  That
		//happens at some time in the future
	},

	kdpReadyHandler: function () {
		console.log(this.id, 'KDP ready handler fired');
		this.readyHandler();
	},

	kdpEmptyHandler: function () {
		this.readyHandler();
	},

	mediaErrorHandler: function () {
		console.log(this.id, ' MEDIA ERROR', arguments);
	},

	sourceReadyHandler: function () {
		console.log(this.id, ' SOURCE READY', arguments);
	},

	readyToPlayHandler: function () {
		console.log(this.id, ' This is ready to play');
		this.readyHandler();
	},

	entryReadyHandler: function (obj) {
		var data = obj.data || [],
			vid = data[0] || {};
		console.log(this.id, ' This entry is ready with id', vid.id);
		this.readyHandler();
	},

	entryFailedHander: function () {
		console.log('ENTRY Failed handler');
	},

	mediaLoadedHandler: function () {
		console.log(this.id, ' This media is loaded');
		this.readyHandler();
	},

	mediaReadyHandler: function () {
		console.log(this.id, ' MEDIA Ready', arguments);
		if (!this.changingMediaSource) {
			this.dequeueCommands();
		}
		this.readyHandler();
	},

	playerCode: {


		inject: function inject () {

			console.log = console.log || function () {};
			console.debug = console.debug || console.log || function () {};

			var leadWithExpirementalHTML5 = false,
				vars = {
					externalInterfaceDisabled: false,
					autoPlay: false,
					streamerType: 'http'
				};

			window.playerId = '%id%';
			window.host = window.top;

			function send (event, data) {
				//console.log('Event: '+event, playerId, data);
				host.postMessage(JSON.stringify({ event: 'kalturaplayer.' + event, id: playerId, data: data }), '*');
			}

			function makeHandler (name) {
				var newName = '__' + name,
					seen = {};

				window[newName] = function (id) {
					seen[name] = (seen[name] || 0) + 1;

					if (/error/i.test(name) && seen[name] < 2) {
						console.warn(window.playerId + ' Ignoring intial errors about no source', name, arguments);
						return;
					}

					send(name, Array.prototype.slice.call(arguments));
				};
				return newName;
			}

			function playerReady () {
				var player = document.getElementById(playerId),
					events = [
							'changeMedia',
							'closeFullScreen',
							'entryFailed',
							'entryNotAvailable',
							'entryReady',
							'initiateApp',
							'kdpEmpty',
							'kdpReady',
							'layoutReady',
							'mediaLoaded',
							'mediaLoadError',
							'mediaReady',
							'openFullScreen',
							'playerPlayEnd',
							'playerStateChange',
							'playerUpdatePlayhead',
							'pluginsLoaded',
							'readyToLoad',
							'readyToPlay',
							'singlePluginFailedToLoad',
							'singlePluginLoaded',
							'skinLoaded',
							'skinLoadFailed',
							'sourceReady',
							'startup',
							'playerSeekStart',
							'playerSeekEnd',
							'doSeek',
							'durationChange',
							'updatedPlaybackRate'
						],
					i = events.length - 1;

				for (i; i >= 0; i--) {
					player.addJsListener(events[i], makeHandler(events[i]));
				}

				window.playerMode = player.tagName === 'OBJECT' ? 'Flash' : 'HTML5';
				console.log(window.playerId, 'Player is ', playerMode);
			}


			function handleMessage (event) {
				var eventData, player, state;
				try {
					eventData = JSON.parse(event.data);
					player = document.getElementById(playerId);
					console.debug('Player Command to: ' + playerId + ', command: ' + eventData.name + ', data:', eventData.data);

					state = player.evaluate('{video.player.state}');
					if (eventData.name === 'doStop' && (state && state !== 'playing')) {
						console.warn('Skipping doStop commmand because player is not playing: ' + state);
						return;
					}
					player.sendNotification(eventData.name, eventData.data);
				}
				catch (er) {
					console.warn(er.stack || er.message || er);
				}
			}


			window.addEventListener('message', handleMessage, false);




			// Allow AirPlay
			mw.setConfig('EmbedPlayer.WebKitAllowAirplay', true);
			// Do not rewrite video tags willy-nilly
			mw.setConfig('EmbedPlayer.RewriteSelector', false);
			// Force HTML5 player on mobile devices
			mw.setConfig('EmbedPlayer.forceMobileHTML5', true);

			//We need to make the HTML5 video work.
			// Flash won't work w/o Microsoft's blessing in IE on Windows8. (And we don't have that blessing btw)
			mw.setConfig('Kaltura.ForceFlashOnIE10', false);

			//This may fix Safari's full screen.
			//mw.setConfig( 'EmbedPlayer.FullScreenZIndex', 999999 );

			//May make mobile video player less agressive... *shrug*
			//mw.setConfig( 'EmbedPlayer.WebKitPlaysInline', true );

			if (VideoSupports.m3u8) {
				//Note this does nothing for me, I think they only use it so you can turn it off on ios devices.
				//IE the only respect false.
				//May help with the quality negotiations
				mw.setConfig('Kaltura.UseAppleAdaptive', true);
				//If the above ever starts working we may need html5
				//leadWithExpirementalHTML5 = true;
			}

			if (!leadWithExpirementalHTML5) {
				leadWithExpirementalHTML5 = JSON.parse('%LEAD_HTML5%');
			}

			// Force HTML5 player over Flash player
			mw.setConfig('KalturaSupport.LeadWithHTML5', leadWithExpirementalHTML5);

			//IPad settings
			//mw.setConfig('EmbedPlayer.EnableIpadHTMLControls', false); //enables native controls with native fullscreen
			mw.setConfig('EmbedPlayer.EnableIpadNativeFullscreen', true); //Enables HTML5 controls with native full screen

			//mw.setConfig('debug', true);

			if (!JSON.parse('%USE_PROGRESSIVE%')) {
				console.debug('Kaltura being instructed to be streaming...');
				vars.streamerType = 'hdnetworkmanifest';
				vars.twoPhaseManifest = 'true';
				vars.akamaiHD = {
					loadingPolicy: 'preInitialize',
					asyncInit: 'true'
				};
			} else {
				console.debug('Kaltura being instructed to be progressive download...');
			}

			kWidget.embed({
				targetId: playerId,
				wid: '_%PARTNER_ID%',
				uiconf_id: '%UICONF_ID%',
				flashvars: vars,
				params: {
					wmode: 'transparent'
				},
				readyCallback: playerReady
			});
		}


	}
});
