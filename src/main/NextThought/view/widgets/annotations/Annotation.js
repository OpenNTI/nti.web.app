
Ext.define( 'NextThought.view.widgets.annotations.Annotation', {
	extend: 'NextThought.view.widgets.Widget',

	constructor: function(record, container, component, icon) {
        Ext.apply(this, {
            _div: null,
            _img: null,
            _cnt: container,
            _cmp: component,
            _menu: null,
            _record: record,
            _isMine: record.isModifiable()
        });

		var me = this,
            b = Ext.Function.createBuffered(me.onResize,100,me,['buffered']),
			d;

		me.addEvents('resize');
		me.enableBubble('resize');

		me._isVisible = record.phantom || me.testFilter(component._filter);
		me._cmp.on('resize', b, me);
		Ext.EventManager.onWindowResize(b, me);
		
		d = Ext.query('.document-nibs',container);
		me._div = d.length>0? d[0] : me.createElement('div',container,'document-nibs unselectable');

		if(icon){
			me._img = me.createImage(icon,me._div,
						'action',
						'width: 17px; background: yellow; height: 17px; position: absolute;'+(me._isVisible?'':'visibility:hidden;'));
			me._img._annotation = me;
			Ext.get(me._img).on('click', me.onClick, me);
		}
        me.onResize = b;
	},


	getBubbleParent: function(){return this._cmp; },
	getBubbleTarget: function(){return this._cmp; },

    getCmp: function(){
        return this._cmp;
    },
	
	cleanup: function(){
		var me = this;
		me._cmp.un('resize', me.onResize, me);
		Ext.EventManager.removeResizeListener(me.onResize, me);
		if(me._img)
			Ext.get(me._img).remove();
		if(me._menu){
			me._menu.destroy();
			delete me._menu;
		}
		delete me._record;
	},
	
	testFilter: function(filter){
        if(	!filter			||
			!filter.types	||
			!filter.groups	||
			filter.types.toString().indexOf(this.$className)<0)
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
			this._isVisible = !!v;
			this.visibilityChanged(v);
		}
	},
	
	visibilityChanged: function(show){
		var i = Ext.get(this._img);
		if(i){
			if(show) i.show();
			else i.hide();
		}
	},
	
	onResize : function(){
		console.warn('WANRING: handle resizing yourself!');
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
        var m = this._buildMenu(),
			isLeaf = arguments.length>0;

        m.on('hide', function(){
            if(!isLeaf)m.destroy();
        });

        return m;
    },
	
	
	_buildMenu: function(items) {
		var m = this;

		if(items){
			if(items.length) items.push('-');
			items.push({
				text: m._isMine? 'Share With' : 'Get Info',
				handler: function(){
					m.getCmp().fireEvent('share-with',m._record);
				}
			});
		}
		return Ext.create('Ext.menu.Menu',{items: items});
	},
	
	onClick: function(e) {
		e.preventDefault();
		this.clearListeners();
		
		var menu, annotations = this._multiAnnotation();
		if (annotations && annotations.length > 1) {
			menu = Ext.create('Ext.menu.Menu');
			Ext.each(annotations, function(o, i){
				if (!o.getMenu) return;
				o.clearListeners();
				var item = Ext.create('Ext.menu.Item', {
						text: 'Annotation '+(i+1),
						menu: o.getMenu({/*this argument will tell it to not destroy itself*/})
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
	
	_menuItemHook: Ext.emptyFn,
	
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
