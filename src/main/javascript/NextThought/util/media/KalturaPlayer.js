/*jslint */
/*globals Globals, mw, NextThought, kWidget */
Ext.define('NextThought.util.media.KalturaPlayer',{

	statics:{
		kind:'video',
		type: 'kaltura',
		valid: function(){
			return true;
		}
	},

	requires: [
		'NextThought.util.Globals'
	],

	mixins: {
		observable: 'Ext.util.Observable'
	},

	PLAYER_TPL: Ext.DomHelper.createTemplate({
		name: '{id}',
		id: '{id}',
		style: {
			width:'{width}px',
			height:'{height}px'
		},
		cn: [{
			tag:'iframe',
			id: '{id}-iframe',
			name: '{id}-iframe',
			allowfullscreen: true,
//			webkitallowfullscreen: true,
			src: Ext.SSL_SECURE_URL,
			frameBorder: 0,
            scrolling: 'no',
			seamless: true,
			width:'{width}',
			height:'{height}',
			style:{
				zIndex: 1,
				overflow: 'hidden',
				width:'{width}px',
				height:'{height}px'
			}
		}]
	}),


	PLAYER_BODY_TPL: Ext.DomHelper.createTemplate([
		'<!DOCTYPE html>',
		{tag:'html', lang:'en', cn:[
			{tag:'head',cn:[
				{ tag:'title', html:'{id}-sandbox' },
				{ tag:'meta', 'http-equiv':'X-UA-Compatible', 'content':'IE=edge' },
				{ tag:'script', type:'text/javascript', src:('{basePath}resources/lib/jQuery-1.8.0min.js') },
//				{ tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/html5/html5lib/v1.7.0.12/mwEmbedLoader.php') },
//				{ tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/html5/html5lib/v1.7.4/mwEmbedLoader.php') },
				{ tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/p/1500101/sp/150010100/embedIframeJs/uiconf_id/15491291/partner_id/1500101') },
//				{ tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/html5/html5lib/v1.8.9/mwEmbedLoader.php') },
//				{ tag:'script', type:'text/javascript', src:(location.protocol+'//html5.kaltura.org/js') },
				{ tag:'style', type:'text/css', cn:[
					'body, html { margin: 0; padding: 0; overflow:hidden; }'
				]}
			]},
			{tag:'body', cn:[
				{
					id: '{id}', name: '{id}', style: {
						width:'{width}px',
						height:'{height}px'
					}
				},
				{
					tag: 'script',
//					defer: 'defer',
					type: 'text/javascript',
					html: '\n{code}\n'
				}]
			}]
		}
	]),


	// We need to externalize these values since they relate to our Kaltura Account.  This is okay for OU since they are paying for it.
	PARTNER_ID: '1500101',
	UICONF_ID: '15491291',
	INITIAL_VIDEO: '0_nmgd4bvw',//This is a 1-frame bogus video to load the player w/ an initial video.
	LEAD_HTML5: (!Ext.isIE9).toString(), //Note: reset in the constructor

	//A queue of commands that need to be invoked when the source is actually ready
	commandQueue: [],

	//A flag that indicates if we are waiting on a changeMedia to finish
	changingMediaSource: false,

	changeMediaAttempt: 0,
	maxChangeMediaAttempts: 3,
	changeMediaAttemptIntervalMillis: 100,
	changeMediaTimeoutMillis: 1000,

	constructor: function(config){
		this.mixins.observable.constructor.call(this);
	    this.globals = {};
		this.el = null;
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId+'-kaltura-video';
		this.player = null;
		this.width = config.width;
		this.height = config.height;
		this.currentPosition = 0;
		this.currentState = -1;
		this.makeNotReady();

		this.handleMessage = Ext.bind(this.handleMessage,this);

		this.LEAD_HTML5 = this.shouldUseHtml5().toString();

		this.playerSetup();
	},


	shouldUseHtml5: function(){
		return !Ext.isIE9 && !$AppConfig.kalturaPreferFlash;
	},


	playerSetup: function(){

		if(this.settingUp){
			return;
		}

		var data = {
				id: this.id,
				height: this.height,
				width: this.width,
				basePath: location.protocol+'//'+location.host+location.pathname,
				code: this.buildWrapperCode()
			},
			playerSetupTask = {interval: 50},
			me = this;

		this.settingUp = true;

		function stopTask(msg){
			console[Ext.isEmpty(msg)?'log':'warn'](me.id, ' Stopping setup task ', msg||'');
			Ext.TaskManager.stop(playerSetupTask);
			delete me.settingUp;
		}

		playerSetupTask.run = function () {
			var doc;

			if(me.playerDeactivated){
				stopTask('Deactivated during setup task. Stopping');
				return;
			}

			try{
				doc = me.getPlayerContextDocument();
			}
			catch(e){
				stopTask(e.stack || e.message || e);
				return;
			}

			if (doc && doc.readyState === 'complete') {
				stopTask();
				try{
					doc.open();
					doc.write(me.PLAYER_BODY_TPL.apply(data));
					doc.close();
					console.log(me.id,' Setup done for ', me.id);
				}
				catch(er){
					console.error(me.id,' Setup died a terrible death', er.stack || er.message || er);
					me.playerErrorHandler(er);
				}
			}
		};

		//		Inject Kaltura Player HTML
		this.el = this.PLAYER_TPL.append(
			this.parentEl, data, true);
		this.iframe = this.el.down('iframe');

		Ext.TaskManager.start(playerSetupTask);
		window.addEventListener("message", this.handleMessage, false);
	},


	handleMessage: function(event){
		//console.debug('Message:',event);

		var filter = /^kalturaplayer\./i,
			eventData = Ext.decode(event.data,true) || {},
			eventName = eventData.event||'',
			handlerName;

		if(!filter.test(eventName) || this.id !== eventData.id ){
			//console.log('Filtered Out:', this.id, eventData.id);
			return;
		}

		//console.warn('Passed Filter:', this.id, eventData.id, eventData);

		eventName = eventName.replace(filter,'');
		handlerName = eventName+'Handler';

		if(/error/i.test(eventName)){
			this.playerErrorHandler(eventName, eventData);
			return;
		}

		if(!Ext.isFunction(this[handlerName])){
			console.warn(this.id,' Player does not handle: '+handlerName, eventData);
			return;
		}

		this[handlerName](eventData);
	},


	sendMessage: function(type,name,data){
        var context = this.getPlayerContext();
        if(!context){
	        console.warn(this.id,' No Kaltura Player Context!');
	        return;
        }

		console.log(this.id,' Posting message to kaltura player', type, name, data);

		context.postMessage(Ext.encode({
			type: type,
			name: name,
			data: data
		}),'*');
	},


	sendCommand: function(name,data,force){
		if(this.changingMediaSource && !force){
			console.log('Enqueing command ', name, ' because we are chaining sources and it wasnt forced');
			this.commandQueue.push(['command', name, data]);
			return;
		}
		console.debug('Invoking command ', name, 'with', data);
		this.sendMessage('command', name, data);
	},


	buildWrapperCode: function(){
		var code = [],
			me = this;

		function resolve(m, k){
			return me[k] || m;
		}

		code.push(this.playerCode.inject.toString());
		code.push('window.addEventListener("load",inject,false);');

		return code.join('\n').replace(/%([^%]+)%/gm,resolve);
	},


	getPlayerContext: function(){
		var iframe = Ext.getDom(this.iframe);
		return iframe && (iframe.contentWindow || window.frames[iframe.name]);
	},


	getPlayerContextDocument: function(){
		var f = Ext.getDom(this.iframe),
			w = this.getPlayerContext();

		return ((f && f.contentDocument) || (w && w.document));
	},


	getCurrentTime: function(){ return this.currentPosition; },


	getPlayerState: function(){ return this.currentState; },


	load: function(source, offset, force){
		console.log(this.id,' Kaltura load called with source', source);
		var kalturaData, me = this, sourceActuallyChanging = source !== this.currentSource ;

		//We seen the player get confused if you try and changeMedia while
		//its already changing media.  It doesn't happen always but sometimes
		//you end up not getting the corresponding finished loading events.
		//If we are loading buffer this new load request (possibly overwriting a prior
		//bufferened load) until the current load is done.
		if(this.changingMediaSource && !force){
			console.log('Load in process so defering new load of source', arguments);
			this.bufferedLoad = arguments;
			//Locally queued commands are now in valid so can them
			this.commandQueue = [];
			return;
		}



		//If this source is already loaded treat it like a media ready event
		if(sourceActuallyChanging && !force){
			console.log('Short circuiting load because currentSource is already source', source, this.currentSource);
			this.mediaReadyHandler();
			if(offset){
				this.seek(offset);
			}
			return;
		}


		source = Ext.isArray(source) ? source[0] : source;

		this.currentSource = source;
		this.currentStartAt = offset;

		kalturaData = source.split(':');

		if(Ext.isEmpty(kalturaData[1])){
			this.dieOnPlay = true;
			return;
		}

		delete this.dieOnPlay;
		if(sourceActuallyChanging){
			this.commandQueue = [];
		}
		this.changingMediaSource = true;
		this.currentLoadAttempt = [source, offset, true];
		this.changeMediaAttempts++;

		console.log(this.id, kalturaData, source, offset);
		this.sendCommand('changeMedia', {entryId: kalturaData[1]}, true);
		clearTimeout(this.changeMediaTimeout);
		this.changeMediaTimeout = setTimeout(function(){
			var args;
			console.error('Change media timed out', me.changeMediaAttempt, me.maxChangeMediaAttempts, me.bufferedLoad);
			if(me.changeMediaAttempt <= me.maxChangeMediaAttempts){
				if(!me.maybeDoBufferedLoad(true)){
					console.log('Attempting retry of load');
					args = me.currentLoadAttempt.slice();
					args.push(true);
					Ext.defer(me.load, me.changeMediaAttemptIntervalMillis, me, args);
				}
				else{
					console.log('Buffered load short circuited retry');
					this.fireEvent('player-error', 'kaltura');
				}
			}
			else{
				console.error('Media still didnt change after', me.maxChangeMediaAttempts, 'attempts');
			}
		}, this.changeMediaTimeoutMillis);

		this.currentPosition = 0;
		this.currentState = -1;

		if (offset) {
			this.seek(offset);
		}

	},


	play: function(autoPlay){
		if(this.dieOnPlay && !this.changingMediaSource){
			console.error(this.id,' No video id provided with source');
			this.fireEvent('player-error', 'kaltura');
			return;
		}
		console.log(this.id,' Firing play event');
		this.sendCommand('doPlay');
	},


	pause: function(){
		console.log('Firing pause event');
		console.log('Triggered pause unblocks pause blocker');
		delete this.blockPause;
		this.sendCommand('doPause');
	},


	stop: function(){
		this.sendCommand('doStop');
	},


	deactivate: function(){
		if(this.playerDeactivated){
			console.warn('Attempting to deactivate a deactivated player');
			return;
		}
		console.log('deactivate');
		this.playerDeactivated = true;
		this.fireEvent('player-event-ended', 'kaltura');
		this.cleanup();
	},


	activate: function(sourceId){
		if(!this.playerDeactivated){
			console.log('Ignoring activate');
			return;
		}

		delete this.playerDeactivated;

		console.log(this.id, 'Activate triggered');

		if(!this.el && !this.settingUp){
			console.log(this.id, 'Performing activate');
			this.playerSetup();
			this.onReadyLoadSource = sourceId;
		}
		else{
			console.log(this.id, 'Not doing player setup, but making player ready', this.el, this.settingUp);
			this.readyHandler();
		}
	},


	seek: function(offset){
		this.currentStartAt = offset;
		this.sendCommand('doSeek', offset);
	},


	cleanup: function(){
		window.removeEventListener("message", this.handleMessage, false);
		var el = Ext.get(this.id);
		this.makeNotReady();
		delete this.el;
		if( el ) {
			el.clearListeners();
			Ext.destroy(el);//because we're shelling this thing into an iframe, we can just destroy it.
		}
	},


	playerStateChangeHandler: function(event){
		var state = event.data[0],
			stateMap = {
			'playing': 'doPlayHandler',
			'paused': 'doPauseHandler',
			'stop': 'doStopHandler'
		};

		if(Ext.isFunction(this[stateMap[state]])){
			console.log(this.id,' Handling state', state);
			this[stateMap[state]]();
		}
		else{
			console.log(this.id,' Not acting on state', state);
		}
	},


	makeNotReady: function(){
		console.log(this.id,' KALTURA player is making self not ready');
		this.isReady = false;
	},


	readyHandler: (function(){
		return Ext.Function.createBuffered(function(){
			if(this.onReadyLoadSource){
				this.load(this.onReadyLoadSource);
				delete this.onReadyLoadSource;
				return;
			}

			console.log('Firing player ready',this);
			this.isReady = true;
			this.fireEvent('player-ready', 'kaltura');
		},250, null, null);
	}()),


	playerUpdatePlayheadHandler: function(data){
		this.currentPosition = data;
	},


	doPlayHandler: function(){
		var me = this;
		console.log(this.id,' Blocking pause');
		me.blockPause = true;
		setTimeout(function(){
			console.log(me.id,' Allowing pause to occur from timeout');
			delete me.blockPause;
		}, 1000);
		console.warn(this.id,' kaltura fired play handler called', this.currentState, arguments);
		this.currentState = 1;
		this.fireEvent('player-event-play', 'kaltura');
	},


	doPauseHandler: function(){
		console.warn(this.id,' kaltura fired paused', this.currentState);

		if(this.blockPause){
			console.log(this.id,' Initating blocked pause');
			delete this.blockPause;
			this.play(true);
			return;
		}

		this.currentState = 2;
		this.fireEvent('player-event-pause', 'kaltura');
	},


	playerPlayEndHandler: function(){
		var reactivate = !this.el || !this.el.up('.x-component-course[id^="course-overview-video"]');
		this.deactivate();
		this.currentState = 0;
		this.fireEvent('player-event-ended', 'kaltura');

		//As an optimization if we are a child of the overview-part
		//(which will activate when necessary) reactivate us so
		//we are ready to replay
		if(reactivate){
			Ext.defer(this.activate, 1, this, [this.currentSource]);
		}
	},


	dequeueCommands: function(){
		while(this.commandQueue && !Ext.isEmpty(this.commandQueue)){
			var args = this.commandQueue.shift();
			this.sendMessage.apply(this, args);
		}
	},


	playerErrorHandler: function(){
		console.error(this.id,' kaltura error ', arguments);
		this.fireEvent('player-error', 'kaltura');
	},


	maybeDoBufferedLoad: function(force){
		if(!Ext.isEmpty(this.bufferedLoad)){
			console.log('Performing bufferedLoad', this.bufferedLoad);
			var args = this.bufferedLoad;
			delete this.bufferedLoad;
			this.load(args[0], args[1], force);
			return true;
		}
		return false;
	},


	changeMediaHandler: function(){
		console.error('****** CHANGE MEDIA HANDLER *****', arguments);
		this.changingMediaSource = false;
		this.changeMediaAttempt = 0;
		clearTimeout(this.changeMediaTimeout);
		this.maybeDoBufferedLoad();

		//For the html5 player we could dequeue here, but the flash player
		//doesn't like getting the play event until it fires media ready.  That
		//happens at some time in the future
	},


	kdpReadyHandler: function(){
		console.log(this.id, 'KDP ready handler fired');
		this.readyHandler();
	},


	kdpEmptyHandler: function(){
		this.readyHandler();
	},


	mediaErrorHandler: function(){
		console.log(this.id,' MEDIA ERROR', arguments);
	},

	sourceReadyHandler: function(){
		console.log(this.id,' SOURCE READY', arguments);
	},


	readyToPlayHandler: function(){
		console.log(this.id,' This is ready to play');
		this.readyHandler();
	},

	entryReadyHandler: function(obj){
		var data = obj.data || [],
			vid = data[0] || {};
		console.log(this.id,' This entry is ready with id', vid.id);
		this.readyHandler();
	},


	entryFailedHander: function(){
		console.log('ENTRY Failed handler');
	},

	mediaLoadedHandler: function(){
		console.log(this.id,' This media is loaded');
		this.readyHandler();
	},

	mediaReadyHandler: function(){
		console.log(this.id,' MEDIA Ready', arguments);
		if(!this.changingMediaSource){
			this.dequeueCommands();
		}
		this.readyHandler();
	},


	playerCode:{

		inject: function inject(){

			window.playerId = '%id%';
			window.host = window.top;

			function send(event,data){
				//console.log('Event: '+event, playerId, data);
				host.postMessage(JSON.stringify({
					event: 'kalturaplayer.'+event,
					id: playerId,
					data: data
				}),'*');
			}

			function makeHandler(name){
				var newName = '__'+name,
					seen = {};

				window[newName] =  function(id){
					seen[name] = (seen[name]||0) + 1;

					if(/error/i.test(name) && seen[name] < 2){
						console.warn(window.playerId+' Ignoring intial errors about no source',name, arguments);
						return;
					}

					send(name,Array.prototype.slice.call(arguments));
				};
				return newName;
			}

			function playerReady(){
				var player = document.getElementById(playerId),
					events = ['kdpReady', 'startup', 'initiateApp', 'kdpEmpty',
						'layoutReady', 'pluginsLoaded','skinLoaded', 'skinLoadFailed',
						'singlePluginLoaded', 'singlePluginFailedToLoad','mediaLoaded', 'entryReady',
						'readyToPlay', 'sourceReady', 'mediaReady', 'playerStateChange',
						'playerUpdatePlayhead','playerPlayEnd','mediaLoadError', 'readyToLoad',
						'entryFailed', 'entryNotAvailable', 'changeMedia'],
					i = events.length - 1;

				for(i; i>=0; i--){
					player.addJsListener(events[i],makeHandler(events[i]));
				}

				console.log(window.playerId, 'Player is ', player.tagName);
			}


			function handleMessage(event){
				var eventData, player;
				try {
					eventData = JSON.parse(event.data);
					player = document.getElementById(playerId);
					//console.debug('From '+playerId+', to app:', eventData);
					player.sendNotification(eventData.name,eventData.data);
				}
				catch(er){
					console.warn(er.stack||er.message||er);
				}
			}


			window.addEventListener('message', handleMessage, false);

			// Force HTML5 player over Flash player
			mw.setConfig( 'KalturaSupport.LeadWithHTML5', JSON.parse('%LEAD_HTML5%') );
			// Allow AirPlay
			mw.setConfig('EmbedPlayer.WebKitAllowAirplay', true);
			// Do not rewrite video tags willy-nilly
			mw.setConfig( 'EmbedPlayer.RewriteSelector', false );
			// Force HTML5 player on mobile devices
			mw.setConfig( 'EmbedPlayer.forceMobileHTML5', true );

			//We need to make the HTML5 video work.
			// Flash won't work w/o Microsoft's blessing in IE on Windows8. (And we don't have that blessing btw)
			mw.setConfig( 'Kaltura.ForceFlashOnIE10', true );

			//This may fix Safari's full screen.
			//mw.setConfig( 'EmbedPlayer.FullScreenZIndex', 999999 );
			//May make mobile video player less agressive... *shrug*
			//mw.setConfig( 'EmbedPlayer.WebKitPlaysInline', true );
			//May help with the quality negotiations
			//mw.setConfig('Kaltura.UseAppleAdaptive', true);

			//IPad settings
			//mw.setConfig('EmbedPlayer.EnableIpadHTMLControls', false); //enables native controls with native fullscreen
			mw.setConfig('EmbedPlayer.EnableIpadNativeFullscreen', true); //Enables HTML5 controls with native full screen

			//mw.setConfig('debug', true);

			kWidget.embed({
				targetId: playerId,
				wid: '_%PARTNER_ID%',
				uiconf_id: '%UICONF_ID%',
				flashvars: {
					"mediaProxy.preferedFlavorBR": 1500,//This makes the 1.5Mbps stream preferd
					"externalInterfaceDisabled": false,
					"akamaiHD": {
						"loadingPolicy": "preInitialize",
						"asyncInit": "true"
					},
					"twoPhaseManifest": "true",
					"streamerType": "hdnetworkmanifest",
					"autoPlay": false
				},
				params:{
					wmode: 'transparent'
				},
				readyCallback: playerReady
			});
		}


	}
});
