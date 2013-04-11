/**
 * This layout is essentially a card layout based on the auto layout instead of the fit layout.
 * It also will enforce that the last item is always active.
 */
Ext.define('NextThought.layout.container.Stack',{
	extend: 'Ext.layout.container.Container',
	alias: 'layout.stack',
	type: 'stack',

	requires: [
		'Ext.layout.container.Card'
	],

    hideInactive: true,
    deferredRender : true,


	calculate: function(){ this.done = true; },//no-op


	enforceStackActiveItem: function(){
		if(this.suspendStackActiveEvents === true){ return; }

		var last = this.getLayoutItems().last();
		if( last ){
			this.setActiveItem(last);
		}
	},


	initLayout: function(){
		this.callParent(arguments);
		this.enforceStackActiveItem();
	},


	onAdd: function(){
		this.callParent(arguments);
		this.enforceStackActiveItem();
	},


	onRemove: function(){
		this.card.onRemove.apply(this,arguments);
		this.enforceStackActiveItem();
	},


	setOwner: function(owner){
		this.callParent(arguments);
		if(!owner.popView){
			owner.popView = function(){
				var l = this.items.last();
				if( l ){
					l.destroy();
				}
			};
		}

		if(!owner.pushView){
			owner.pushView = owner.add;
		}

		if(!owner.peek){
			owner.peek = function(){
				if(this.items.getCount() < 1){ return undefined; }
				return this.items.getAt(this.items.getCount() - 1);
			};
		}
	},


	setActiveItem: function(item){
		if(!item){
			console.warn('You did something wrong. This should never be fasley');
			return false;
		}

		if(this.parseActiveItem(item) !== this.getLayoutItems().last()){
			return false;
		}
		return this.card.setActiveItem.apply(this,arguments);
	}


}, function(){
	var me = this,
		card = Ext.layout.container.Card.prototype;

	var functions = [
		'getRenderTree',
		'renderChildren',
		'isValidParent',
		'getActiveItem',
		'parseActiveItem',
		'configureItem',
		'onRemove',
		'getAnimation',
		'getNext',
		'next',
		'getPrev',
		'prev',
		'setActiveItem'
	];

	me.prototype.card = card;
	Ext.each(functions,function(fn){
		me.prototype[fn] = function(){
			return card[fn].apply(this,arguments);
		};
	});
});
