Ext.define('NextThought.view.account.settings.PictureCanvas',{
	extend:'Ext.Component',
	alias: 'widget.picture-canvas',

	autoEl: {tag: 'canvas', width: 4, height: 3},

	initComponent: function(){
		this.callParent(arguments);
		this.dragOver = this.dragEnter;
		this.on('boxready',this.syncSizeAttributes,this);
	},

	syncSizeAttributes: function(){
		var borders = this.el.getStyle(['border-top-width','border-right-width','border-bottom-width','border-left-width']),
			size = this.getSize();
		size.width -= (parseInt(borders['border-left-width'],10) + parseInt(borders['border-right-width'],10));
		size.height-= (parseInt(borders['border-top-width'],10) + parseInt(borders['border-bottom-width'],10));
		if(size.height < 100){
			console.log('Canvas did not naturally size, calculating required height, given '+size.height+', will change to 75% of '+size.width);
			size.height = Math.round(size.width * 0.75);
		}

		this.mySize = size;
		this.el.set(size);
		this.el.setStyle({width: null, height: null});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el, {
			scope: this,
			mousedown: this.onMouseDown,
			mousemove: this.onMouseMove,
			mouseup: this.onMouseUp,
			mouseout: this.onMouseUp
		});

		this.createFileInput();
		this.enableImageDropping();
	},


	onMouseDown: function(e){
		if(!this.imageInfo){return;}

        e.stopEvent();
		var xy = e.getXY(),
			start = xy.slice(),
			origin = this.el.getXY(),
			mask = this.getMask(),
			cornerSize = 16,
			size = this.imageInfo.selection.size,
			x = xy[0],
			y = xy[1],
			nearLeft,
			nearRight,
			nearTop,
			nearBottom;

		x -= origin[0];
		y -= origin[1];

		x -= mask[0];
		y -= mask[1];


		if( x >= 0 && x <= size
		&&  y >= 0 && y <= size ){
			this.mouseDown = true;
			this.lastPoint = start;

			nearLeft = x <= cornerSize;
			nearRight = x > (size-cornerSize);
			nearTop = y <= cornerSize;
			nearBottom = y > (size-cornerSize);

			delete this.inCorner;

			//Two bit field.  X Y.  The top left corner moves both X and Y, so it has the field of 11 (or 3),
			// Top right only moves Y so its bit field is 01 (or 1), the bottom left corner only moves X, so 10 (or 2),
			// and finally the last corner does not move X or Y, so its bit field is 00.
			if(nearLeft && nearTop){ this.inCorner = 3; }
			else if(nearRight && nearTop){ this.inCorner = 1; }
			else if(nearLeft && nearBottom){ this.inCorner = 2; }
			else if(nearRight && nearBottom){ this.inCorner = 0; }
		}

	},


	onMouseMove: function(e){
		if(!this.mouseDown){ return; }

		function clamp(v,min,max){
			return v<min
					? min
					: v > max
						? max
						: v;
		}

		function doMove(){
			//clamp values
			s.x = clamp((s.x - dx), 0, (i.width - s.size));
			s.y = clamp((s.y - dy), 0, (i.height - s.size));
		}

		function doSize(corner, anchor){
			var mX = Boolean(corner & 2),
				mY = Boolean(corner & 1),
				origin = el.getXY().slice(),
				lastSize = s.size,
				newSize,
				diff;

			origin[0] = xy[0] - origin[0] - i.x;
			origin[1] = xy[1] - origin[1] - i.y;

			dx = anchor[0] - origin[0];
			dy = anchor[1] - origin[1];
			newSize = Math.max(dx,dy);

			if(!mX && !mY){ newSize *= -1; }

			if(newSize < 0){
				return;
			}

			diff = lastSize - newSize;


			s.size = Math.round(clamp(newSize, 32, (Math.min(i.width, i.height))));

			if(mX){ s.x = clamp((s.x + diff), 0, anchor[0] - s.size); }
			if(mY){ s.y = clamp((s.y + diff), 0, anchor[1] - s.size); }
		}



		var xy = e.getXY().slice(),
			dx,dy,
			el = this.el,
			i = this.imageInfo,
			s = i.selection;

		dx = this.lastPoint[0] - xy[0];
		dy = this.lastPoint[1] - xy[1];

		if(!this.hasOwnProperty('inCorner')){
			doMove();
		}
		else {
			doSize(this.inCorner, this.getOppositeCorner(this.inCorner));
		}

		this.lastPoint = xy;
		this.drawCropTool();
	},


	onMouseUp: function(e){
        e.stopEvent();
		delete this.mouseDown;
		delete this.mouseLeftNoMouseUp;
	},


	createFileInput : function() {
		var me = this,
			old = me.fileInputEl,
			file = me.fileInputEl = Ext.DomHelper.insertAfter(me.el,{
			name: 'file1',
			cls: 'file-input',
			tag: 'input',
			type: 'file',
			accept: 'image/*',
			size: 1
		},true);

		if(old){
			old.remove();
		}

		file.on({
			scope: me,
			'change': me.onFileChange,
			'drop': me.dropImage,
			'dragenter': me.dragEnter,
			'dragover': me.dragOver
		});
	},


	onFileChange: function(e){
		if(!e.target.files || !window.FileReader){
			this.doLegacyUpload();
			return;
		}

		this.readFile(this.extractFileInput().files);
	},


	doLegacyUpload: function(){
		var me = this,
			form = new Ext.form.Basic(this,{}),
			fieldCacheKey = '_fields',
			fields,
			url = getURL($AppConfig.server.data+'@@image_to_dataurl_extjs');

		fields = form[fieldCacheKey] = new Ext.util.MixedCollection();
		fields.add(this);

		Ext.getBody().mask('Uploading...','navigation');

		function fin(f,action){
			Ext.getBody().unmask();
			var url = ((action||{}).result||{}).dataurl || false;//prevent an error, and force false if its not there.
			if(url){
				me.setImage(url);
			}
			else {
				me.clear();
			}
			form.destroy();
		}

		Ext.defer(function(){
			//sigh...lets try not to lock up the browser with a synchronous submit >.<
			form.submit({ url: url, success: fin, failure: fin });
		},1);
	},


	extractFileInput: function() {
		var fileInput = this.fileInputEl.dom;
		this.fileInputEl.clearListeners();
		this.fileInputEl.remove();
		return fileInput;
	},


	clear: function(){
		if(!this.el){return;}

		var c = this.el.dom,
			w = c.width;

		c.width = +w;

		delete this.imageInfo;

		this.createFileInput();
		this.removeCls('withImage');
		this.fireEvent('image-cleared');
	},


	rotate: function(){
		if(!this.imageInfo){
			return;
		}


		var img = this.imageInfo.image,
			c = document.createElement('canvas'),
			ctx = c.getContext('2d'),
			h = img.height,
			w = img.width;

		c.width = h;
		c.height= w;

		ctx.rotate(Math.PI/2);
		ctx.drawImage(img,0,-h);
		this.setImage(c.toDataURL('image/png'));
	},


	setImage: function(url){
		var me = this,
			img = new Image();

		img.onerror = function(){ me.clear(); };

		img.onload = function ImageLoaded(){
			if(me.fileInputEl){
				me.fileInputEl.remove();
			}
			me.addCls('withImage');
			var size = me.mySize,
				h = img.height,
				w = img.width,
				scale = Math.max(h/size.height, w/size.width),
				x, y;

			if(scale > 1){
				w = Math.round(w/scale);
				h = Math.round(h/scale);
			}

			x = Math.round((size.width - w)/2);
			y = Math.round((size.height - h)/2);

			me.imageInfo = {
				image: img,
				x: x,
				y: y,
				width: w,
				height: h,
				selection: {
					x: 0, y: 0,
					size: Math.min(w,h)
				}
			};

			me.fireEvent('image-loaded',me.imageInfo);
			me.drawCropTool();
		};

		img.src = url;
	},


	getOppositeCorner: function(corner){
		var i = this.imageInfo,
			s = i.selection,
			corners = [
				[s.x, s.y], //opposite bottom-right
				[s.x, s.y + s.size], //opposite top-right
				[s.x + s.size, s.y], //opposite bottom-left
				[s.x + s.size, s.y + s.size]]; //opposite top-left

		return corners[corner];
	},


	getMask: function getMask(size,pixAdj){
		size = size || 0;
		pixAdj = pixAdj || 0;
		var i = this.imageInfo || {selection:{}};
		return [
			Math.ceil(i.x + i.selection.x - size) + pixAdj,
			Math.ceil(i.y + i.selection.y - size) + pixAdj,
			Math.ceil(i.selection.size + (size*2)),
			Math.ceil(i.selection.size + (size*2))
		];
	},


	drawCropTool: function(){
		var ctx = this.el.dom.getContext('2d'),
			i = this.imageInfo;

		//erase
		this.el.dom.width = this.mySize.width;

		function drawCorners(x,y,width,height){
			ctx.save();
			ctx.fillStyle = '#000';
			ctx.strokeStyle = '#fff';
			ctx.lineCap = 'round';
			ctx.lineWidth = 1;
			var cw = Math.ceil(width/2),
				ch = Math.ceil(height/2);

			function nib(){
				ctx.beginPath();
				ctx.moveTo(-cw,-ch);
				ctx.lineTo(16-cw,-ch);
				ctx.lineTo(16-cw,6-ch);

				ctx.lineTo(6-cw,6-ch);

				ctx.lineTo(6-cw,16-ch);
				ctx.lineTo(-cw,16-ch);

				ctx.closePath();

				ctx.fill();
				ctx.stroke();
			}

			ctx.setTransform(1,0,0,1,x+cw,y+ch);
			nib();
			ctx.rotate(Math.PI/2);
			nib();
			ctx.rotate(Math.PI/2);
			nib();
			ctx.rotate(Math.PI/2);
			nib();

			ctx.restore();
		}

		ctx.setTransform(1,0,0,1,0,0);
		ctx.lineWidth = 1;

		//mask
		ctx.save();
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(i.x, i.y, i.width, i.height);
		ctx.restore();

		//cut out masked area
		ctx.save();
		ctx.fillStyle = '#000';
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillRect.apply(ctx,this.getMask());
		ctx.restore();

		//draw image under mask
		ctx.save();
		ctx.globalCompositeOperation = 'destination-over';
		ctx.drawImage(i.image, i.x, i.y, i.width, i.height);
		ctx.restore();

		//draw border
		ctx.strokeStyle = '#000';
		ctx.strokeRect.apply(ctx,this.getMask(0,0.5));
		ctx.strokeStyle = '#fff';
		ctx.strokeRect.apply(ctx,this.getMask(-1,0.5));

		drawCorners.apply(this,this.getMask(2,0.5));
	},


	getValue: function(){

		var i = this.imageInfo,
			s = i.selection,
			c = document.createElement('canvas'),
			ctx;
		c.width = c.height = s.size;
		ctx = c.getContext('2d');
		ctx.drawImage(i.image, -s.x, -s.y, i.width, i.height);
		return c.toDataURL("image/png");
	},


	selectImage: function(inputField){
		var hasFileApi = Boolean(inputField.fileInputEl.dom.files),
			files = hasFileApi ? inputField.extractFileInput().files : [];
		this.readFile(files);
	},


	enableImageDropping: function(){
		var me = this,
			el = me.el;

		me.mon(el,{
			'scope': me,
			'drop': me.dropImage,
			'dragenter': me.dragEnter,
			'dragover': me.dragOver
		});
	},


	dragEnter: function(e){
		var b = e.browserEvent,
			dt = b.dataTransfer;
		dt.dropEffect = 'copy';
		e.stopEvent();
		return false; //for IE
	},


	dropImage: function(e){
		var dt = e.browserEvent.dataTransfer;
		if(dt){
			this.readFile(dt.files);
		}

		e.stopEvent();
		return false; //for IE

	},


	handlePaste:function(event, domEl){
		var clipboardData = event.clipboardData || {},
			me = this;

		Ext.each(clipboardData.types || [], function(type, i) {
			var file, reader;
			if (type.match(/image\/.*/i)) {
				file = clipboardData.items[i].getAsFile();
				reader = new FileReader();
				reader.onload = function(evt) {
					me.setImage(evt.target.result);
				};
				reader.readAsDataURL(file);
				return false;
			}
			return true;
		});

	},


	readFile: function(files){
		var me = this,
			file = files[0],
			reader;

		//file.size
		if(!file || !(/image\/.*/i).test(file.type)){
			console.log('selected file was invalid, or the browser does not support FileAPI');
			return;
		}

		if(window.FileReader){
			reader = new FileReader();
			reader.onload = function(event) {
				//http://code.google.com/p/jsjpegmeta/source/browse/jpegmeta.js
				me.setImage(event.target.result);
			};
			reader.readAsDataURL(file);
		}
	},



	//for Legacy
	isDirty: function(){ return true; },
	isFormField: true,
	isFileUpload: function() { return true; },
	getSubmitData: function(){ return null; },
	validate: function(){ return Boolean(this.fileInputEl.dom.value); }
});
