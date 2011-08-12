
Ext.define( 'NextThought.view.widgets.Annotation', {
	extend: 'NextThought.view.widgets.Widget',
	
	_div: null,
	_img: null,
	_cnt: null,
	_cmp: null,
	_menu: null,
	_record: null,
	
	constructor: function(record, container, component, icon) {
		var me = this;
		me._cnt = container;
		me._cmp = component;
		me._record = record;
		me._isVisible = record.phantom || me.testFilter(component._filter);
		me._cmp.on('resize', me.onResize, me);
		me._cmp.on('afterlayout',Ext.Function.createBuffered(me.onResize,100,me));
		Ext.EventManager.onWindowResize(me.onResize, me);
		
		var d = Ext.query('.document-nibs',container);
		me._div = d.length>0? d[0] : me.createElement('div',container,'document-nibs unselectable');
		me._img = me.createImage(icon?icon:Ext.BLANK_IMAGE_URL,me._div,
				'action',
				'width: 17px; background: yellow; height: 17px; position: absolute;'+(me._isVisible?'':'visibility:hidden;'));
		me._img._annotation = me;
		me._menu = me._buildMenu();
		Ext.get(me._img).on('click', me.onClick, me);
	},
	
	cleanup: function(){
		var me = this;
		me._cmp.un('resize', me.onResize, me);
		Ext.EventManager.removeResizeListener(me.onResize, me);
		Ext.get(me._img).remove();
		me._menu.destroy();
		delete me._menu;
		delete me._record;
	},
	
	testFilter: function(filter){
		if(	!filter 
		 || !filter.types
		 || !filter.groups
		 || filter.types.toString().indexOf(this.$className)<0)
			return false;
		
		var p = this._record.get('Creator'),
			targets = filter.shareTargets,
			pass = !!targets[p];
			
		if(filter.includeMe == p){
			return true;
		}
		
		Ext.each(this._record.get('sharedWith'), function(f){
			if(pass)return false;
			//backwards compatibility 
			if(typeof(f)=='string') { if(targets[f]) pass = true; }
			//future format:
			else if( targets[f.get('Username')] ) pass = true;
		},
		this);
		
		
		return pass;
	},
	
	updateFilterState: function(newFilter){
		var v = this.testFilter(newFilter);
		if(v != this._isVisible){
			this._isVisible = v;
			this.visibilityChanged(v);
		}
	},
	
	visibilityChanged: function(show){
		// console.log('vis change');
		var i = Ext.get(this._img);
		show? i.show() : i.hide();
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