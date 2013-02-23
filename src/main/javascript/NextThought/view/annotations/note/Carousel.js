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
			{ cls: 'slide-nav backward', cn:[{cls: 'slide backward'}], 'data-qtip': 'Slide left' },
			{ cls: 'slide-nav forward', cn:[{cls: 'slide forward'}], 'data-qtip': 'Slide right'}
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
		var me = this;
		me.callParent(arguments);
		me.navContainer = me.navTpl.append(Ext.getBody(),[],true);
		me.navNext = me.navContainer.down('.forward.circle');
		me.navPrev = me.navContainer.down('.backward.circle');

		Ext.EventManager.onWindowResize(me.syncIt,me,{buffer: 200});
		me.on('destroy',function(){ Ext.EventManager.removeResizeListener(me.syncSize,me);});
	},

	afterRender: function(){
		var me = this,
			o = me.selected||null;
		me.callParent(arguments);

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

		//Ok we know we are going to render now
		if (!this.store){
            this.store = LocationProvider.getStore(this.containerId);
			 //Listen to add so we don't have to redraw everything when anything is added to the store.
            this.mon(this.store,'datachanged',this.updateCarouselFromStore,this);
	        this.mon(this.store,'remove',this.removedItem,this);
        }

		//Ok a bad store, we are opening the note window outside the context of
		//a page that exists.  In this case its exceptable for the carousel to be blank(?) or
		//maybe we create one carousel item that represents our current note
		if(this.store.bad){
			console.warn('No store for ', this.containerId, ' non existent content?');
			Ext.defer(function(){
				me.showAsSelected(null);
				me.syncIt();
			}, 100);
		}
		//If our store has data we assume it loaded and we dont load it
		//we just draw from it, otherwise we load the next page of data
		if(this.store.getCount() === 0){
			Ext.defer(function(){
				me.syncIt();
				me.updateCarouselFromStore();
			}, 100);
		}
		else{
			this.prefetchNext();
		}
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


	updateCarouselFromStore: function(){
		var me = this, m =[],
			filter = (me.filter||{}).filter,
			filterName = (me.filter||{}).filterName,
			sortFn, selectedRecordId = me.record.getId();

		sortFn = function(a, b){
			return b.record.get('Last Modified') - a.record.get('Last Modified');
		};

		filter = Ext.isFunction(filter)? filter : null;

		me.removeAll(true);
		Ext.each(this.store.getItems(),function(item){
			var selected, cmp;
			if(item instanceof NextThought.model.Note && (!filter || filter(item))){
				selected = item.getId() === selectedRecordId;
				cmp = {record: item, autoRender: Boolean(me.rendered), selected: selected};
				m.push(cmp);
			}
		});

		if(filterName === "mostPopular"){
			sortFn = function(a,b){
				return b.record.getReplyCount() - a.record.getReplyCount();
			};
		}
		else if(filterName === "highestRated"){
			sortFn = function(a,b){
				return b.record.getTotalLikeCount() - a.record.getTotalLikeCount();
			};
		}

		m = Ext.Array.sort(m, sortFn);

		me.add(m);

		//We added no carousel items here so we make sure and update what is selected
		me.showAsSelected(this.down('[selected=true]'));
	},


	removedItem: function(store, record, idx){
		if(record && record.isTopLevel && !record.isTopLevel()){
			return;
		}

		var selectedRecordId = this.record ? this.record.getId() : null,
			c = this.query('note-carousel-item').length-1;

		if(selectedRecordId === record.getId() && !isMe(record.get('Creator'))){
			this.showAsSelected(null);
			this.up('window').down('note-main-view').disable();
			console.warn('The active note was removed but was not yours. We will leave the selection alone');
			return;
		}

		if(c === 0){
			this.up('window').close();
			return;
		}

		idx = Math.max(idx-1,0);
		this.setRecord(store.getAt(idx));
	},


	filterChanged: function(filterName,value){
		var el = this.el,
			f = this[filterName];
		el.mask('');

		delete this.filter;
		if(filterName){
			this.filter = {filter: f ? f(value) : null, filterName: filterName };
		}

		Ext.defer(function(){
			var rec = this.record, selected;
			this.updateCarouselFromStore();
			el.unmask();
			selected = this.items.findBy(function(o){return o.record.getId() === rec.getId();},null);
			if(filterName && filterName!==''){
				if(this.items.length <=0){
					this.showAsSelected(null);
					this.add( { xtype:'box', cls:"no-search-found", html:"No match found"});
					return;
				}
			}
			this.showAsSelected(selected);
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

		//Don't let the user click the same item again
		if(sender && this.down('[selected=true]') === sender){
			return;
		}

		//Let main veto us so we can do things like not update
		//if there is a reply open
		if(!myWindow.canSelectRecord()){
			return;
		}

		me.record = rec;

		if(!me.containerId){
			me.containerId = me.record.get('ContainerId');
		}

		myWindow.recordSelected(rec);

		me.showAsSelected(rec);
	},


	prefetchNext: function(){
		var s = this.store, max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount());
		if(s.currentPage < max){
			s.nextPage();
			return true;
		}
		return false;
	},

	disableArrow: function(el,s){
		el[(s?'remove':'add')+'Cls']('disabled');
	},


	maybeShowToolTip: function(el, show, tip){
		if(!show){
			el.dom.removeAttribute('data-qtip');
		}
		else{
			el.dom.setAttribute('data-qtip', tip);
		}
	},


	updateBigArrows: function(item){
		var hasNext, hasPrev,
			me = this,
			editorActive = this.up('window').down('note-main-view').editorActive();

		hasNext = item && item.next() && !editorActive;
		hasPrev = item && item.prev() && !editorActive;
		me.maybeShowToolTip(this.navNext, hasNext, 'Next note');
		me.maybeShowToolTip(this.navPrev, hasPrev, 'Previous note');
		me.disableArrow(this.navNext,hasNext);
		me.disableArrow(this.navPrev,hasPrev);

	},


	showAsSelected: function(recordOrItem){
		var rec = recordOrItem ? (recordOrItem.hasOwnProperty('selected') ? null : recordOrItem) : null,
			item = rec ? null : recordOrItem, me = this;

		console.log('update with called with ', rec);

		if(!this.rendered){
			console.log('Short circuiting showRecordAsSelected because I\'m not rendered');
			return;
		}

		if(!item && rec){
			Ext.Array.each(this.items.items, function(i){
				if(i.record && i.record.getId() === rec.getId()){
					item = i;
					return false;
				}
			});
		}

		if( item && !item.rendered ){
			console.log('Item is not rendered, not defering as selected');
			this.mon(item, 'afterrender', Ext.Function.bind(this.showAsSelected, this, [item.record], {single: true}));
			return;
		}

		Ext.suspendLayouts();
		this.items.each(function(o){
			var s = o === item;
			o.markSelected(s);
		},this);
		Ext.resumeLayouts();

		if( item ){
			item.getEl().scrollIntoView(this.body,true);
		}

		//Find the item for this record

		this.centerBackgroundOn(item);
		this.updateBigArrows(item);
		this.updateSlide();

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

		this.body.animate({ to: {scrollLeft: value} });
		this.prefetchNext();
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
		this.syncIt();
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
			this.setRecord(newSel.record, newSel);
		}
	},


	mostPopular: function(){
		return function(item){
			return item && item.getReplyCount() > 0;
		};
	},


	highestRated: function(){
		return function(item){
			return item && item.getTotalLikeCount() > 0;
		};
	},


	search: function(value){
		return function(item){
			return item && item.hasTerm(value);
		};
	}

});
