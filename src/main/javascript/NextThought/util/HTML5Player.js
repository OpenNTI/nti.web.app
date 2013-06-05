Ext.define('NextThought.util.HTML5Player',{

	constructor: function(){
		this.el = arguments[0].el.dom;
	},

	getCurrentTime: function(){
		return this.el.currentTime;
	},

	getPlayerState: function(){
		var playerState = -1;

		if (this.el.paused){
			playerState = 2;
		}
		else if (this.el.ended){
			playerState = 0;
		}
		else if (this.el.readyState === 2 || this.el.readyState === 3){
			playerState = 3;
		}
		else{
			playerState = 1;
		}

		return playerState;
	},

	load: function(source, offset){
		var sourceTpl = Ext.DomHelper.createTemplate({tag: 'source', src: '{src}', type: '{type}'});
		// Remove any sources that may be there
		this.el.innerHTML = '';

		sourceTpl.append(this.el, {src: location.protocol+source[0], type: 'video/mp4'});
		sourceTpl.append(this.el, {src: location.protocol+source[1], type: 'video/webm'});

		this.el.load();

		if (offset > 0.0){
			this.el.addEventListener('loadedmetadata',function(){this.currentTime = offset;});
		}
	},

	'play': function(){
		this.el.play();
	},

	pause: function(){
		this.el.pause();
	},

	seek: function(offset){
		this.el.currentTime = offset;
	},

	stop: function(){
		// Remove the current sources and trigger a load to free the used memory
		this.el.innerHTML = '';
		this.el.load();
	}
});
