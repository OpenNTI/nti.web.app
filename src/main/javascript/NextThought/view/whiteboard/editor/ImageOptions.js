Ext.define('NextThought.view.whiteboard.editor.ImageOptions',{
	alias: 'widget.wb-tool-image-options',
	extend: 'Ext.toolbar.Toolbar',
	ui: 'options',

	enableImageDropping: function(){
		var el = this.canvas.el, t;

		function over(e) {
			el.addCls('drop-over');
			e.stopPropagation();
			e.preventDefault();
			if(t){ clearTimeout(t); }
			t = setTimeout(function(){el.removeCls('drop-over');}, 100);
			return false; //for IE
		}

		el.on({
			'scope': this,
			'mousedown': this.onMouseDown,
			'mousemove': this.onMouseMove,
			'mouseup': this.onMouseUp,
			'click': this.onClick,
			'dblclick': this.onDoubleClick,
			'contextmenu': this.onContextMenu,

			'drop': this.dropImage,
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


	selectImage: function(inputField){
		var hasFileApi = Boolean(inputField.fileInputEl.dom.files),
			files = hasFileApi ? inputField.extractFileInput().files : [];
		this.readFile(files);
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
			reader.onload = function(event) { me.insertImage(event.target.result); };
			reader.readAsDataURL(file);
		}
	},


	insertImage: function(dataUrl){
		var image = new Image(),
			me = this,
			c = this.canvas;

		image.onload = function(){
			var m = new NTMatrix(),
				canvasWidth = c.getWidth(),
				s = me.addShape('Url'),
				max = Math.max(image.width,image.height),
				scale = (max > canvasWidth) ? (canvasWidth*0.75)/max : 1;

			s.url = dataUrl;
			m.translate(canvasWidth/2, (scale*image.height/2)+(canvasWidth/10) );
			m.scale(scale);

			m.scaleAll(1/canvasWidth);//do this after

			s.transform = m.toTransform();

			c.drawScene();
		};
		image.src = dataUrl;
	}


});
