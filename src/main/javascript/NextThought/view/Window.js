Ext.define('NextThought.view.Window',{
	extend: 'Ext.window.Window',
	alias: 'widget.nti-window',

	requires: [
		'NextThought.view.WindowHeader'
	],

	cls: 'nti-window',
	ui: 'nti-window',
	plain: true,
	shadow: false,

	border: true,
	frame: false,
	header: false,

	constrain: true,
	constrainHeader: false,
	liveDrag: true,

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

				frame.first().title = data.title || '';

				data.items = frame;
				data.layout = layout;
			}
			onBeforeClassCreated.call(this, cls, data, hooks);
		};
	},

	constructor: function(config){
		delete config.items;
		delete config.layout;

		var title = config.title;
		delete config.title;

		if(title){
			this.items.first().title = title;
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
			this.syncSize();
			Ext.EventManager.onWindowResize(me.syncSize,me);
			this.on('destroy',function(){ Ext.EventManager.removeResizeListener(me.syncSize,me);});
		}
	},





	syncSize: function(){
		var me = this,
			h = Ext.Element.getViewportHeight() * me.heightPercent,
			w = Ext.Element.getViewportWidth() * me.widthPercent,
			size = me.rendered ? me.getSize() : {width: me.width, height: me.height};

		size.width	= w || size.width;//NaN is falsy
		size.height	= h || size.height;

		this.setSize(size,undefined);
		this.center();
	},


	initDraggable: function() {
		if(!this.dialog){
			try {
				this.dd = new Ext.util.ComponentDragger(this, {
					constrain: true,
					constrainDelegate: true,
					constrainTo: Ext.getBody(),
					el: this.el,
					delegate: '#'+this.down('nti-window-header').getId()
				});
				this.dd.on('beforedragstart',this.onBeforeDragStart,this);
				this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);
			}
			catch(e){
				console.error(Globals.getError(e));
			}
		}
	},


	onBeforeDragStart: function(dd,e){
		var id = e.getTarget('[id]',null,true),
			cmp;
		if(id){
			cmp = Ext.getCmp(id.id);
			if(cmp){
				console.log(cmp.is('button,field'));
				return !cmp.is('button,field');
			}
		}
		return true;
	}

});
