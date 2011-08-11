
Ext.define( 'NextThought.view.widgets.Annotation', {
	extend: 'NextThought.view.widgets.Widget',
	
	_div: null,
	_img: null,
	_cnt: null,
	_cmp: null,
	_menu: null,
	_record: null,
	
	constructor: function(record, container, component, icon) {
		
		this._cnt = container;
		this._cmp = component;
		this._record = record;
		this._cmp.on('resize', this.onResize, this);
		Ext.EventManager.onWindowResize(this.onResize, this);
		
		var d = Ext.query('.document-nibs',container);
		this._div = d.length>0? d[0] : this.createElement('div',container,'document-nibs unselectable');
		this._img = this.createImage(icon?icon:Ext.BLANK_IMAGE_URL,this._div,'action','width: 17px; background: yellow; height: 17px; position: absolute;');
		this._img._annotation = this;
		this._menu = this._buildMenu();
		Ext.get(this._img).on('click', this.onClick, this);
	},
	
	cleanup: function(){
		this._cmp.un('resize', this.onResize, this);
		Ext.EventManager.removeResizeListener(this.onResize, this);
		Ext.get(this._img).remove();
		this._menu.destroy();
		delete this._menu;
		delete this._record;
	},
	
	onResize : function(e){
		console.log('WANRING: handle resizing yourself!');
	},

	
	getRecord: function(){
		return this._record;
	},
	
	
	remove: function() {
		this._record.destroy();
		this.cleanup();
	},
	
	
	_buildMenu: function(items) {
		return Ext.create('Ext.menu.Menu',{items: items});
	},
	
	onClick: function(e) {
		e.preventDefault();
		this.clearListeners();
		
		var annotations = this._multiAnnotation();
		if (annotations && annotations.length > 1) {
			var menu = Ext.create('Ext.menu.Menu');
			Ext.each(annotations, function(o, i){
				if (!o._menu) return;
				o.clearListeners();
				var item = Ext.create('Ext.menu.Item', {
						text: 'Annotation '+(i+1),
						menu: o._menu.cloneConfig()
				});
				
				this._menuItemHook(o,item, menu);
				
				menu.add(item);
			},
			this);
			menu.on('hide', function(){
				menu.destroy();
			});
			menu.showBy(Ext.get(this._img), 'bl');
			return;
		}
		
		//single annotation
		this._menu.showBy(Ext.get(this._img), 'bl');
	},
	
	_menuItemHook: function(o,item, menu){
	},
	
	_multiAnnotation: function() {
		var result = [],
			top = this._img.style.top;
		Ext.each(this._div.childNodes, function(o){
			if (o._annotation && top == o.style.top) 
				result.push(o._annotation);
		});
		
		return result;
	}
	
});