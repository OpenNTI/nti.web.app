/*jslint */
/*globals Globals, mw, NextThought, kWidget */
Ext.define('NextThought.util.media.KalturaPlayer',{

	statics:{
		kind:'video',
		type: 'kaltura',
		valid: function(){
			return Boolean(window.kWidget);
		}
	},

	requires: [
		'NextThought.util.Globals'
	],

	mixins: {
		observable: 'Ext.util.Observable'
	},

	playerTpl: Ext.DomHelper.createTemplate({
		name: '{id}', id: '{id}', 'style': 'width:{width}px;height:{height}px;'
	}),

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

		this.playerSetup();
	},

	playerSetup: function(){
		var kWidget = window.kWidget,
			me = this,
			mw = window.mw;
		this.globals.currentTime = this.getGlobalHandler('kaltura', this.id, 'currentTime', me.playerUpdatePlayheadHandler, me);
		this.globals.doPlay = this.getGlobalHandler('kaltura', this.id, 'doPlay', me.playerDoPlayHandler, me);
		this.globals.doPause = this.getGlobalHandler('kaltura', this.id, 'doPause', me.playerDoPauseHandler, me);
		this.globals.playerPlayEnd = this.getGlobalHandler('kaltura', this.id, 'playerPlayEnd', me.playerPlayEndHandler, me);
		this.globals.mediaLoadError = this.getGlobalHandler('kaltura', this.id, 'mediaLoadError', me.playerErrorHandler, me);
		this.globals.mediaError = this.getGlobalHandler('kaltura', this.id, 'mediaError', me.playerErrorHandler, me);
		this.isReady = false;

//		Inject Kaltura Player HTML
		this.playerTpl.append(this.parentEl, {id: this.id, height: this.height, width: this.width});
		console.log(this.id);
		this.el = Ext.get(this.id);

		// Force HTML5 player over Flash player
		mw.setConfig( 'KalturaSupport.LeadWithHTML5', true );
		// Allow AirPlay
		mw.setConfig('EmbedPlayer.WebKitAllowAirplay', true);
		// Do not rewrite video tags willy-nilly
		mw.setConfig( 'EmbedPlayer.RewriteSelector', false );

		kWidget.embed({
			targetId: me.id,
			wid: "_"+ me.PARTNER_ID,
			uiconf_id: me.UICONF_ID,
			flashvars: {
				"externalInterfaceDisabled": false,
				"autoPlay": true
			},
			params:{
				wmode: 'transparent'
			},
			readyCallback: Ext.Function.createBuffered(me.playerReady, 500, me)
		});

	},

	getGlobalHandler: function (prefix, playerID, fnName, fn, scope, oneShot){
		var name = '__'+prefix+playerID+fnName;
		window[name] = function(){
			Ext.callback(fn,scope,arguments);
			if(oneShot){
				delete window[name];
			}
		};
		return name;
	},

	playerReady: function(){
		var me = this;
		this.player = Ext.getDom(this.id);
		this.isReady = true;
		this.player.addJsListener('playerUpdatePlayhead', me.globals.currentTime);
		this.player.addJsListener('doPlay', me.globals.doPlay);
		this.player.addJsListener('doPause', me.globals.doPause);
		this.player.addJsListener('playerPlayEnd', me.globals.playerPlayEnd);
		this.player.addJsListener('mediaLoadError', me.globals.mediaLoadError);
		this.player.addJsListener('mediaError', me.globals.mediaError);
		this.fireEvent('player-ready', 'kaltura');
	},

	playerUpdatePlayheadHandler: function(data){
		this.currentPosition = data;
	},

	playerDoPlayHandler: function(){
		console.warn(this.currentState);
		this.currentState = 1;
		this.fireEvent('player-event-play', 'kaltura');
	},

	playerDoPauseHandler: function(){
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
		console.error('kaltura error ' + arguments);
		this.fireEvent('player-error', 'kaltura');
	},

	getCurrentTime: function(){
		return this.currentPosition;
	},

	getPlayerState: function(){
		return this.currentState;
	},

	load: function(source, offset){
		var kalturaData;

		source = Ext.isArray(source) ? source[0] : source;

		this.player.sendNotification('cleanMedia');

		this.currentSource = source;
		this.currentStartAt = offset;

		kalturaData = source.split(':');
		console.log(kalturaData, source, offset);
		this.player.sendNotification('changeMedia', {entryId: kalturaData[1]});
		this.currentPosition = 0;
		this.currentState = -1;

		if (offset) {
			this.seek(offset);
		}

	},

	play: function(){
		this.player.sendNotification('doPlay');
	},

	pause: function(){
		this.player.sendNotification('doPause');
	},

	seek: function(offset){
		this.currentStartAt = offset;
		this.player.sendNotification('doSeek', offset);
	},

	stop: function(){
		this.player.sendNotification('doStop');
	},

	cleanup: function(){
		var el = Ext.get(this.id),
			key;
		this.stop();
		this.isReady = false;
		el.clearListeners();
		this.player.sendNotification('cleanMedia');
		kWidget.destroy(this.id);
		Ext.destroy(el);
		for (key in this.globals){
			if (this.globals.hasOwnProperty(key)){
				delete window[this.globals[key]];
			}
		}
	}

}, function(){
	Globals.loadScript(location.protocol+"//html5.kaltura.org/js");
});
