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
				{tag:'script', type:'text/javascript', src:('{basePath}resources/lib/jQuery-1.8.0min.js')},
//				{tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/html5/html5lib/v1.7.0.12/mwEmbedLoader.php')},
//				{tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/html5/html5lib/v1.7.4/mwEmbedLoader.php')},
				{tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/p/1500101/sp/150010100/embedIframeJs/uiconf_id/15491291/partner_id/1500101')},
//				{tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapisec.kaltura.com/html5/html5lib/v1.8.9/mwEmbedLoader.php')},
//				{tag:'script', type:'text/javascript', src:(location.protocol+'//html5.kaltura.org/js')},
				{tag:'style', type:'text/css', cn:[
					'body, html { margin: 0; padding: 0; }'
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
					tag:'script',
					type:'text/javascript',
					html:'\n{code}\n'
				}
			]}]
		}
	]),


	// We need to externalize these values since they relate to our Kaltura Account.  This is okay for OU since they are paying for it.
	PARTNER_ID: '1500101',
	UICONF_ID: '15491291',
	INITIAL_VIDEO: '0_nmgd4bvw',//This is a 1-frame bogus video to load the player w/ an initial video.

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
		this.isReady = false;

		this.handleMessage = Ext.bind(this.handleMessage,this);
		this.playerSetup();
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

		playerSetupTask.run = function () {
			var doc = me.getPlayerContextDocument();
			if (doc.body || doc.readyState === 'complete') {
				delete me.settingUp;
				Ext.TaskManager.stop(playerSetupTask);
				try{
					doc.open();
					doc.write(me.PLAYER_BODY_TPL.apply(data));
					doc.close();
					console.log('Setup done for ', me.id);
				}
				catch(e){
					console.error('Setup died a terrible death', e);
					me.playerErrorHandler(e);
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
			console.warn('Player does not handle: '+handlerName, eventData);
			return;
		}

		this[handlerName](eventData);
	},


	sendMessage: function(type,name,data){
        var context = this.getPlayerContext();
        if(!context){
	        console.warn('No Kaltura Player Context!');
	        return;
        }

		console.log('Posting message to kaltura player', type, name, data);

		context.postMessage(Ext.encode({
			type: type,
			name: name,
			data: data
		}),'*');
	},


	sendCommand: function(name,data,force){
		this.sendMessage('command',name,data);
	},


	buildWrapperCode: function(){
		var code = [],
			me = this;

		function resolve(m, k){
			return me[k] || m;
		}

		code.push(this.playerCode.inject.toString());
		code.push('$(inject);');

		return code.join('\n').replace(/%([^%]+)%/gm,resolve);
	},


	getPlayerContext: function(){
		var iframe = Ext.getDom(this.iframe);
		return iframe && (iframe.contentWindow || window.frames[iframe.name]);
	},


	getPlayerContextDocument: function(){
		var doc = (Ext.getDom(this.iframe).contentDocument || this.getPlayerContext().document);
		if( doc && !doc.body ){
			doc.body = doc.getElementsByTagName('body')[0];
		}
		return doc;
	},


	getCurrentTime: function(){ return this.currentPosition; },


	getPlayerState: function(){ return this.currentState; },


	load: function(source, offset){
		console.log('Kaltura load called with source', source);
		var kalturaData;

		source = Ext.isArray(source) ? source[0] : source;

		//Removed per sean, seems to help the html5 player
		//this.sendCommand('cleanMedia', undefined, true);

		this.currentSource = source;
		this.currentStartAt = offset;

		kalturaData = source.split(':');

		if(Ext.isEmpty(kalturaData[1])){
			this.dieOnPlay = true;
			return;
		}

		delete this.dieOnPlay;

		this.isReady = false;

		//console.log(kalturaData, source, offset);
		this.sendCommand('changeMedia', {entryId: kalturaData[1]}, true);
		this.currentPosition = 0;
		this.currentState = -1;

		if (offset) {
			this.seek(offset);
		}

	},


	play: function(){
		if(this.dieOnPlay){
			console.error('No video id provided with source');
			this.fireEvent('player-error', 'kaltura');
			return;
		}
		console.log('Firing play event');
		this.sendCommand('doPlay');
	},


	pause: function(){
		console.log('Firing pause event');
		console.log('Triggered pause unblocks pause blocker');
		delete this.blockPause;
		this.sendCommand('doPause');
	},


	stop: function(){
		this.isReady = false;
		this.sendCommand('doStop');
		this.readyHandler();
	},


	deactivate: function(){
		console.log('deactivate');
		this.fireEvent('player-event-ended', 'kaltura');
		this.cleanup();
		this.playerSetup();
		this.load(this.currentSource);
	},


	seek: function(offset){
		this.currentStartAt = offset;
		this.sendCommand('doSeek', offset);
	},


	cleanup: function(){
		window.removeEventListener("message", this.handleMessage, false);
		var el = Ext.get(this.id);
		this.isReady = false;
		el.clearListeners();
		Ext.destroy(el);//because we're shelling this thing into an iframe, we can just destroy it.
	},


	playerStateChangeHandler: function(event){
		var state = event.data[0],
			stateMap = {
			'playing': 'doPlayHandler',
			'paused': 'doPauseHandler'
		};

		if(Ext.isFunction(this[stateMap[state]])){
			console.log('Handling state', state);
			this[stateMap[state]]();
		}
		else{
			console.log('Not acting on state', state);
		}
	},


	kdpReadyHandler: function(){
		this.readyHandler();
	},


	kdpEmptyHandler: function(){
		this.readyHandler();
	},


	readyHandler: (function(){
		return Ext.Function.createBuffered(function(){
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
		console.log('Blocking pause');
		me.blockPause = true;
		setTimeout(function(){
			console.log('Allowing pause to occur from timeout');
			delete me.blockPause;
		}, 1000);
		console.warn('kaltura fired play handler called', this.currentState, arguments);
		this.currentState = 1;
		this.fireEvent('player-event-play', 'kaltura');
	},


	doPauseHandler: function(){
		console.warn('kaltura fired paused', this.currentState);

		if(this.blockPause){
			console.log('Initating blocked pause');
			delete this.blockPause;
			this.play();
			return;
		}

		this.currentState = 2;
		this.fireEvent('player-event-pause', 'kaltura');
	},


	playerPlayEndHandler: function(){
		this.stop();
		this.currentState = 0;
		this.fireEvent('player-event-ended', 'kaltura');
	},


	playerErrorHandler: function(){
		console.error('kaltura error ', arguments);
		this.fireEvent('player-error', 'kaltura');
	},


	mediaErrorHandler: function(){
		console.log('MEDIA ERROR', arguments);
	},

	sourceReadyHandler: function(){
		console.log('SOURCE READY', arguments);
	},


	readyToPlayHandler: function(){
		console.log('This is ready to play');
		this.readyHandler();
	},

	entryReadyHandler: function(){
		console.log('This entry is ready');
	},

	mediaLoadedHandler: function(){
		console.log('This media is loaded');
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
						console.warn('Ignoring intial errors about no source',name, arguments);
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
						'playerUpdatePlayhead','playerPlayEnd','mediaLoadError', 'readyToLoad', 'entryFailed', 'entryNotAvailable'],
					i = events.length - 1, o;

				for(i; i>=0; i--){
					player.addJsListener(events[i],makeHandler(events[i]));
				}

				console.log('Player is ', player.tagName);
			}


			function handleMessage(event){
				var eventData = JSON.parse(event.data),
					player = document.getElementById(playerId);

				//console.debug('From '+playerId+', to app:', eventData);
				player.sendNotification(eventData.name,eventData.data);
			}


			window.addEventListener('message', handleMessage, false);

			// Force HTML5 player over Flash player
			mw.setConfig( 'KalturaSupport.LeadWithHTML5', true );
			// Allow AirPlay
			mw.setConfig('EmbedPlayer.WebKitAllowAirplay', true);
			// Do not rewrite video tags willy-nilly
			mw.setConfig( 'EmbedPlayer.RewriteSelector', false );

			//Force flash in ie10, mostly because kalturas html5 player sucks
			mw.setConfig( 'Kaltura.ForceFlashOnIE10', true );

			//mw.setConfig('debug', true);

			kWidget.embed({
				targetId: playerId,
				wid: '_%PARTNER_ID%',
				uiconf_id: '%UICONF_ID%',
				flashvars: {
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
