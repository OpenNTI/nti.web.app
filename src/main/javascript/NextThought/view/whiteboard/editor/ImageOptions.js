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
					{ text: 'Class Documents' },
					{ text: 'Web' }
				]
			}
		},
		{ text: 'Take Picture', menu: [], disabled: true },
		'->',
		'Upload from Class Resources folder'
	],

	enableImageDropping: function(){
		var el = this.canvas.el, t;//TODO: point el to the editor's canvas's el.
		// "this.canvas" is meant from the context of the editor, not this toolbar.
		// The code was cut from the editor and needs to be rewritten for this context.
		// This method should hook into the editor, by calling this.up('editor').canvas.el
		// in the initComponent method... it should call this.up('editor').on(afterRender, this.enableImageDropping,this)


		function over(e) {
			el.addCls('drop-over');
			e.stopPropagation();
			e.preventDefault();
			if(t){ clearTimeout(t); }
			t = setTimeout(function(){el.removeCls('drop-over');}, 100);
			return false; //for IE
		}

		this.mon(el,{
			'scope': this,
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
