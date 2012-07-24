Ext.define('NextThought.view.Window',{
	extend: 'Ext.window.Window',
	alias: 'widget.nti-window',

	requires: [
		'NextThought.util.Ranges',
		'NextThought.view.WindowHeader',
		'NextThought.view.WindowManager'
	],

	cls: 'nti-window',
	ui: 'nti-window',
	plain: true,
	shadow: false,

	autoShow: false,
	border: true,
	frame: false,
	header: false,

	constrain: true,
	constrainHeader: false,
	liveDrag: true,
	dragStartTolerance: 5,

	layout: { type: 'vbox', align: 'stretch' },
	items: [
		{xtype:'nti-window-header' },
		{xtype:'container', flex: 1}
	],


	onClassExtended: function(cls, data, hooks) {
		var onBeforeClassCreated = hooks.onBeforeCreated;

		hooks.onBeforeCreated = function(cls, data) {
			var superCls = cls.prototype.superclass;
			var frame = Ext.clone(superCls.items),
				layout = Ext.clone(superCls.layout);

			if(data.dialog){
				data.layout = data.layout || 'auto';//dialogs define their own view
			}
			else {
				Ext.apply(frame.last(),{
					items: data.items,
					layout: data.layout
				});

				Ext.apply(frame.first(),{
					title: data.title || '',
					tools: data.tools || []
				});

				delete data.tools;

				data.items = frame;
				data.layout = layout;
			}
			onBeforeClassCreated.call(this, cls, data, hooks);
		};
	},

	constructor: function(config){
		this.manager = NextThought.view.WindowManager;

		if(!this.dialog && !config.dialog){

			Ext.copyTo(this.items.last(),config,['items','layout']);

			delete config.items;
			delete config.layout;

			var title = config.title;
			delete config.title;

			if(title){
				this.items.first().title = title;
			}
		}

		return this.callParent([config]);
	},


	initComponent: function(){
		this.callParent(arguments);
		var me = this,
			w = this.width,
			h = this.height;

		this.widthPercent = typeof w === 'string' ? (parseInt(w,10)/100) : null;
		this.heightPercent = typeof h === 'string' ? (parseInt(h,10)/100) : null;

		if( this.widthPercent || this.heightPercent ) {
			this.resizable = false;
			this.draggable = false;
			this.syncSize();
			Ext.EventManager.onWindowResize(me.syncSize,me);
			this.on('destroy',function(){ Ext.EventManager.removeResizeListener(me.syncSize,me);});
		}

		this.titleBar = this.down('nti-window-header');
		if(!this.modal && !this.dialog){
			this.manager.register(this);
		}
	},


	show: function(){
		var s = window.getSelection(), r,
			c = Ext.WindowManager.getActive();
		if( c ){
			if( !c || !c.modal ){ c = null; }
			else {
				r = RangeUtils.saveRange( s.getRangeAt(0) );
			}
		}

		this.callParent(arguments);

		if(c){
			c.toFront();
			r = RangeUtils.restoreSavedRange(r);
			if(r){
				setTimeout(function(){
					c = r.commonAncestorContainer;
					c = c.focus? c:c.parentNode;
					c.focus();
					s.removeAllRanges();
					s.addRange(r);
				},50);
			}
		}

		return this;
	},



	syncSize: function(){
		var me = this,
			h = Ext.Element.getViewportHeight() * me.heightPercent,
			w = Ext.Element.getViewportWidth() * me.widthPercent,
			size = me.rendered ? me.getSize() : {width: me.width, height: me.height};

		size.width	= Math.floor( w || size.width );//NaN is falsy
		size.height	= Math.floor( h || size.height );

		console.log('syncing size');
		this.setSize(size,undefined);
		this.center();
	},


	initResizable: function(){
		this.callParent(arguments);

		this.resizer.on({
			scope: this,
			beforeresize: this.dragMaskOn,
			resize: this.dragMaskOff
		});
	},


	initDraggable: function() {
		if(!this.dialog){
			try {
				this.dd = new Ext.util.ComponentDragger(this, {
					constrain: true,
					constrainTo: Ext.getBody(),
					el: this.el,
					tolerance: this.dragStartTolerance,
					delegate: this.titleBar.getEl()
				});
				this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);
				this.mon(this.dd,{
					scope: this,
					dragstart: this.dragMaskOn,
					dragend: this.dragMaskOff
				});
			}
			catch(e){
				console.error(Globals.getError(e));
			}
		}
	},



	setTitle: function(title){
		if( this.titleBar ){
			this.titleBar.update(title);
			this.fireEvent('titleChange',this,title);
		}
	},


	getTitle: function(){
		var title;
		if(this.titleBar){
			title = this.titleBar.getTitle();
		}
		return title || 'Untitled';
	},


	getHeight: function(){
		return this.rendered? this.callParent() : this.height || this.minHeight;
	},


	getWidth: function(){
		return this.rendered? this.callParent() : this.width || this.minWidth;
	},


	addTools: function(tools){
		if( this.titleBar ){
			this.titleBar.addTools(tools);
		}
	},


	dragMaskOn: function(){
		Ext.getCmp('viewport').el.mask('','drag-mask');
	},


	dragMaskOff: function(){
		Ext.getCmp('viewport').el.unmask();
	},


	//stub for interface, WindowManager will implement
	notify: Ext.emptyFn
});
