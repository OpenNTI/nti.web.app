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
				try{
					console.log(o.getEl().dom.getBoundingClientRect());
				}catch(e){}
			}
		});
	}
});
