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

	PREV: {},//treat as const/final/read-only - the value is not important. We are creating a label that we can identify using the identity comparison operator (===). Think of this as an enum.
	NEXT: {},//treat as const/final/read-only - the value is not important. We are creating a label that we can identify using the identity comparison operator (===). Think of this as an enum.

	renderTpl: Ext.DomHelper.markup([
			{
				id: '{id}-body',
				cls: 'carousel-body',
				cn:'{%this.renderContainer(out,values)%}'
			},
			{ cls: 'slide-nav backward disabled', cn:[{cls: 'circle'}] },
			{ cls: 'slide-nav forward disabled', cn:[{cls: 'circle'}] }
		]),

	renderSelectors: {
		navNext: '.slide-nav.forward',
		navPrev: '.slide-nav.backward'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = LocationProvider.getStore();

		this.load();
	},


	load: function(filter){
		var me = this;
		me.removeAll(true);
		this.store.each(function(item){
			if(item instanceof NextThought.model.Note && !item.parent && (!filter || filter(item))){
				me.add({record: item, autoRender:Boolean(me.rendered)});
			}
		});
	},


	filterChanged: function(filter,value){
		var f = this[filter];
		this.load(f?f(value):null);
		f = this.items.first();
		if(f){
			this.setRecord(f.record);
		}
		else { this.updateWith(null); }
	},


	destroy: function(){
		if(this.keyMap){this.keyMap.destroy();}
		return this.callParent(arguments);
	},


	setRecord: function(rec){
		var me = this;
		this.items.each(function(o){
			var s = o.record===rec;
			o.markSelected(s);
			if(s){
				if(me.rendered){
					setTimeout(function(){ me.updateWith(o); },10);
				}
				else { me.selected = o; }
			}
		});
	},


	afterRender: function(){
		var me = this, o = me.selected;
		me.callParent(arguments);
		if( o ){
			setTimeout(function(){ me.updateWith(o); },10);
			delete me.selected;
		}

		this.mon(this.navNext,'click',this.selectNext,this);
		this.mon(this.navPrev,'click',this.selectPrev,this);

		this.keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.RIGHT,
				fn: this.selectNext,
				scope: this
			},{
				key: Ext.EventObject.LEFT,
				fn: this.selectPrev,
				scope: this
			}]
		});
	},


	updateWith: function(item){
		var hasNext, hasPrev,
			me = this;
		function t(el,s){ el[(s?'remove':'add')+'Cls']('disabled'); }

		if(item && !item.rendered){
			setTimeout(function(){ me.updateWith(item); },10);
			return;
		}

		if( item ){
			item.getEl().scrollIntoView(this.body,true);
		}

		this.centerBackgroundOn(item);

		hasNext = item && item.next();
		hasPrev = item && item.prev();

		t(this.navNext,hasNext);
		t(this.navPrev,hasPrev);

		this.up('window').down('note-main-view').setRecord(item?item.record:null);
	},


	centerBackgroundOn: function(item){
		var ir = item ? item.getEl().dom.getBoundingClientRect() : {left:0,width:0};

		var cr = this.getEl().dom.getBoundingClientRect();
		var cm = Math.round(cr.left + (cr.width/2));
		var im = Math.round(ir.left + (ir.width/2));

		var bgW = 1400;//the background image is 1400px wide

		var start = (cr.width - bgW)/2;
		var offset = im - cm;

		var pos = item ? start+offset : 0;

		this.getEl().setStyle({
			backgroundPositionX: pos+'px'
		});
	},


	selectNext: function(){
		this.moveSelection(this.NEXT,this.navNext);
	},


	selectPrev: function(){
		this.moveSelection(this.PREV,this.navPrev);
	},


	moveSelection: function(dir,el){
		//nice shortcut to reduce calculations if its ultimatly not going to fire because we've disabled it.
		if(el && el.hasCls('disabled')){return;}

		var newSel;
		var sel = this.down('note-carousel-item[selected]');
		var fn = !sel
				? null
				: dir === this.NEXT
					? sel.next
					: dir === this.PREV
						? sel.prev
						: null;

		if(!fn || !sel){ return; }

		newSel = fn.call(sel);
		if(newSel && newSel.record){
			this.setRecord(newSel.record);
		}
	},


	mostPopular: function(value){
		return function(item){
			return item && item.getReplyCount() > 0;
		};
	},


	highestRated: function(value){
		return function(item){
			return item && item.get('LikeCount') > 0;
		};
	},


	search: function(value){
		return function(item){
			return item && item.hasTerm(value);
		};
	}

});
