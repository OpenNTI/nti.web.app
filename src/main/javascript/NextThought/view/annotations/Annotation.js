Ext.define( 'NextThought.view.annotations.Annotation', {

	requires: [
		'NextThought.view.annotations.renderer.Manager',
		'NextThought.ux.Spotlight',
		'Ext.String'
	],

	mixins: {
		observable: 'Ext.util.Observable',
		shareable: 'NextThought.mixins.Shareable'
	},


	onClassExtended: function(cls, data, hooks) {
		var onBeforeClassCreated = hooks.onBeforeCreated;

		hooks.onBeforeCreated = function(cls, data) {
			if(data.requestRender){
				Ext.Error.raise('You should not replace requestRender');
			}

			onBeforeClassCreated.call(this, cls, data, hooks);
		};
	},


	constructor: function(config) {
		var me = this,
			c = config.reader,
			r = config.record,
			container = c.body.dom;

		me.mixins.observable.constructor.call(this);
		me.mixins.shareable.constructor.call(this);
		me.addEvents('afterrender');

		Ext.applyIf(me, {
			id: IdCache.getComponentId(config.record.getId(), null, c.prefix),
			container: container,
			ownerCmp: c,
			doc: c.getDocumentElement(),
			record: r,
			userId: r.get('Creator') || $AppConfig.username,
			isModifiable: r.isModifiable(),
			isVisible: Boolean(r.phantom || (!c.filter ? true : c.filter.test(r))),

			isSingleAction: false,
			renderPriority: -1,

			offsets: c.getAnnotationOffsets(),

			prefix: c.prefix || 'default',

			requestRender: Ext.Function.createBuffered(me.requestRender, 10, me)
		});

		if(typeof r.data.sharedWith !== 'undefined'){
			try{ this.mixins.shareable.afterRender.call(this); }
			catch(e){
				console.error(
						'attempted to setup dragging on ',
						r.getClassName(),
						Globals.getError(e));
			}
		}

		c.on('afterlayout',me.requestRender, me);
		Ext.EventManager.onWindowResize(me.requestRender, me);

		me.attachRecord(r);

		AnnotationsRenderer.register(me);
		Ext.ComponentManager.register(this);
	},

	getBubbleTarget: function(){return this.ownerCmp; },
	getItemId: function(){return this.id; },
	isXType: function(){return false;},
	getEl: function(){
		return Ext.get(this.img);
	},


	/**
	 * Query inside the reader frame
	 * @param selector
	 */
	query: function(selector){
		return Ext.query(selector,this.doc);
	},

	getSortValue: function(){console.warn('Implement me!!');},

	getLineHeight: function(){ return NaN; },
	getBlockWidth: function(){ return NaN; },
	getRects: null,//implement in subclasses
	getRecord: function(){ return this.record; },
	getRecordField: function(field){ return this.getRecord().get(field); },

	attachRecord: function(record){
		var old = this.record;
		this.record = record;

		record.on('updated',this.attachRecord, this, {single: true});
		record.on('destroy',this.cleanup, this, {single:true});

		if(old.getId() !== record.getId()){
			console.warn('Annotation:',old, '!==', record);
		}

		if(old !== record) {
			old.un('updated', this.attachRecord, this);
			old.un('destroy',this.cleanup, this);
		}
	},


	cleanup: function(){
		var me = this,
			r = me.record,
			id = r.getId(),
			c = me.ownerCmp;
		delete me.record;

		r.removeAllListeners();
		Ext.ComponentManager.unregister(me);
		AnnotationsRenderer.unregister(me);

		c.un('afterlayout', this.requestRender, me);
		Ext.EventManager.removeResizeListener(me.requestRender, me);

		if( c.annotationExists(r)){
			c.removeAnnotation(id);
		}

		this.requestRender();
	},
	

	updateFilterState: function(newFilter){
		var v = newFilter.test(this.record);
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
	

	render: function(isLastOfBlock){
		console.warn( Ext.String.format(
						'{0} does not implement render()',
						this.self.getClassName()));
	},


	requestRender: function(){
		AnnotationsRenderer.render(this.prefix);
	},

	
	remove: function() {
		this.record.destroy();
		this.cleanup();
		this.cleanup = function(){};
	},


	savePhantom: function(callback){
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
				if (callback) {
					Ext.callback(callback);
				}
			}
		});
	},


	buildMenu: function(items) {
		var m = this;

		items = items || [];
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

		//standard items Share, Remove, save(if phantom?)

		Ext.each(items, function(i){ Ext.apply(i,{ ui: 'nt-annotaion', plain: true }); });

		return Ext.create('Ext.menu.Menu',{
			items: items,
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			minWidth: 150
		});
	},


	getMenu: function(isLeaf){
		var m = this.buildMenu([]);

		m.on('hide', function(){
			if(!isLeaf) { m.destroy(); }
		});

		return m;
	},


	onClick: function(e) {
		var spot, text, menu;

		//single annotation
		menu = this.getMenu();
		if(this.isSingleAction){
			menu.items.first().handler.call(menu);
			return;
		}

		spot = Ext.widget({xtype:'spotlight', target: this});
		menu.on('hide', function(){ spot.destroy();});
		menu.showAt.apply(menu,e.getXY());

		e.stopPropagation();
		e.preventDefault();
		return false;//IE :(
	}
});
