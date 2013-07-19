Ext.define('NextThought.view.content.reader.Scroll',{
	alias: 'reader.scroll',
	requires: ['NextThought.util.Search'],


	constructor: function(config){
		Ext.apply(this,config);
		var me = this;

		function afterReaderRenders(){
			me.scrollingEl = me.reader.getTargetEl();
			me.scrollingEl.on('scroll',me.menuHideOnScroll,me);
		}

		me.reader.on('afterrender',afterReaderRenders,me,{single: true});
	},


	menuHideOnScroll: function(){
		Ext.menu.Manager.hideAll();
		Ext.tip.QuickTipManager.getQuickTip().hide();
	},


	registerHandler: function(fn, scope){
		this.scrollingEl.on('scroll', fn, scope);
	},


	unRegisterHandler: function(fn, scope){
		this.scrollingEl.un('scroll', fn, scope);
	},


	lock: function(){
		this.scrollingEl.scrollTo('top', 0, false);
		this.scrollingEl.setStyle({overflowY:'hidden'});
	},


	unlock: function(){
		this.scrollingEl.setStyle({overflowY:'auto'});
	},


	get: function(){
		return this.scrollingEl.getScroll();
	},


	up: function(){
		this.by(-50);
	},


	down: function(){
		this.by(50);
	},


	by: function(delta){
		var s = this.scrollingEl,
			t = s.getScrollTop();
		s.setScrollTop(t+delta);
	},

    top: function() {
        var s = this.scrollingEl;
        return s.getScrollTop();
    },

	toId: function(id) {
		var n = Ext.getCmp(id),
			m,
			offset = this.reader.getPosition(),
			cPos,
			sTop = this.get().top;


		if(n) {
			cPos = n.getPosition();
			console.log('cmp pos', cPos, 'offset', offset, 'scrollTop', sTop);
			this.to(cPos[1]-offset[1] - 10 + sTop);

			//this.toNode(n.getEl().dom);
			if (n.getMenu) {
				m = n.getMenu();
				if (m && m.items.getCount() === 1) {
					//a single menu item, might as well click it for them
					m.items.first().handler.call(window);
				}
			}
		}
		else {
			console.error('Could not find Component with id: ',id);
		}
	},


	//Scrolls the reader to the first element matching the provided
	//selector.
	toSelector: function(selector){
		var de = this.reader.getDocumentElement(),
			elem = de.querySelector(selector);
		if(elem){
			this.toNode(elem, true, 0);
		}
	},


	toTarget: function(target){
		var de = this.reader.getDocumentElement(),
			c = Ext.getCmp(target),
			e = document.getElementById(target) || de.getElementById(target) || de.getElementsByName(target)[0],
			topMargin = 75;

		if (!e && c) {
			try{
					this.to(c.getScrollPosition(this.scrollingEl.getY() - topMargin));
			}
			catch(excp) {
				console.log("Could not scroll to ",c);
			}
			return;
		}

		if(!e) {
			console.warn('toTarget: no target found: ',target);
		}
		else {
			this.toNode(e, null, null);
		}
	},


	toContainer: function(containerId){
		var de = this.reader.getDocumentElement(),
			e = de.getElementById(containerId) || de.getElementsByName(containerId)[0];

		Ext.each(de.querySelectorAll('[data-ntiid],[ntiid]'), function(o){
			var a = o.getAttribute('data-ntiid')||o.getAttribute('ntiid');
			if(a===containerId){ e = o; }
			return !e;
		});

		if(!e){ return; }
		this.toNode(e,true,0);
	},


	/**
	 * Scroll to some element, but allow options to decide whether or not to scroll.
	 *
	 * @param n - the node you want to scroll to
	 * @param onlyIfNotVisible - pass true here if you want this function to decide if it should scroll or not,
	 *                           based on its visibility on screen
	 * @param bottomThreshold - if you want to scroll if the target is close to the bottom, specify a threshold.
	 */
	toNode: function(n, onlyIfNotVisible, bottomThreshold) {
		while(n && n.nodeType === Node.TEXT_NODE) {
			n = n.parentNode;
		}

		var offsets = this.scrollingEl.getXY(),
			o = Ext.fly(n).getY() - offsets[1],
			st = this.scrollingEl.getScroll().top,
			h = this.scrollingEl.getHeight(),
			b = st + h - (bottomThreshold || 0);

		//logic to halt scrolling if conditions mentioned in function docs are met.
		if (onlyIfNotVisible && o > st && o < b) {
			return;
		}

		this.to(o - 10);
	},


	to: function(top, animate) {
		this.scrollingEl.scrollTo('top', top, animate!==false);
	},

	toSearchHit: function(result, fragment) {
		var me = this, pos;

		me.clearSearchHit();
		if (!result) {
			return;
		}
		//show all the search hits
		me.showSearchHit(result.hit);
		if(fragment){
			console.time('Fragment location');
			pos = me.getFragmentLocation(fragment, result.hit.get('PhraseSearch'));
			console.timeEnd('Fragment location');
		}

		if(pos >= 0){
			try{
				me.to(pos);
			} catch(e){
				console.log("Could not scroll.to(): ", pos, e.message);
			}
		}
	},


	/** @private */
	getFragmentLocation: function(fragment, phrase){
		var fragRegex = SearchUtils.contentRegexForFragment(fragment, phrase, true),
			doc = this.reader.getDocumentElement(),
			ranges = TextRangeFinderUtils.findTextRanges(doc, doc, fragRegex.re, fragRegex.matchingGroups),
			range, pos = -2, nodeTop, scrollOffset, assessmentAdjustment = 0, indexOverlayData,
			olDom = Ext.getDom(this.reader.getComponentOverlay().componentOverlayEl);

		if(Ext.isEmpty(ranges)){
			//We are pretty tightly coupled here for assessment.  Each overlay needs to be
			//asked to find the match
			indexOverlayData = TextRangeFinderUtils.indexText(olDom,
					function(node){ return Ext.fly(node).parent('.indexed-content'); });

			ranges = TextRangeFinderUtils.findTextRanges( olDom, olDom.ownerDocument,
					fragRegex.re, fragRegex.matchingGroups, indexOverlayData);
			assessmentAdjustment = 150;
		}

		if(Ext.isEmpty(ranges)){
			console.warn('Could not find location of fragment', fragment);
			return -1;
		}

		if(ranges.length > 1){
			console.warn('Found multiple hits for fragment.  Using first', fragment, ranges);
		}
		range = ranges[0];

		if(range && range.getClientRects().length > 0){
			nodeTop = range.getClientRects()[0].top;
			//Assessment items aren't in the iframe so they don't take into account scroll
			scrollOffset = this.get().top;
			scrollOffset = ( assessmentAdjustment > 0 ? scrollOffset : 0);
			pos = nodeTop - assessmentAdjustment + scrollOffset;
		}

		return pos;
	}
});
