Ext.define('NextThought.view.content.reader.Scroll',{

	requires: ['NextThought.util.Search'],

	constructor: function(){
		this.on('afterrender',function(){

			this.body.on('scroll',function(){
				Ext.menu.Manager.hideAll();
				Ext.tip.QuickTipManager.getQuickTip().hide();
			},this);

		},this);
	},


	registerScrollHandler: function(fn, scope){
		this.mon(this.body,'scroll', fn, scope);
	},


	unRegisterScrollHandler: function(fn, scope){
		this.mun(this.body,'scroll', fn, scope);
	},


	scrollToId: function(id) {
		var n = Ext.getCmp(id),
			m,
			offset = this.getPosition(),
			cPos,
			sTop = this.body.getScroll().top;


		if(n) {
			cPos = n.getPosition();
			console.log('cmp pos', cPos, 'offset', offset, 'scrollTop', sTop);
			this.scrollTo(cPos[1]-offset[1] - 10 + sTop);

			//this.scrollToNode(n.getEl().dom);
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


	scrollToTarget: function(target){
		var de = this.getDocumentElement(),
			c = Ext.getCmp(target),
			e = document.getElementById(target) || de.getElementById(target) || de.getElementsByName(target)[0],
			topMargin = 75;

		if (!e && c) {
			try{
					this.scrollTo(c.getScrollPosition(this.body.getTop() - topMargin));
			}
			catch(excp) {
				console.log("Could not scroll to ",c);
			}
			return;
		}

		if(!e) {
			console.warn('scrollToTarget: no target found: ',target);
		}
		else {
			this.scrollToNode(e, null, null);
		}
	},


	scrollToContainer: function(containerId){
		var de = this.getDocumentElement(),
			e = de.getElementById(containerId) || de.getElementsByName(containerId)[0];

		Ext.each(de.querySelectorAll('[data-ntiid],[ntiid]'), function(o){
			var a = o.getAttribute('data-ntiid')||o.getAttribute('ntiid');
			if(a===containerId){ e = o; }
			return !e;
		});

		if(!e){ return; }
		this.scrollToNode(e,true,0);
	},


	/**
	 * Scroll to some element, but allow options to decide whether or not to scroll.
	 *
	 * @param n - the node you want to scroll to
	 * @param onlyIfNotVisible - pass true here if you want this function to decide if it should scroll or not,
	 *                           based on its visibility on screen
	 * @param bottomThreshold - if you want to scroll if the target is close to the bottom, specify a threshold.
	 */
	scrollToNode: function(n, onlyIfNotVisible, bottomThreshold) {
		while(n && n.nodeType === Node.TEXT_NODE) {
			n = n.parentNode;
		}

		var offsets = this.body.getXY(),
			o = Ext.fly(n).getTop() - offsets[1],
			st = this.body.getScroll().top,
			h = this.body.getHeight(),
			b = st + h - (bottomThreshold || 0);

		//logic to halt scrolling if conditions mentioned in function docs are met.
		if (onlyIfNotVisible && o > st && o < b) {
			return;
		}

		this.scrollTo(o - 10);
	},


	scrollTo: function(top, animate) {
		this.body.scrollTo('top', top, animate!==false);
	},

	scrollToSearchHit: function(result, fragment) {
		var me = this, pos;

		me.clearSearchHit();
		if (!result) {
			return;
		}
		//show all the search hits
		me.showSearchHit(result.hit);
		if(fragment){
			console.time('Fragment location');
			pos = me.getFragmentLocation(fragment);
			console.timeEnd('Fragment location');
		}

		if(pos >= 0){
			try{
				me.scrollTo(pos);
			} catch(e){
				console.log("Could not scrollTo: ", pos, e.message);
			}
		}
	}
});
