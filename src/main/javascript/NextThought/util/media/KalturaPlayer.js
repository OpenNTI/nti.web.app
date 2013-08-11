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
		cn: [{//Globals.loadScript(location.protocol+"//html5.kaltura.org/js");
			tag:'iframe',
			id: '{id}-iframe',
			name: '{id}-iframe',
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
				{tag:'script', type:'text/javascript', src:(location.protocol+'//cdnapi.kaltura.com/html5/html5lib/v1.8.9/mwEmbedLoader.php')},
				{tag:'script', type:'text/javascript', html:'\n{code}\n'},
				{tag:'style', type:'text/css', cn:[
					'body, html { margin: 0; padding: 0; }'
				]}
			]},
			{tag:'body', cn:{
				id: '{id}', name: '{id}', style: {
					width:'{width}px',
					height:'{height}px'
				}
			}}]
		}
	]),


	// We need to externalize these values since they relate to our Kaltura Account.  This is okay for OU since they are paying for it.
	PARTNER_ID: '1500101',
	UICONF_ID: '15491291',


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
		var doc,
			data = {
				id: this.id,
				height: this.height,
				width: this.width,
				basePath: location.protocol+'//'+location.host+location.pathname,
				code: this.buildWrapperCode()
			};


//		Inject Kaltura Player HTML
		this.el = this.PLAYER_TPL.append(
				this.parentEl, data, true);
		this.iframe = this.el.down('iframe');

		window.addEventListener("message", this.handleMessage, false);
		try{
			this.getPlayerContext().onerror = Ext.bind(this.playerErrorHandler,this);
			doc = this.getPlayerContextDocument();
			doc.open();
			doc.write(this.PLAYER_BODY_TPL.apply(data));
			doc.close();
		}
		catch(e){
			this.playerErrorHandler(e);
		}
		console.log(this.id);
	},


	handleMessage: function(event){
		//console.debug('Message:',event);

		var filter = /^kalturaplayer\./i,
			eventData = event.data || {},
			eventName = eventData.event||'',
			handlerName;

		if(!filter.test(eventName) && this.id === eventData.id ){
			return;
		}

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

		context.postMessage({
			type: type,
			name: name,
			data: data
		},'*');
	},


	sendCommand: function(name,data){
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
		var doc = this.playerDocument || (Ext.getDom(this.iframe).contentDocument || this.getPlayerContext().document);
		if( doc && !doc.body ){
			doc.body = doc.getElementsByTagName('body')[0];
		}
		this.playerDocument = doc;
		return doc;
	},


	getCurrentTime: function(){ return this.currentPosition; },


	getPlayerState: function(){ return this.currentState; },


	load: function(source, offset){
		var kalturaData;

		source = Ext.isArray(source) ? source[0] : source;

		this.sendCommand('cleanMedia');

		this.currentSource = source;
		this.currentStartAt = offset;

		kalturaData = source.split(':');
		//console.log(kalturaData, source, offset);
		this.sendCommand('changeMedia', {entryId: kalturaData[1]});
		this.currentPosition = 0;
		this.currentState = -1;

		if (offset) {
			this.seek(offset);
		}

	},


	play: function(){ this.sendCommand('doPlay'); },


	pause: function(){ this.sendCommand('doPause'); },


	stop: function(){ this.sendCommand('doStop'); },


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



	readyHandler: function(){
		this.isReady = true;
		this.fireEvent('player-ready', 'kaltura');
	},


	playerUpdatePlayheadHandler: function(data){
		this.currentPosition = data;
	},


	doPlayHandler: function(){
		console.warn(this.currentState);
		this.currentState = 1;
		this.fireEvent('player-event-play', 'kaltura');
	},


	doPauseHandler: function(){
		console.warn(this.currentState);
		this.currentState = 2;
		this.fireEvent('player-event-pause', 'kaltura');
	},


	playerPlayEndHandler: function(){
		this.stop();
		this.currentState = -1;
		this.fireEvent('player-event-ended', 'kaltura');
	},


	playerErrorHandler: function(){
		console.error('kaltura error ', arguments);
		this.fireEvent('player-error', 'kaltura');
	},


	playerCode:{

		inject: function inject(){

			function send(event,data){
				//console.log('Event: '+event, playerId, data);
				host.postMessage({
					event: 'kalturaplayer.'+event,
					id: playerId,
					data: data
				},'*');
			}

			function ensureReady(){
				if(!ensureReady.called){
					ensureReady.called = true;
					setTimeout(function(){send('ready');},1);
				}
			}

			function makeHandler(name){
				ensureReady();

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
					events = ['playerUpdatePlayhead','doPlay','doPause','playerPlayEnd','mediaLoadError','mediaError'],
					i = events.length - 1;

				for(i; i; i--){
					player.addJsListener(events[i],makeHandler(events[i]));
				}

				setTimeout(ensureReady,5000);
			}


			function handleMessage(event){
				var eventData = event.data,
					player = document.getElementById(playerId);

				//console.debug('From '+playerId+', to app:', eventData);
				player.sendNotification(eventData.name,eventData.data);
			}


			window.addEventListener('message', handleMessage, false);

			// Force HTML5 player over Flash player
//			mw.setConfig( 'KalturaSupport.LeadWithHTML5', true );
			// Allow AirPlay
			mw.setConfig('EmbedPlayer.WebKitAllowAirplay', true);
			// Do not rewrite video tags willy-nilly
			mw.setConfig( 'EmbedPlayer.RewriteSelector', false );

			//mw.setConfig('debug', true);

			window.playerId = '%id%';
			window.host = window.top;

			kWidget.embed({
				targetId: playerId,
				wid: '_%PARTNER_ID%',
				uiconf_id: '%UICONF_ID%',
				flashvars: {
					"externalInterfaceDisabled": false,
					"autoPlay": false
				},
				"entry_id": "0_nmgd4bvw",
				params:{
					wmode: 'transparent'
				},
				readyCallback: playerReady
			});
		}


	}
});
