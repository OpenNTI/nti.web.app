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
			{ cls: 'slide-nav backward', cn:[{cls: 'slide backward'}], title: 'Slide left' },
			{ cls: 'slide-nav forward', cn:[{cls: 'slide forward'}], title: 'Slide right'}
		]),

	navTpl: Ext.DomHelper.createTemplate({
		cls: 'nav-helper',
		cn: [
			{cls: 'nav circle backward'},
			{cls: 'nav circle forward'}
		]
	}),

	renderSelectors: {
		slideLeft: '.slide-nav.backward .slide',
		slideRight: '.slide-nav.forward .slide'
//		navNext: '.slide-nav.forward .circle',
//		navPrev: '.slide-nav.backward .circle'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.navContainer = this.navTpl.append(Ext.getBody(),[],true);
		this.navNext = this.navContainer.down('.forward.circle');
		this.navPrev = this.navContainer.down('.backward.circle');
		this.on('move',this.syncIt,this);
	},


	syncIt: function(){
		var s = this.getEl() ? this.getSize() : null,
			o = this.navContainer;
        if (!s) {
            Ext.defer(this.syncIt, 100, this);
            return;
        }
		o.setXY(this.el.getXY());
		o.setWidth(s.width);
		o.setHeight(s.height);
	},


	load: function(filter, filterName){
		var me = this, m =[];

		filter = Ext.isFunction(filter)? filter : null;

		me.removeAll(true);
		this.store.each(function(item){
			if(item instanceof NextThought.model.Note && (!filter || filter(item))){
				m.push({record: item, autoRender:Boolean(me.rendered)});
			}
		});

		if(filterName === "mostPopular"){
			m = Ext.Array.sort(m, function(a,b){
				return b.record.getReplyCount() - a.record.getReplyCount();
			});
		}
		else if(filterName === "highestRated"){
			m = Ext.Array.sort(m, function(a,b){
				return b.record.get('LikeCount') - a.record.get('LikeCount');
			});
		}
		me.add(m);
	},


	filterChanged: function(filter,value){
		var el = this.el;
		el.mask('');
		Ext.defer(function(){
			var f = this[filter], rec = this.record;
			this.load(f?f(value):null, filter);

			if(filter && filter!==''){
				if(this.items.length <=0){
					this.updateWith(null);

					if(!this.notfoundEl || this.body.query('.no-search-found').length <= 0){
						this.notfoundEl = Ext.DomHelper.append(this.body, { xtype:'box', cls:"no-search-found", html:"No match found"}, true);
					}
				}
				else {
					this.setRecord(this.items.first().record);
				}
			}
			else if(this.items.findBy(function(o){return o.record === rec;},null)>=1){
				this.setRecord(rec);
			}
			else {
				this.updateWith(null);
			}
			el.unmask();
		},1,this);
	},


	destroy: function(){
		this.navContainer.remove();
		if(this.keyMap){this.keyMap.destroy(false);}
		return this.callParent(arguments);
	},


	setRecord: function(rec, sender){
		var me = this,
			myWindow = me.up('window');

		if(myWindow && myWindow.editorActive()){
			return;
		}


        if (!this.store){
            this.store = LocationProvider.getStore(rec.get('ContainerId'));
            this.mon(this.store,'datachanged',this.load,this);
            this.prefetchNext();
            this.load();
        }

		me.record = rec;

		me.items.each(function(o){
			var s = o.record.get('NTIID')===rec.get('NTIID');
			o.markSelected(s);
			if(s){
				if(me.rendered){
					setTimeout(function(){ me.updateWith(o, sender); },10);
				}
				else { me.selected = o; }
			}
		},this);
	},


	prefetchNext: function(){
		var s = this.store, max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount());
		if(s.currentPage < max){
			s.nextPage();
		}
	},


	afterRender: function(){
		var me = this,
			o = me.selected||null;
		me.callParent(arguments);

		setTimeout(function(){
			me.updateWith(o);
			me.syncIt();
		},10);
		delete me.selected;

		this.mon(this.navNext,'click',this.selectNext,this);
		this.mon(this.navPrev,'click',this.selectPrev,this);
		this.mon(this.slideLeft,'click',this.slideViewLeft,this);
		this.mon(this.slideRight,'click',this.slideViewRight,this);

		function updateOnEditorChange(w){
			var item = me.down('note-carousel-item[selected]');
			if(item){
			    me.updateBigArrows(item);
			}
		}

		this.mon(this.up('window'),{
			scope: this,
			'editorActivated': updateOnEditorChange,
			'editorDeactivated': updateOnEditorChange,
			'activate': function(){
				if(me.keyMap){me.keyMap.enable();}
				me.navContainer.show();
			},
			'deactivate': function(){
				if(me.keyMap){me.keyMap.disable();}
				me.navContainer.hide();
			}
		});

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

	maybeShowToolTip: function(el, show, tip){
		if(!show){
			el.dom.removeAttribute('title');
		}
		else{
			el.dom.setAttribute('title', tip);
		}
	},

	updateBigArrows: function(item){
		var hasNext, hasPrev,
			me = this,
			editorActive = this.up('window').editorActive();

		hasNext = item && item.next() && !editorActive;
		hasPrev = item && item.prev() && !editorActive;
		me.maybeShowToolTip(this.navNext, hasNext, 'Next note');
		me.maybeShowToolTip(this.navPrev, hasPrev, 'Previous note');
		me.disableArrow(this.navNext,hasNext);
		me.disableArrow(this.navPrev,hasPrev);

	},

	updateWith: function(item, sender){
		var bgx,
		me = this;

		if(this.notfoundEl){ this.notfoundEl.remove(); }
		if(item && !item.rendered){
			setTimeout(function(){ me.updateWith(item, sender); },10);
			return;
		}

		if( item ){
			item.getEl().scrollIntoView(this.body,true);
		}

		this.centerBackgroundOn(item);

		this.updateBigArrows(item);

		this.updateSlide();
        if (item && sender && sender.isCarouselItem){
		    this.up('window').down('note-main-view').setRecord(item.record);
        }

		bgx = parseInt(this.getEl().getStyle('background-position').match(/-?[0-9]+/g)[0],0);
		//The "difference" is a sum because the pointer coordinate is
		//actually the background's negative offset coordinate
		this.pointerCoordDifference = bgx + this.body.dom.scrollLeft;
	},

	updateSlide: function(pos) {
		var dom = this.body.dom,
			count = this.items.getCount(),
			canSlideLeft, canSlideRight, value, min, newBgx;//, shift;

		if (!pos && pos !== 0) { pos = dom.scrollLeft; }

		canSlideLeft = count > 11 && pos > 0;
		canSlideRight = count > 11 && pos < dom.scrollWidth - dom.clientWidth;

		this.maybeShowToolTip(this.slideLeft, canSlideLeft, 'Slide left');
		this.maybeShowToolTip(this.slideRight, canSlideRight, 'Slide right');
		this.disableArrow(this.slideLeft,canSlideLeft);
		this.disableArrow(this.slideRight,canSlideRight);

		if (pos === dom.scrollLeft) { return; }

		value = Ext.Number.constrain(pos,0,dom.scrollWidth - dom.clientWidth);
		min = this.getEl().dom.getBoundingClientRect().width - this.BACKGROUND_WIDTH;

		newBgx = Ext.Number.constrain(this.pointerCoordDifference - value,min,0);

		this.prefetchNext();
		this.body.animate({ to: {scrollLeft: value} });
		if (Ext.isGecko) {
			this.getEl().setStyle('background-position','0 0');
		}
		else {
			this.getEl().animate({to:{backgroundPositionX: newBgx+'px'}});
		}
	},

	slideViewLeft: function(){
		var b = this.body;
		this.updateSlide(-(b.getWidth()/2) + b.dom.scrollLeft);
	},


	slideViewRight: function(){
		var b = this.body;
		this.updateSlide((b.getWidth()/2) + b.dom.scrollLeft);
	},


	centerBackgroundOn: function(item){
		var ir = item ? item.getEl().dom.getBoundingClientRect() : {left:0,width:0},

			cr = this.getEl().dom.getBoundingClientRect(),
			cm = Math.round(cr.left + (cr.width/2)),
			im = Math.round(ir.left + (ir.width/2)),

			start = (cr.width - this.BACKGROUND_WIDTH)/ 2,
			offset = im - cm,

			pos = item ? start+offset : 0;

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
		return true;
	},


	selectPrev: function(e){
		this.moveSelection(this.PREV,this.navPrev);
		if(e && e.stopEvent){
			e.stopEvent();
			return false;
		}
		return true;
	},


	moveSelection: function(dir,el){
		//nice shortcut to reduce calculations if its ultimatly not going to fire because we've disabled it.
		if(el && el.hasCls('disabled')){return;}

		var newSel,
			sel = this.down('note-carousel-item[selected]'),
			fn = !sel
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


	mostPopular: function(){
		return function(item){
			return item && item.getReplyCount() > 0;
		};
	},


	highestRated: function(){
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
