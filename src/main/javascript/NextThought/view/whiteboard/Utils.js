Ext.define('NextThought.view.whiteboard.Utils',{
	alternateClassName:'WBUtils',
	singleton: true,

	requires: [
		'NextThought.view.whiteboard.Matrix'
	],


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
			dy	= y1-y0,
			a	= dx<0? 180: dy<0? 360: 0,
			rad = Math.atan(dy/dx);

		return ((180/Math.PI)*rad) + a;
	},


	toRadians: function(degrees){
		return (degrees % 360) * (Math.PI/180);
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



	imgToDataUrl: function(img){
		img = Ext.getDom(img);
		var c = document.createElement('canvas');

		c.width = img.naturalWidth || img.width;
		c.height = img.naturalHeight || img.height;
		//hopefully this won't degrade the image quality. (PNG after all)
		c.getContext('2d').drawImage(img,0,0);
		return c.toDataURL('imge/png');
	},



	createFromImage: function(img, cb){

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
				proxyUrl = getURL($AppConfig.server.data+'@@echo_image_url?image_url='+encodeURIComponent(img.src));
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

		var me = this, image = new Image();
		image.onerror = error;
		image.onload = function(){
			Ext.callback(cb,null,[me.buildCanvasFromDataUrl(image)],1);
		};
		requestDataURL();
	},



	buildCanvasFromDataUrl: function(img){
		if(!/^data:/i.test(img.src)){
			console.error('Image is not a data url '+img.src);
			return null;
		}

		var w = img.width,
			h = img.height,
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
