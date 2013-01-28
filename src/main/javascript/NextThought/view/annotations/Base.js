Ext.define( 'NextThought.view.annotations.Base', {

	requires: [
		'NextThought.view.annotations.renderer.Manager',
		'Ext.String'
	],

	mixins: {
		observable: 'Ext.util.Observable',
		shareable: 'NextThought.mixins.Shareable'
	},

	statics: {
		NOT_FOUND: -3,
		NOT_VISIBLE: -4
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

	hasGutterWidgets: false,

	constructor: function(config) {
		var me = this,
			c = config.reader,
			r = config.record,
			container = c.body.dom;

		me.mixins.observable.constructor.call(this);
		me.mixins.shareable.constructor.call(this);
		me.addEvents('afterrender');

		Ext.applyIf(me, {
			id: IdCache.getComponentId(r.getId(), null, c.prefix),
			container: container,
			ownerCmp: c,
			doc: c.getDocumentElement(),
			record: r,
			userId: r.get('Creator') || $AppConfig.username,
			isModifiable: r.isModifiable(),
			isVisible: Boolean(r.phantom || (!c.filter ? true : c.filter.test(r))),

			allowShare: $AppConfig.service.canShare(),

			isSingleAction: false,
			renderPriority: -1,

			prefix: c.prefix || 'default',

			requestRender: Ext.Function.createBuffered(me.requestRender, 10, me)
		});

		if(typeof r.data.sharedWith !== 'undefined'){
			try{ this.mixins.shareable.afterRender.call(this); }
			catch(e){
				console.warn(
						'attempted to setup dragging on ',
						r.$className,
						Globals.getError(e));
			}
		}

		this.mon(c,'afterlayout',me.requestRender, me);
		Ext.EventManager.onWindowResize(me.requestRender, me);

		me.attachRecord(r);

		AnnotationsRenderer.register(me);
		if(this.getItemId()){
			Ext.ComponentManager.register(this);
		}
	},

	getBubbleTarget: function(){return this.ownerCmp; },
	getItemId: function(){return this.id; },
	isXType: function(){return false;},
	getEl: function(){
		return Ext.get(this.img);
	},


	getContainerId: function(){
		return this.getRecord().get('ContainerId');
	},


	getDocumentElement: function(){
		return this.ownerCmp.getDocumentElement();
	},


	createElement: function(tag,parent,cls,css,id){
		var el = document.createElement(tag);
		if(cls) { Ext.get(el).addCls(cls); }
		if(css) { el.setAttribute('style',css); }
		if(id){el.setAttribute('id',id);}
		parent.appendChild(el);
		return el;
	},


	createNonAnchorableSpan: function(){
		//NOTE: it is very important to make sure we create the span
		// in the same doc as the range it will surround.
		var span = this.doc.createElement('span');
		span.setAttribute('data-non-anchorable', 'true');
		return span;
	},


	/**
	 * Query inside the reader frame
	 * @param selector
	 */
	query: function(selector){
		return Ext.query(selector,this.doc);
	},

	getSortValue: function(){console.warn('Implement me!!');},

	getRecord: function(){ return this.record || {get:Ext.emptyFn}; },
	getRecordField: function(field){ return this.getRecord().get(field); },

	attachRecord: function(record){
		var old = this.record;
		this.record = record;

		this.mon(record,{
			single: true,
			scope: this,
			updated:this.attachRecord,
			destroy:this.onDestroy
		});

		if(old.getId() !== record.getId()){
			console.warn('Annotation:',old, '!==', record);
		}

		if(old !== record) {
			this.mun(old,'updated', this.attachRecord, this);
			this.mun(old,'destroy',this.onDestroy, this);
		}
	},


	onDestroy: function(){
		try{
			this.cleanup();
		}
		catch(e){
			swallow(e);
		}
	},


	getDisplayName: function(){
		return this.$displayName || this.$className.split('.').last();
	},

	cleanup: function(){
		this.cleanup = Ext.emptyFn;
		var me = this,
			r = me.record,
			id = r.getId(),
			c = me.ownerCmp;

		delete me.record;

		if(me.getItemId()){
			Ext.ComponentManager.unregister(me);
		}
		AnnotationsRenderer.unregister(me);

		Ext.EventManager.removeResizeListener(me.requestRender, me);

		if( c.annotationExists(r)){
			c.removeAnnotation(id);
		}

		this.clearListeners();
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
		this.requestRender();
	},


	render: function(){
		console.warn( Ext.String.format(
						'{0} does not implement render()',
						this.$className));
	},


	requestRender: function(){
		AnnotationsRenderer.render(this.prefix);
	},


	remove: function() {
		this.record.destroy();//the destroy event calls cleanup
	},

	getRestrictedRange: function(){
		return null;
	},

	savePhantom: function(callback){
		var me = this, p;
		if(!me.record.phantom){return;}
		me.isSaving = true;

		p = LocationProvider.getPreferences();
		p = p ? p.sharing : null;

		p = this.allowShare? p : null;

		me.record.set('SharedWidth',p);

		me.record.save({
			scope: me,
            callback:function(record, operation){
                var success, rec;
                try{
                    success = operation.success;
                    rec = success ? ParseUtils.parseItems(operation.response.responseText)[0] : null;
                    if (success){
                        me.record.fireEvent('updated', rec);
                        me.record = rec;
                    }
                    else{
                        me.cleanup();
                        alert({title:'Ooops!', msg:'Something went wrong while saving. Please try again.'});
                    }
                }
                catch(err){
                    console.error('Something went wrong... ',err);
                }
                if (callback) {
                    Ext.callback(callback, this, [success, rec]);
                }
            }
		});
	},


	buildMenu: function(items) {
		var m = this,
			r = m.getRecord(),
			d = m.ownerCmp.getDefinitionMenuItem();

		items = items || [];

		if(d){ items.push(d); }

		if(items.length) { items.push({xtype: 'menuseparator'}); }

		if(this.isModifiable) {
			items.push({
				text : (r.phantom?'Save':'Delete')+' '+ m.getDisplayName(),
				handler: Ext.bind(r.phantom? m.savePhantom : m.remove, m)
			});
		}

		if(this.allowShare){
			items.push({
				text: m.isModifiable ? 'Share With...' : 'Get Info...',
				handler: function(){
					if (m.record.phantom) {
						m.mon(m.record,'updated', function(){
							m.ownerCmp.fireEvent('share-with',m.record);
						},{single: true});

						m.savePhantom();
					}
					else{
						m.ownerCmp.fireEvent('share-with',m.record);
					}
				}
			});
		}

		return Ext.create('Ext.menu.Menu',{
			items: items,
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			minWidth: 150,
			defaults: {ui: 'nt-annotaion', plain: true }
		});
	},


	getMenu: function(isLeaf){
		var m = this.buildMenu([]);

        if (m) {
		    m.on('hide', function(){
			if(!isLeaf) { m.destroy(); }
		});
        }

		return m;
	},


	attachEvent: function(event,dom,fn,scope){
		if(!Ext.isArray(event)){
			event = [event];
		}

		var called = false,
			timerId;

		function block(){
			if(called){return undefined;}
			called = true;
			var r = fn.apply(scope,arguments);
			timerId = setTimeout(function(){called=false;},50);
			return r;
		}

		Ext.each(event,function(event){
			Ext.fly(dom).on(event,block);
		});
	},


	onClick: function(e) {
		if(!this.isVisible){
			console.debug('DEBUG: Ignoring click on hidden annotation');
			return true;
		}

		var menu,
			xy = e.getXY().slice(),
			offsets = this.ownerCmp.getAnnotationOffsets();

		//adjust points
		xy[0] += offsets.left;
		xy[1] += offsets.top;

		//single annotation
		menu = this.getMenu();
        if (menu){
            if(this.isSingleAction){
                menu.items.first().handler.call(menu);
                return true;
            }

            menu.showAt.apply(menu,xy);
            menu.setPosition(xy[0]-menu.getWidth()/2,xy[1]+10);
        }

		e.stopEvent();
		return false;//IE :(
	},


	/**
	 * Returns a Ext element control for the control gutter.  Many annotations may not have one.
	 */
	getControl: function(){},


	/**
	 * Returns the widget to be placed in the gutter for interaction with this annotation.  Override in
	 * implementation class to return something.  Returns an Ext element.
	 *
	 * @param [numberOfSiblings] - number of siblings in case there is secondary widget renderings.
	 *                             null implies you do not care or there is no alternate renderings.
	 */
	getGutterWidget: function(numberOfSiblings){}
});
