
Ext.define( 'NextThought.view.widgets.annotations.Annotation', {
	extend: 'NextThought.view.widgets.Widget',

	constructor: function(record, container, component, icon) {
		var me = this,
			d = Ext.query('.document-nibs',container);

        Ext.apply(me, {
			_div: d.length>0? d[0] : me.createElement('div',container,'document-nibs unselectable'),
            _img: null,
            _cnt: container,
            _cmp: component,
            _menu: null,
            _record: record,
            _isMine: record.isModifiable(),
			_isVisible: record.phantom || me.testFilter(component._filter),

			_renderPriority: -1,

			requestRender: Ext.Function.createDelayed(me.requestRender, 10, me)
        });

		me._cmp.on('afterlayout',me.onResize, me);
		Ext.EventManager.onWindowResize(me.onResize, me);
		
		if(icon){
			me._img = me.createImage(icon,me._div,
						'action',
						'width: 17px; background: yellow; height: 17px; position: absolute;'+(me._isVisible?'':'visibility:hidden;'));
			me._img._annotation = me;
			Ext.get(me._img).on('click', me.onClick, me);
		}

		NextThought.view.widgets.annotations.Annotation.register(me);
	},


	getSortValue: function(){
		var m = 'getAnchorForSort',
			r = this._record;
		return m in r ? r[m]() : undefined;
	},


	getBubbleParent: function(){return this._cmp; },
	getBubbleTarget: function(){return this._cmp; },
	getCmp: function(){ return this._cmp; },

	
	cleanup: function(){
		var me = this;
		NextThought.view.widgets.annotations.Annotation.unregister(me);

		me._cmp.un('afterlayout', this.onResize, me);
		Ext.EventManager.removeResizeListener(me.onResize, me);

		if(me._img)
			Ext.get(me._img).remove();

		if(me._menu){
			me._menu.destroy();
			delete me._menu;
		}
		delete me._record;
		me.requestRender();
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

		this.requestRender();
	},
	

	onResize : function(){
		this.requestRender();
	},


	requestRender: function(){
		NextThought.view.widgets.annotations.Annotation.render();
	},


	render: function(){},

	
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
	},


	statics: {
		_annotationEvents: new Ext.util.Observable(),
		registry: [],
		sorter: null,


		register: function(o){
			this.registry.push(o);
			o.requestRender();
		},


		unregister: function(o){
			this.registry = Ext.Array.remove(this.registry,o);
			if(this.registry.legend===0){
				this.sorter = null;
			}
		},


		buildSorter: function(){
			var anchors = Ext.Array.map(
					Ext.DomQuery.select('#NTIContent a[name]'),
					function(a){
						return a.getAttribute('name');
					}
				),
				k = '_renderPriority';

			function _(v){
				var r = v.getSortValue();
				return  r? Ext.Array.indexOf(anchors,r) : 0;
			}

			return function(a,b){
				var _a = _(a),
					_b = _(b),
					c = 0;

				if(a[k] != b[k]){
					c = a[k] < b[k]? -1 : 1;
				}

				if( c === 0 && _a != _b ){
					c = _a < _b ? -1:1;
				}
				return c;
			};
		},


		render: function(){
//			console.log('Rendering...');
			this.sorter = this.sorter || this.buildSorter();
			this.registry = Ext.Array.unique(this.registry);

			Ext.Array.sort(this.registry, this.sorter);

			Ext.each(Ext.Array.clone(this.registry), function(o){
				try {
//					console.log(o.$className);
					o.render();
				}
				catch(e){
					console.error(o.$className,e.stack);
				}
			});

//			console.log('Rendering ended...');
		}

	}
},
function(){
	this.render = Ext.Function.createBuffered(this.render,50,this);
});
