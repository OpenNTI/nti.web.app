Ext.define('NextThought.view.account.settings.PictureCanvas',{
	extend:'Ext.Component',
	alias: 'widget.picture-canvas',

	autoEl: {tag: 'canvas', width: 4, height: 3},

	initComponent: function(){
		this.callParent(arguments);
		this.on('boxready',this.syncSizeAttributes,this);
	},

	syncSizeAttributes: function(){
		var borders = this.el.getStyle(['border-top-width','border-right-width','border-bottom-width','border-left-width']),
			size = this.getSize();
		size.width -= (parseInt(borders['border-left-width'],10) + parseInt(borders['border-right-width'],10));
		size.height-= (parseInt(borders['border-top-width'],10) + parseInt(borders['border-bottom-width'],10));

		this.mySize = size;
		this.el.set(size);
		this.el.setStyle({width: null, height: null});
	},


	afterRender: function(){
		this.callParent(arguments);
		if(window.FileReader === undefined){
			alert({title:'Sorry, you can\'t use this feature.', msg: 'Please update to the lastest version of your browser', width: 500});
			return;
		}

		this.enableImageDropping();
	},


	setImage: function(dataUrl){
		var me = this,
			img = new Image();

		img.onload = function ImageLoaded(){
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

			me.drawCropTool();
		};

		img.src = dataUrl;
	},


	drawCropTool: function(){
		var ctx = this.el.dom.getContext('2d'),
			i = this.imageInfo;

		function getMask(size,pixAdj){
			size = size || 0;
			pixAdj = pixAdj || 0;
			return [
				Math.floor(i.x + i.selection.x - size) + pixAdj,
				Math.floor(i.y + i.selection.y - size) + pixAdj,
				Math.floor(i.selection.size + (size*2)),
				Math.floor(i.selection.size + (size*2))
			];
		}

		function drawCorners(x,y,width,height){
			ctx.save();
			ctx.fillStyle = '#000';
			ctx.strokeStyle = '#fff';
			ctx.lineCap = 'round';
			ctx.lineWidth = 1;
			var cw = Math.floor(width/2),
				ch = Math.floor(height/2);


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
		ctx.fillRect.apply(ctx,getMask());
		ctx.restore();

		//draw image under mask
		ctx.save();
		ctx.globalCompositeOperation = 'destination-over';
		ctx.drawImage(i.image, i.x, i.y, i.width, i.height);
		ctx.restore();

		//draw border
		ctx.strokeStyle = '#000';
		ctx.strokeRect.apply(ctx,getMask(0,0.5));
		ctx.strokeStyle = '#fff';
		ctx.strokeRect.apply(ctx,getMask(-1,0.5));

		drawCorners.apply(this,getMask(2,0.5));
	},


	selectImage: function(inputField){
		var hasFileApi = Boolean(inputField.fileInputEl.dom.files),
			files = hasFileApi ? inputField.extractFileInput().files : [];
		this.readFile(files);
	},


	enableImageDropping: function(){
		var me = this,
			el = me.el,
			t;

		function over(e) {
			el.addCls('drop-over');
			e.stopPropagation();
			e.preventDefault();
			if(t){ clearTimeout(t); }
			t = setTimeout(function(){el.removeCls('drop-over');}, 100);
			return false; //for IE
		}

		me.mon(el,{
			'scope': me,
			'drop': me.dropImage,
			'dragenter': over,
			'dragover': over
		});
	},


	dropImage: function(e){
		e.stopPropagation();
		e.preventDefault();

		var dt = e.browserEvent.dataTransfer;

		if(!dt){
			alert('Please use the toolbar, your browser does not support drag & drop file uploads.');
		}
		else {
			this.readFile(dt.files);
		}
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
				me.setImage(event.target.result);
			};
			reader.readAsDataURL(file);
		}
	}
});
