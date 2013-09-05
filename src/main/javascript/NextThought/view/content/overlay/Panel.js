Ext.define('NextThought.view.content.overlay.Panel',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.overlayed-panel',

	requires: ['NextThought.util.Anchors'],

	placementHolderTpl: Ext.DomHelper.createTemplate({type:'application/vnd.nextthought.placeholder'}),

	inheritableStatics: {
		relayout: Ext.Function.createBuffered(function(){
			Ext.each(Ext.ComponentQuery.query('overlayed-panel'),function(p){p.updateLayout();}); },10),

		syncPositioning : Ext.Function.createBuffered(function(){
			Ext.each(Ext.ComponentQuery.query('overlayed-panel'),function(p){ p.syncTop(); }); },10)
	},

	representsUserDataContainer: false,
	appendPlaceholder: false,
	plain: true,
	autoRender: true,
	ui: 'overlayed',


	constructor: function(){
		this.callParent(arguments);
		this.setupContentElement();
	},


	getRefOwner: function(){
		return this.reader;
	},


	initComponent: function(){
		var d, el, insert = 'insertBefore', ix = 0;
		if(!this.contentElement){
			this.insertedElement = true;
			d = this.reader.getDocumentElement().getElementsByTagName('object');
			//TODO: ensure its a 'type=application/vnd.nextthought.*'
			if(this.appendPlaceholder){
				insert = 'insertAfter';
				ix = d.length - 1;
			}

			el = d[ix];
			this.contentElement = this.placementHolderTpl[insert](el);
		}

		if(this.representsUserDataContainer){
			Ext.fly(this.contentElement).set({ 'data-nti-container':true });
		}

		this.callParent(arguments);
	},


	destroy: function(){
		if(this.insertedElement){
			Ext.fly(this.contentElement).remove();
		}
		clearInterval(this.interval);
		this.callParent(arguments);
	},

	afterRender: function(){
		var me = this, lastY = 0, sameCount = 0;
		me.callParent(arguments);
		this.interval = setInterval(function(){
			var y;
			me.syncTop();

			if(!me.el || !me.el.dom){ sameCount = NaN; }
			else {
				y = me.el.getY();
				if(Math.abs(y-lastY)<2){ sameCount ++; }
				else { sameCount = 0; }
				lastY = y;
			}

			if(isNaN(sameCount) || sameCount> 5 ){
				clearInterval(me.interval);
			}
		},200);
	},


	hide: function(){
		Ext.fly(this.contentElement).setStyle({display:'none'});
		this.callParent(arguments);
	},


	show: function(){
		Ext.fly(this.contentElement).setStyle({display:'block'});
		this.callParent(arguments);
	},


	removeContent: function(selector){
		var el = Ext.get(this.contentElement);
//		el.select(selector).remove();//Maybe set style display:none?
		el.select(selector).setStyle({display: 'none'});
	},


	setupContentElement: function(){
		Ext.fly(this.contentElement).setStyle({
			overflow: 'hidden',
			display: 'block',
			margin: '30px auto',
			opacity: 0,
			'white-space': 'nowrap'
		}).addCls('overlayed');

		this.removeContent('.hidden,INPUT,object,param');
	},


	syncTop: function(){
		if(!this.contentElement){return;}
		try {
			var o = this.reader.getAnnotationOffsets(),
				myTop = Ext.fly(this.contentElement).getY(),
				ctTop = this.el.up('.x-reader-pane').getY(),
				top = (myTop + ctTop) - o.scrollTop;
			this.el.setY(top);
		}
		catch(e){
			console.debug(e.message);
			clearInterval(this.interval);
		}
	},


	afterLayout: function(){
		this.syncElementHeight();
		this.callParent(arguments);
	},


	syncElementHeight: function(){
		var h = this.getHeight();
		try {
		Ext.fly(this.contentElement).setHeight(h);
		}
		catch(e){
			console.log('no contentElement');
		}
		this.self.syncPositioning();
	}
});
