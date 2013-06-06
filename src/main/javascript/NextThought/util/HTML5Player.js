Ext.define('NextThought.util.HTML5Player',{

	constructor: function(args){
		this.el = Ext.get(args.el);
		this.dom = this.el.dom;
	},

//	SAJ: The HTML5 player code is part of the browser and is always ready to load a media source.
	isReady: true,

	getCurrentTime: function(){
		return this.dom.currentTime;
	},

	getPlayerState: function(){
		var playerState = -1;

		if (this.dom.paused){
			playerState = 2;
		}
		else if (this.dom.ended){
			playerState = 0;
		}
		else if (this.dom.readyState === 2 || this.dom.readyState === 3){
			playerState = 3;
		}
		else{
			playerState = 1;
		}

		return playerState;
	},

	load: function(source, offset){
		var sourceTpl = Ext.DomHelper.createTemplate({tag: 'source', src: '{src}', type: '{type}'}),
			dom = this.dom;
		// Remove any sources that may be there
		if( dom.innerHTML ){
			dom.innerHTML = '';
			dom.load();
		}

		sourceTpl.append(dom, {src: location.protocol+source[0], type: 'video/mp4'});
		sourceTpl.append(dom, {src: location.protocol+source[1], type: 'video/webm'});

		dom.load();

		if (offset > 0.0){
			this.el.on('loadedmetadata',function(){dom.currentTime = offset;}, this, {single: true});
		}
	},

	'play': function(){
		this.dom.play();
	},

	pause: function(){
		this.dom.pause();
	},

	seek: function(offset){
		var dom = this.dom;
		if (dom.readyState === 0){
			this.el.on('loadedmetadata',function(){dom.currentTime = offset;}, this, {single: true});
		}
		else{
			this.dom.currentTime = offset;
		}
	},

	stop: function(){
		// Remove the current sources and trigger a load to free the used memory
		this.dom.innerHTML = '';
		this.dom.load();
	},

	cleanup: function(){
		this.stop();
		this.el.clearListeners();
	}
});
