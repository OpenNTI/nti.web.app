Ext.define('NextThought.view.whiteboard.Utils',{
	alternateClassName:'WBUtils',
	singleton: true,

	requires: [
		'NextThought.view.whiteboard.Matrix'
	],


	USE_DATA_URLS: false,


	getSlope: function(x0,y0, x1,y1){
		if(Ext.isArray(x0)){
			y1 = x0[3];
			x1 = x0[2];
			y0 = x0[1];
			x0 = x0[0];
		}
		return (y1-y0) / (x1-x0);
	},


	getDegrees: function(x0,y0, x1,y1){
		if(Ext.isArray(x0)){
			y1 = x0[3];
			x1 = x0[2];
			y0 = x0[1];
			x0 = x0[0];
		}
		var dx	= x1-x0,
			dy	= y1-y0;

		return Math.atan2(dy, dx) * 180 / Math.PI;
	},


	toRadians: function(degrees){
		return (degrees % 360) * (Math.PI/180);
	},


	toDegree: function(radians){
		return Math.round((radians * 180)/Math.PI);
	},


	getDistance: function(x1, y1, x2, y2) {
		if(Ext.isArray(x1)){
			y2 = x1[3];
			x2 = x1[2];
			y1 = x1[1];
			x1 = x1[0];
		}
		var dx = x2 - x1,
			dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	},



	canUse: function(image){
		var c, img;
		try {
			img = Ext.getDom(image);
			c = document.createElement('canvas');
			c.getContext('2d').drawImage(img,0,0);
			c.toDataURL('image/png');
			c.width = 0;//should free the buffer we just rendered
		}
		catch(e){
			return false;
		}
		return true;
	},


	maybeProxyImage: function(url, image){
		var tempImage = new Image(),
			me = this;
		tempImage.onload = finishTest;
		tempImage.onerror = errorPassthrough;
		tempImage.src = url;

		function errorPassthrough(){
			console.error('Could not load: '+url);
			passthrough();
		}

		function passthrough(){ image.src = url; }

		function finishTest(){
			if(!me.canUse(tempImage)){
				image.src = me.proxyImage(url);
				return;
			}
			passthrough();
		}
	},


	proxyImage: function(imageUrl){
		if(/^data:/i.test(imageUrl)){
			console.error('A data url was attempted to be proxied.');
			throw 'A data url was attempted to be proxied.';
		}
		return getURL($AppConfig.server.data+'@@echo_image_url?image_url='+encodeURIComponent(imageUrl));
	},



	imgToDataUrl: function(img){
		var c, url;
		img = Ext.getDom(img);
		c = document.createElement('canvas');
		c.width = img.naturalWidth || img.width;
		c.height = img.naturalHeight || img.height;
		c.getContext('2d').drawImage(img,0,0);
		url = c.toDataURL('image/png');
		c.width = 0;//should free the buffer we just rendered
		return url;
	},



	createFromImage: function(img, cb, forceDataUrl){
		var me = this,
			image,
			useClonedImage = forceDataUrl || me.USE_DATA_URLS;

		function error(){
			alert('Hmm, there seems to be a problem with that image');
		}

		function requestDataURL(){
			var proxyUrl, proxy, dataUrl;
			try {
				dataUrl = me.imgToDataUrl(img);
				image.src = dataUrl;
			}
			catch(er){
				Ext.getBody().mask('Loading...');
				proxyUrl = me.proxyImage(img.src);
				proxy = new Image();
				proxy.onerror = function(){
					Ext.getBody().unmask();
					error('bad_proxy');
				};
				proxy.onload = function(){
					Ext.getBody().unmask();
					dataUrl = me.imgToDataUrl(proxy);
					image.src = dataUrl;
				};
				proxy.src = proxyUrl;
			}
		}


		if(useClonedImage === true) {
			image = new Image();
			image.onerror = error;
			image.onload = function(){ Ext.callback(cb,null,[me.buildCanvasFromImage(image)],1); };
			requestDataURL();
		}
		else {
			Ext.callback(cb,null,[this.buildCanvasFromImage(img)],1);
		}

	},



	buildCanvasFromImage: function(img){
		var w = img.naturalWidth || img.width,
			h = img.naturalHeight || img.height,
			scale = 1/w,
			wbCX,wbCY,
			m = new NTMatrix(),
			data = {
				shapeList	: [],
				MimeType	: "application/vnd.nextthought.canvas",
				Class		: 'Canvas',
				viewportRatio : (16/9)
			};

		wbCX = (scale*w)/2;
		wbCY = (1/data.viewportRatio)/2;

		if(h>w || (h*scale)>(1/data.viewportRatio)){
			scale = (1/data.viewportRatio)/h;
			wbCY = (scale*h)/2;
			wbCX = 0.5;
		}

		m.translate(wbCX, wbCY);
		m.scale(scale);

		data.shapeList.push({
			Class: 'CanvasUrlShape',
			url: img.src,
			transform: m.toTransform()
		});

		return data;
	}


},function(){
	this.WBUtils = this;
});
