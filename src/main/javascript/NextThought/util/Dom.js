Ext.define('NextThought.util.Dom',{
	singleton: true,


	parseDomObject: function(objectDomEl){
		var obj = {};

		Ext.each(objectDomEl,function(p){
			obj['attribute-'+p.name] = p.value;
		});

		Ext.each(objectDomEl.querySelectorAll('param'), function(p){
			obj[p.name] = p.value;
		});

		console.debug(obj);
		return obj;
	},


	getVideosFromDom: function getVideosFromDom(contentElement) {
		var me = this,
			videoObjects = [];

		Ext.each(contentElement.querySelectorAll('object .naqvideo'),function(v){
			videoObjects.push(me.parseDomObject(v));
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
	},


	/*
	 * A terribly named function that adjust links displayed to the user.  Note this
	 * is different then any content reference cleanup that happens when content loads.
	 * Right now the purpose it so detect links that are external (absolute and aren't the same
	 * base path) and set there target to _blank.  The base url check allows us to just do fragment
	 * navigatio in the same tab so if people get clever and insert links to things like profile we
	 * do the right thing.
	 */
	adjustLinks: function(dom, baseUrl){
		if(!dom){
			return;
		}
		Ext.Array.each(dom.query('a[href]') || [], function(link){
			var href = Ext.fly(link).getAttribute('href') || '',
				base = baseUrl.split('#')[0],
				changeTarget = href.indexOf(base) !== 0;


			if(changeTarget){
				Ext.fly(link).set({target: '_blank'});
			}
		});
	}


},function(){
	window.DomUtils = this;
});
