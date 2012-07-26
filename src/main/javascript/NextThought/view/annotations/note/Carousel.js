Ext.define('NextThought.view.annotations.note.Carousel',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-carousel',
	requires: [
		'NextThought.view.annotations.note.CarouselItem'
	],

	cls: 'carousel',
	height: 68,
	layout: 'auto',
	defaultType: 'note-carousel-item',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderTpl: Ext.DomHelper.markup([
			{
				id: '{id}-body',
				cls: 'carousel-body',
				cn:'{%this.renderContainer(out,values)%}'
			},
			{ cls: 'slide-nav backward disabled', cn:[{cls: 'circle'}] },
			{ cls: 'slide-nav forward disabled', cn:[{cls: 'circle'}] }
		]),

	initComponent: function(){
		this.callParent(arguments);
		this.store = LocationProvider.getStore();

		var me = this;
		this.store.each(function(item){
			if(item instanceof NextThought.model.Note && !item.parent){
				me.add({record: item});
			}
		});
	},

	setRecord: function(rec){
		var me = this;
		this.items.each(function(o){
			var s = o.record===rec;
			o.markSelected(s);
			if(s){
				if(me.rendered){ setTimeout(function(){ me.centerBackgroundOn(o); },10); }
				else { me.selected = o; }
			}
		});
	},


	afterRender: function(){
		var me = this, o = me.selected;
		me.callParent(arguments);
		if( o ){
			setTimeout(function(){ me.centerBackgroundOn(o); },10);
			delete me.selected;
		}
	},


	centerBackgroundOn: function(item){
		var cr = this.getEl().dom.getBoundingClientRect();
		var ir = item.getEl().dom.getBoundingClientRect();
		var cm = Math.round(cr.left + (cr.width/2));
		var im = Math.round(ir.left + (ir.width/2));
		var bgW = 1400;//the background image is 1400px wide

		var start = (cr.width - bgW)/2;

		var offset = im - cm;

		this.getEl().setStyle({
			backgroundPositionX: (start+offset)+'px'
		});
	}

});
