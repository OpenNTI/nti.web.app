Ext.define('NextThought.view.whiteboard.editor.ImageOptions',{
	alias: 'widget.wb-tool-image-options',
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.menus.file.BrowserItem'
	],
	ui: 'options',
	cls: 'image-options',

	defaults: {
		ui: 'option',
		scale: 'large',
		xtype: 'button'
	},
	items: [
		{
			text: 'Choose File',
			menu: {
				ui: 'nt',
				cls: 'no-footer no-checkboxes',
				plain: true,
				shadow: false,
				frame: false,
				border: false,
				minWidth: 150,
				defaults: {
					ui: 'nt-menuitem',
					plain: true
				},
				items: [
					{ text: 'From', cls: 'label', ui: 'nt', canActivate: false, focusable: false, hideOnClick: false },
					{ text: 'Computer', xtype: 'file-browser-menu-item' },
					{ text: 'Class Documents', disabled: true},
					{ text: 'Web', disabled: true }
				]
			}
		},
		{ text: 'Take Picture', menu: [], disabled: true }
	],


	initComponent: function(){
		this.callParent(arguments);
		var file = this.down('file-browser-menu-item');

		this.doUpload = this.readFile;
		file.target=this;
		file[(typeof window.FileReader==='undefined')?'disable':'enable']();
	},


	afterRender: function(){
		this.callParent(arguments);

		//only enable canvas dropping if allowed...
		if($AppConfig.service.canCanvasURL()){
			this.enableImageDropping();
		}
	},


	enableImageDropping: function(){
		var me = this,
			el = me.up('whiteboard-editor').canvas.el,
			t;

		if (!el){
			setTimeout(function(){

				me.enableImageDropping();
			},
			500);
			return;
		}

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


	//TODO - should fire when menuitem is selected, override in initComponent of this toolbar
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



	handlePaste:function(event, domEl){
		var clipboardData = event.clipboardData || {},
			me = this;

		Ext.each(clipboardData.types || [], function(type, i) {
			var file, reader;
			if (type.match(/image\/.*/i)) {
				file = clipboardData.items[i].getAsFile();
				reader = new FileReader();
				reader.onload = function(evt) { me.insertImage(evt.target.result); };
				reader.readAsDataURL(file);
				return false;
			}
			return true;
		});

	},


	insertImage: function(dataUrl){
		var image = new Image(),
			e = this.up('whiteboard-editor'),
			c = e.canvas,
            width,
            height;

		function addImageToWhiteboard(){
			var m = new NTMatrix(),
				canvasWidth = c.getWidth(),
				canvasHeight = c.getHeight(),
				s = e.addShape('Url'),
				max = Math.max(width,height), scale;

			if(max === height && max > canvasHeight){
				scale = canvasHeight * 0.90 / max;
			}else if(max === width && max > canvasWidth){
				scale = canvasWidth * 0.90 / max;
			}else{
				scale = 1.0;
			}

			s.url = dataUrl;
			m.translate(canvasWidth/2, canvasHeight/2);
			m.scale(scale);

			m.scaleAll(1/canvasWidth);//do this after

			s.transform = m.toTransform();

			e.fireEvent('turnOnSelection');
			c.drawScene();
		}

        function scaleImage (maxW, maxH) {
            var aspectRatio = 1.0,
                nw, nh,
                cs = Ext.DomHelper.append(Ext.getBody(),{tag: 'canvas', style: {visibility:'hidden',position:'absolute'}}),
                ctx = cs.getContext('2d');

            if(width > height) {
                aspectRatio = width/height;
                nw = maxW;
                nh = Math.round(maxH/aspectRatio);
            }
            else{
                aspectRatio = height/width;
                nw = Math.round(maxW/aspectRatio);
                nh = maxH;
            }

            //Now we want to create a new scaled image
            cs.width = nw;
            cs.height = nh;
            ctx.drawImage(image, 0, 0, width, height, 0, 0, nw, nh);

            width = nw;
            height = nh;
            dataUrl = cs.toDataURL("image/png");
            Ext.fly(cs).remove();    //clean up

        }

        image.onload = function () {
            var maxImgH = 500,
                maxImgW = 500;

            width = image.width;
            height = image.height;

            if(width > maxImgW || height > maxImgH){
                scaleImage(maxImgW, maxImgH);
            }

            addImageToWhiteboard();
        };

        image.src = dataUrl;
	},

	getOptions: function() {
		return {};
	},

	setOptions: function(o){
		console.warn('no need to set options on image toolbar');
	},

	getToolType: function() {
		return 'image';
	}

});
