
Ext.define( 'NextThought.view.widgets.annotations.Annotation', {
	extend: 'NextThought.view.widgets.Widget',
	
	_div: null,
	_img: null,
	_cnt: null,
	_cmp: null,
	_menu: null,
	_record: null,
	_isMine: false,
	
	constructor: function(record, container, component, icon) {
		var me = this,
            b = Ext.Function.createBuffered(me.onResize,100,me,['buffered']);
		me.addEvents('share-with');
		me.enableBubble('share-with');
		
		me._cnt = container;
		me._cmp = component;
		me._record = record;
		me._isVisible = record.phantom || me.testFilter(component._filter);
		me._isMine = record.get('Creator') == _AppConfig.server.username || record.phantom;
		me._cmp.on('resize', b, me);
		Ext.EventManager.onWindowResize(b, me);
		
		var d = Ext.query('.document-nibs',container);
		me._div = d.length>0? d[0] : me.createElement('div',container,'document-nibs unselectable');
		me._img = me.createImage(icon?icon:Ext.BLANK_IMAGE_URL,me._div,
				'action',
				'width: 17px; background: yellow; height: 17px; position: absolute;'+(me._isVisible?'':'visibility:hidden;'));
		me._img._annotation = me;
		//me._menu = me._buildMenu();
		Ext.get(me._img).on('click', me.onClick, me);

        me.onResize = b;
	},

    getCmp: function(){//return the component that represents this annotation.
        return null;
    },
	
	getBubbleTarget: function(){
		return this._cmp;
	},
	
	cleanup: function(){
		var me = this;
		me._cmp.un('resize', me.onResize, me);
		Ext.EventManager.removeResizeListener(me.onResize, me);
		Ext.get(me._img).remove();
		if(me._menu){
			me._menu.destroy();
			delete me._menu;
		}
		delete me._record;
	},
	
	testFilter: function(filter){
        if(	!filter
		 || !filter.types
		 || !filter.groups
		 || filter.types.toString().indexOf(this.$className)<0)
			return false;

        if(/all/i.test(filter.groups)){
            return true;
        }

		var p = this._record.get('Creator'),
			targets = filter.shareTargets,
			pass = !!targets[p];
			
		if(filter.includeMe == p){
			return true;
		}
		
		Ext.each(this._record.get('sharedWith'), function(f){
			if(pass)return false;
			if(targets[f]) pass = true;
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
        this.cleanup = function(){};
	},


    getMenu: function(){
        var m = this._buildMenu();
        m.on('hide', function(){
            m.destroy();
        });

        return m;
    },
	
	
	_buildMenu: function(items) {
		//if(!this._isMine)return null;
		var m = this;

		if(items){
			if(items.length) items.push('-');
			items.push({
				text: 'Share With',
				handler: function(){
					m.fireEvent('share-with',m._record);
				}
//			},{
//				text: 'Get Shared Info',
//				handler: function(){}
			});
		}
		return Ext.create('Ext.menu.Menu',{items: items});
	},
	
	onClick: function(e) {
		e.preventDefault();
		this.clearListeners();
		
		var annotations = this._multiAnnotation();
		if (annotations && annotations.length > 1) {
			var menu = Ext.create('Ext.menu.Menu');
			Ext.each(annotations, function(o, i){
				if (!o.getMenu) return;
				o.clearListeners();
				var item = Ext.create('Ext.menu.Item', {
						text: 'Annotation '+(i+1),
						menu: o.getMenu()
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
		this.getMenu().showBy(Ext.get(this._img), 'bl');
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