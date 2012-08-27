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
			{ cls: 'slide-nav backward', cn:[{cls: 'circle'},{cls: 'slide backward'}] },
			{ cls: 'slide-nav forward', cn:[{cls: 'circle'},{cls: 'slide forward'}] }
		]),

	renderSelectors: {
		slideLeft: '.slide-nav.backward .slide',
		slideRight: '.slide-nav.forward .slide',
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

	disableArrow: function(el,s){
		el[(s?'remove':'add')+'Cls']('disabled');
	},

	updateWith: function(item){
		var hasNext, hasPrev,
			me = this;

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

		me.disableArrow(this.navNext,hasNext);
		me.disableArrow(this.navPrev,hasPrev);
		this.updateSlide();
		this.up('window').down('note-main-view').setRecord(item?item.record:null);

		var bgx = parseInt(this.getEl().getStyle('background-position').match(/-?[0-9]+/g)[0],0);
		//The "difference" is a sum because the pointer coordinate is
		//actually the background's negative offset coordinate
		this.pointerCoordDifference = bgx + dom.scrollLeft;

		//setTimeout(function() {
		me.up('note-window').syncSize();
		//	}, 30);

	},

	updateSlide: function(pos) {
		var dom = this.body.dom,
			count = this.items.getCount();

		if (!pos && pos !== 0) { pos = dom.scrollLeft; }

		var canSlideLeft = count > 11 && pos > 0,
			canSlideRight = count > 11 && pos < dom.scrollWidth - dom.clientWidth;

		this.disableArrow(this.slideLeft,canSlideLeft);
		this.disableArrow(this.slideRight,canSlideRight);

		if (pos === dom.scrollLeft) { return; }

		var value = Ext.Number.constrain(pos,0,dom.scrollWidth - dom.clientWidth),
			shift = value - dom.scrollLeft,
			min = this.getEl().dom.getBoundingClientRect().width - this.BACKGROUND_WIDTH;

		var newBgx = Ext.Number.constrain(this.pointerCoordDifference - value,min,0);
		
		this.body.animate({ to: {scrollLeft: value} });
		if (Ext.isGecko) { 
			this.getEl().setStyle('background-position','0 0');
		}
		else {
			this.getEl().animate({to:{backgroundPositionX: newBgx+'px'}});
		}
	},

	slideViewLeft: function(){
		var b = this.body, me = this;
		this.updateSlide(-(b.getWidth()/2) + b.dom.scrollLeft);
	},


	slideViewRight: function(){
		var b = this.body, me = this;
		this.updateSlide((b.getWidth()/2) + b.dom.scrollLeft);
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
			backgroundPosition: pos+'px 0'
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
