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

	BACKGROUND_WIDTH: 1400,

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
		slideLeft: '.slide-nav.backward',
		slideRight: '.slide-nav.forward',
		navNext: '.slide-nav.forward .circle',
		navPrev: '.slide-nav.backward .circle'
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
		this.mon(this.slideLeft,'click',this.slideViewLeft,this);
		this.mon(this.slideRight,'click',this.slideViewRight,this);

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


	slide: function(dir){
		var b = this.body,
			dom = b.dom,
			w = dir*(b.getWidth()/2),
			pValue = dom.scrollLeft,
			pPos = parseInt(this.getEl().getStyle('background-position-x'),0),
			value = Math.max( 0,
						Math.min(
							dom.scrollLeft + w,
							dom.scrollWidth - dom.clientWidth));

		var v = pPos + (pValue-value);
		var min = this.getEl().dom.getBoundingClientRect().width - this.BACKGROUND_WIDTH;

		v = Ext.Number.constrain(v,min,0);

		b.animate({ to: {scrollLeft: value} });
		this.getEl().animate({to:{backgroundPositionX: v+'px'}});
	},


	slideViewLeft: function(){
		this.slide(-1);
	},


	slideViewRight: function(){
		this.slide(1);
	},


	centerBackgroundOn: function(item){
		var ir = item ? item.getEl().dom.getBoundingClientRect() : {left:0,width:0};

		var cr = this.getEl().dom.getBoundingClientRect();
		var cm = Math.round(cr.left + (cr.width/2));
		var im = Math.round(ir.left + (ir.width/2));

		var start = (cr.width - this.BACKGROUND_WIDTH)/2;
		var offset = im - cm;

		var pos = item ? start+offset : 0;

		this.getEl().setStyle({
			backgroundPositionX: pos+'px'
		});
	},


	selectNext: function(e){
		this.moveSelection(this.NEXT,this.navNext);
		if(e && e.stopEvent){
			e.stopEvent();
			return false;
		}
	},


	selectPrev: function(e){
		this.moveSelection(this.PREV,this.navPrev);
		if(e && e.stopEvent){
			e.stopEvent();
			return false;
		}
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
