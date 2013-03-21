/**
 * This layout is essentially a card layout based on the auto layout instead of the fit layout.
 * It also will enforce that the last item is always active.
 */
Ext.define('NextThought.layout.container.Stack',{
	extend: 'Ext.layout.container.Auto',
	alias: 'layout.stack',
	type: 'stack',

	requires: [
		'Ext.layout.container.Card'
	],

    hideInactive: true,
    deferredRender : true,

	initLayout: function(){
		this.callParent(arguments);
		this.setActiveItem(this.getLayoutItems().last());
	},


	onAdd: function(){
		this.callParent(arguments);
		this.setActiveItem(this.getLayoutItems().last());
	},


	onRemove: function(){
		this.card.onRemove.apply(this,arguments);
		this.setActiveItem(this.getLayoutItems().last());
	},


	setOwner: function(owner){
		this.callParent(arguments);

		if(!owner.popView){
			owner.popView = function(){
				var l = this.items.last();
				if( l && this.items.getCount() > 1 ){
					l.destroy();
				}
			};
		}
	},


	setActiveItem: function(item){
		if(this.parseActiveItem(item) !== this.getLayoutItems().last()){
			return false;
		}
		return this.card.setActiveItem.apply(this,arguments);
	}


}, function(){
	var me = this,
		card = Ext.layout.container.Card.prototype;

	var functions = [
		'configureItem',
	    'isValidParent',
	    'getActiveItem',
		'getAnimation',
	    'getNext',
	    'getPrev',
		'getRenderTree',
		'next',
		'parseActiveItem',
		'prev',
	    'renderChildren'];

	me.prototype.card = card;
	Ext.each(functions,function(fn){
		me.prototype[fn] = function(){
			return card[fn].apply(this,arguments);
		};
	});
});
