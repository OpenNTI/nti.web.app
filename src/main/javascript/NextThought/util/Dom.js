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
	},


	getImagesFromDom: function(contentElement){
		var imageObjects = [];
		Ext.each(contentElement.querySelectorAll('span > img'),function(i){
			var imageObj = {},
				base,
				src = i.getAttribute('src'),
				current = i.getAttribute('data-nti-image-size'),
				full = i.getAttribute('data-nti-image-full'),
				half = i.getAttribute('data-nti-image-half'),
				quarter = i.getAttribute('data-nti-image-quarter');

			current = src.indexOf(i.getAttribute('data-nti-image-'+current));
			base = src.substr(0,current);

			Ext.removeNode(i.parentNode);

			imageObj.url = base + full;
			imageObjects.push(imageObj);
		});
		return imageObjects;
	}

},function(){
	window.DomUtils = this;
});
