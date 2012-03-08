Ext.define( 'NextThought.view.widgets.annotations.Annotation', {
	extend: 'NextThought.view.widgets.Widget',
	requires: [
//		'Ext.ux.Spotlight'
		'NextThought.ux.Spotlight',
		'Ext.String'
	],

	constructor: function(record, component) {
		var me = this,
			container = component.body.dom,
			userId= record.get('Creator') || $AppConfig.userObject.getId(),
			d = Ext.query('.document-nibs',container),
			cName = this.self.getName().split('.').pop().toLowerCase();

		Ext.applyIf(me, {
			div: d.length>0? d[0] : me.createElement('div',container,'document-nibs unselectable'),
			img: null,
			container: container,
			ownerCmp: component,
			doc: component.getDocumentElement(),
			record: record,
			userId: userId,
			isModifiable: record.isModifiable(),
			isVisible: record.phantom || me.testFilter(component.filter),

			isSingleAction: false,
			renderPriority: -1,

			offsets: component.getAnnotationOffsets(),

			requestRender: Ext.Function.createBuffered(me.requestRender, 10, me)
		});

		me.ownerCmp.on('afterlayout',me.onResize, me);
		Ext.EventManager.onWindowResize(me.onResize, me);
		

		me.img = me.createImage(
			Ext.BLANK_IMAGE_URL,
			me.div,
			'action',
			cName,
			(me.isVisible?'':'visibility:hidden;'));

		me.img.annotation = me;
		Ext.get(me.img).on('click', me.onClick, me);

		me.attachRecord(record);

		NextThought.view.widgets.annotations.Annotation.register(me);
	},


	/**
	 * Query inside the reader frame
	 * @param selector
	 */
	query: function(selector){
		return Ext.query(selector,this.doc);
	},


	getLineHeight: function(){
		return NaN;
	},

	getBlockWidth: function(){
		return NaN;
	},


	attachRecord: function(record){
		var old = this.record;
		this.record = record;

		record.on('updated',this.attachRecord, this, {single: true});

		if(old.getId() !== record.getId()){
			console.warn('Annotation:',old, '!==', record);
		}

		if(old !== record) {
			old.un('updated', this.attachRecord, this);
		}
	},


	getSortValue: function(){
		var m = 'getAnchorForSort',
			r = this.record;
		return r[m] ? r[m]() : undefined;
	},


	getBubbleParent: function(){return this.ownerCmp; },
	getBubbleTarget: function(){return this.ownerCmp; },

	getRects: null,//implement in subclasses

	cleanup: function(){
		var me = this;
		NextThought.view.widgets.annotations.Annotation.unregister(me);

		me.ownerCmp.un('afterlayout', this.onResize, me);
		Ext.EventManager.removeResizeListener(me.onResize, me);

		if(me.img) {
			Ext.get(me.img).remove();
		}

		delete me.record;
		me.requestRender();
	},
	

	testFilter: function(filter){
		if(	!filter			||
			!filter.types	||
			!filter.groups	||
			filter.types.toString().indexOf(this.$className)<0) {
			return false;
		}

		if((/all/i).test(filter.groups)) {
			return true;
		}

		var p = this.record.get('Creator'),
			targets = filter.shareTargets,
			pass = !!targets[p];
			
		if(filter.includeMe === p){
			return true;
		}
		
		Ext.each(this.record.get('sharedWith'), function(f){
			if(pass) { return false; }
			if(targets[f]) { pass = true; }
		},
		this);
		
		
		return pass;
	},
	

	updateFilterState: function(newFilter){
		var v = this.testFilter(newFilter);
		if(v !== this.isVisible){
			this.isVisible = !!v;
			this.visibilityChanged(v);
		}
	},
	

	visibilityChanged: function(show){
		var i = Ext.get(this.img);
		if(i){
			if(show) { i.show(); }
			else { i.hide(); }
		}

		this.requestRender();
	},
	

	onResize : function(){
		this.requestRender();
	},


	requestRender: function(){
		NextThought.view.widgets.annotations.Annotation.render();
	},


	render: function(){
		Ext.fly(this.img).setStyle('background', this.getColor().toString());
	},

	
	getRecord: function(){
		return this.record;
	},
	
	
	remove: function() {
		this.record.destroy();
		this.cleanup();
		this.cleanup = function(){};
	},


	getMenu: function(isLeaf){
		var m = this.buildMenu();

		m.on('hide', function(){
			if(!isLeaf) { m.destroy(); }
		});

		return m;
	},
	
	savePhantom: function(){
		var me = this;
		if(!me.record.phantom){return;}
		me.isSaving = true;
		me.record.save({
			scope: me,
			failure:function(){
				console.error('Failed to save record', me, me.record);
				me.cleanup();
			},
			success:function(newRecord){
				me.record.fireEvent('updated', newRecord);
				me.record = newRecord;
			}
		});
	},


	buildMenu: function(items) {
		var m = this;

		if(items){
			if(items.length) { items.push('-'); }
			items.push({
				text: m.isModifiable? 'Share With' : 'Get Info',
				handler: function(){
					if (m.record.phantom) {
						m.record.on('updated', function(){
							m.ownerCmp.fireEvent('share-with',m.record);
						},
						{single: true});
						m.savePhantom();
					}
					else{
						m.ownerCmp.fireEvent('share-with',m.record);
					}
				}
			});
		}
		return Ext.create('Ext.menu.Menu',{items: items});
	},
	
	onClick: function(e) {
		e.preventDefault();
		
		var spot, text, menu, annotations = this.multiAnnotation();

		spot = Ext.create('NextThought.ux.Spotlight');

		if (annotations && annotations.length > 1) {

			menu = Ext.create('Ext.menu.Menu');
			Ext.each(annotations, function(o, i){
				var subMenu, item;

				if (!o.getMenu) { return; }

				subMenu = o.getMenu(true);

				if (subMenu.items.getCount()===1){
					item = subMenu.items.first();
				}
				else {
					text = AnnotationUtils.getBodyTextOnly(o.record);
					item = Ext.create('Ext.menu.Item', {
						text: o.record.getModelName()+' '+Ext.String.ellipsis(text,15,true),
						menu: subMenu,
						listeners: {
							'activate': function(){ spot.show(o); }
						}
					});
				}
				this.menuItemHook(o,item, menu);

				menu.add(item);
			},
			this);

			menu.on('hide', function(){
				menu.destroy();
				spot.destroy();
			});
			menu.showBy(Ext.get(this.img), 'bl');
			return;
		}
		
		//single annotation
		menu = this.getMenu();
		if(this.isSingleAction){
			menu.items.first().handler.call(menu);
			return;
		}

		spot.show(this);

		menu.on('hide', function(){ spot.destroy(); }, this, {single: true});
		menu.showBy(Ext.get(this.img), 'bl');
	},


	getColor: function(){
		return Color.getColor(this.userId);
	},


	menuItemHook: function(o,item /*, menu*/){
		var color = this.getColor();
		item.on('afterrender',function() {
			var img = item.el.select('img.x-menu-item-icon').first();
			if(img){ img.setStyle('background', color); }
		});
	},

	multiAnnotation: function() {
		var result = [],
			top = this.img.style.top;

		Ext.each(this.div.childNodes, function(o){
			if (o.annotation && top === o.style.top) {
				result.push(o.annotation);
			}
		});
		
		return result;
	},


	statics: {
		events: new Ext.util.Observable(),
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
				k = 'renderPriority';

			function $(v){
				var r = v.getSortValue();
				return  r? Ext.Array.indexOf(anchors,r) : -1;
			}

			return function(a,b){
				var $a = $(a),
					$b = $(b),
					c = 0;

				if(a[k] !== b[k]){
					c = a[k] < b[k]? -1 : 1;
				}

				if( c === 0 && $a !== $b ){
					c = $a < $b ? -1:1;
				}
				return c;
			};
		},


		render: function(){
			if(this.rendering){
				this.events.on('finish',this.render,this,{single:true});
				console.warn('Render called while rendering...');
				return;
			}
			this.aboutToRender = false;
//			console.time('Rendering');
			this.rendering = true;
			this.events.fireEvent('rendering');
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

			this.rendering = false;
			this.events.fireEvent('finish');
//			console.timeEnd('Rendering');
		}

	}
},
function(){
	var me = this, fn = this.render, timerId;

	this.render = (function() {
			return function() {
				me.aboutToRender = true;
				if (timerId) {
					clearTimeout(timerId);
					timerId = null;
				}
				timerId = setTimeout(function(){fn.call(me);}, 100);
			};

		}());
});
