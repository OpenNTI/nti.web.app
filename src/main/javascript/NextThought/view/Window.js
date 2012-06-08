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


	constructor: function(config){
		var p = this.self.prototype;
		var items = config.items || p.items,
			title = config.title || p.title,
			layout = config.layout || p.layout;

		//delete what we will be moving somewhere else
		delete config.items;
		delete config.title;
		delete config.layout;

		Ext.apply(this,{
			items: [
				{xtype:'nti-window-header', title: title},
				{xtype:'container', layout: layout, items: items, flex: 1}
			],
			layout: {
				type: 'vbox',
				align: 'stretch'
			}
		});

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
		this.dd = new Ext.util.ComponentDragger(this, {
			constrain: true,
			constrainDelegate: true,
			constrainTo: Ext.getBody(),
			el: this.el,
			delegate: '#'+this.down('nti-window-header').getId()
		});
		this.dd.on('beforedragstart',this.onBeforeDragStart,this);
		this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);
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
