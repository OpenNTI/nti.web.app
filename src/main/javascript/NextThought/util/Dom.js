Ext.define('NextThought.util.Dom',{
	singleton: true,

	getVideosFromDom: function getVideosFromDom(contentElement) {
		var videoObjects = [];
		Ext.each(contentElement.querySelectorAll('object .naqvideo'),function(v){
			var videoObj = {};
			Ext.each(v.querySelectorAll('param'), function(p){
				videoObj[p.name] = p.value;
			});
			videoObjects.push(videoObj);
		});
		return videoObjects;
	}

},function(){
	window.DomUtils = this;
});
