var Ext = require('extjs');
var ModeSplit = require('./Split');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.mode.FullVideo', {
	extend: 'NextThought.app.mediaviewer.components.mode.Split',
	alias: 'widget.media-video-viewer',

	cls: 'full-video-player',

	viewerType: 'full-video',

	transcriptRatio: 0,

	statics:{

		getTargetVideoWidth: function(el, transcriptRatio){
			var screenHeight = Ext.Element.getViewportHeight(),
				screenWidth = Ext.Element.getViewportWidth(),
				paddingRatio = 0.20,
				ratio = NextThought.app.video.Video.ASPECT_RATIO,
				defaultWidth = screenWidth - (screenWidth * paddingRatio),
				defaultHeight = Math.round(defaultWidth * ratio),
				y = 80,
				diff = screenHeight - (y + defaultHeight),
				newWidth;


			if (diff >= 0) {
				return defaultWidth;
			}

			// Let the available height help determine the appropriate width.
			newWidth = ((screenHeight -	 y - 50) * (1/ratio));
			return Math.max(newWidth, 512);
		}
	},


	buildResourceView: function(){
		if(!this.transcript && !this.resourceList){
			this.callParent(arguments);
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		if(!this.transcript){
			this.el.addCls('has-gutter-view');
		}

		if(this.viewerContainer){
			wait(1000)
				.then(this.viewerContainer.adjustOnResize.bind(this.viewerContainer));
		}
	},


	adjustOnResize: function(availableHeight, availableWidth){
		if(!availableHeight || !availableWidth){ return; }

		var videoWidth = this.videoPlayerEl.getWidth(),
			mLeft = Math.floor((availableWidth - videoWidth) /2),
			targetEl= this.getTargetEl(),
			diff = this.videoPlayerEl.getTop() - targetEl.getTop();


		if(!this.transcript){
			this.getTargetEl().setStyle('height', availableHeight + 'px');
			this.videoPlayerEl.setStyle('marginLeft', mLeft + 'px');

			this.alignResourceViewNextToVideo(videoWidth + mLeft, diff);
		}
		console.log('Media viewer resizing');
	}
});