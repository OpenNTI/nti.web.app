Ext.define('NextThought.util.media.HTML5Player',{

	statics:{
		kind:'video',
		type: 'html5',
		valid: function(){
			return !!document.createElement('video').canPlayType;
		}
	},

	mixins: {
		observable: 'Ext.util.Observable'
	},

	playerTpl: Ext.DomHelper.createTemplate({
		tag: 'video', cls: 'video', name: 'video', id: '{id}',
		controls: '', 'width': '{width}', 'height': '{height}'
	}),


	constructor: function(config){
		this.mixins.observable.constructor.call(this);
		this.enableBubble(['player-error']);
		this.parent = config.parentComponent;
		this.el = null;
		this.parentEl = Ext.get(config.el);
		this.id = config.parentId+'-native-video';
		this.player = null;
		this.width = config.width;
		this.height = config.height;

		this.playerSetup();
	},

	getBubbleParent: function(){ return this.parent; },


//	SAJ: The HTML5 player code is part of the browser and is always ready to load a media source.
	isReady: true,

	playerSetup: function(){
//		Inject HTML5 Player HTML
		this.playerTpl.append(this.parentEl, {id: this.id, height: this.height, width: this.width});
		console.log(this.id);
		this.el = Ext.get(this.id);
		this.player = Ext.getDom(this.id);
		this.el.on('error','playerError',this);
	},


	playerError: function(){
		this.fireEvent('player-error', 'html5');
	},


	getCurrentTime: function(){
		return this.player.currentTime;
	},

	getPlayerState: function(){
		var playerState = -1;

		if (this.player.paused){
			playerState = 2;
		}
		else if (this.player.ended){
			playerState = 0;
		}
		else if (this.player.readyState === 2 || this.player.readyState === 3){
			playerState = 3;
		}
		else{
			playerState = 1;
		}

		return playerState;
	},

	load: function(source, offset){
		var sourceTpl = Ext.DomHelper.createTemplate({tag: 'source', src: '{src}', type: '{type}'}),
			player = this.player,
			i = 0,
			len = (source && source.length) || 0, src;

		// Remove any sources that may be there
		if( player.innerHTML ){
			player.innerHTML = '';
			player.load();
		}

		for(i=0; i<len; i++){
			src = source[i].source;
			src = /^\/\//i.test(src) ? (location.protocol+src) : src;
			sourceTpl.append(player, {src: src, type: source[i].type}, false);
		}

		player.load();

		if (offset > 0.0){
			this.el.on('loadedmetadata',function(){player.currentTime = offset;}, this, {single: true});
		}
	},

	play: function(){
		this.player.play();
	},

	pause: function(){
		this.player.pause();
	},

	seek: function(offset){
		var player = this.player;
		if (player.readyState === 0){
			this.el.on('loadedmetadata',function(){player.currentTime = offset;}, this, {single: true});
		}
		else{
			player.currentTime = offset;
		}
	},

	stop: function(){
		// Remove the current sources and trigger a load to free the used memory
		this.player.innerHTML = '';
		this.player.load();
	},

	cleanup: function(){
		this.stop();
		this.el.clearListeners();
	}
});
