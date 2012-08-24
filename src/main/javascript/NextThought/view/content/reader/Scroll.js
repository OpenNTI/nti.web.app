Ext.define('NextThought.view.content.reader.Scroll',{

	requires: ['NextThought.util.Search'],

	constructor: function(){
		this.on('afterrender',function(){

//			this.body.on('scroll',function(e,dom){console.log(arguments);},this);

		},this);
	},


	registerScrollHandler: function(fn, scope){
		this.body.on('scroll', fn, scope);
	},


	unRegisterScrollHandler: function(fn, scope){
		this.body.un('scroll', fn, scope);
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
			e = document.getElementById(target) || de.getElementById(target) || de.getElementsByName(target)[0];

		if (!e && c) {
			try{
				this.scrollTo(c.getScrollPosition(this.body.getScroll().top));
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


	scrollToText: function(text) {
		if (!text) {
			return;
		}

		var me = this,
			doc = me.getDocumentElement(),
			ranges = [],
			texts,
			re = SearchUtils.searchRe(text),
			match;

		texts = AnnotationUtils.getTextNodes(doc);

		Ext.each(texts, function(node) {
			var nv = node.nodeValue,
				indexes = [],
				r;

			while (match = re.exec(nv)) {
				indexes.push( {'start':match.index, 'end': match.index+match[0].length } );
			}

			Ext.each(indexes, function(index){
				r = doc.createRange();
				r.setStart(node, index.start);
				r.setEnd(node, index.end);
				ranges.push(r);
			});
		},
		this);

		me.showRanges(ranges);
		if (ranges.length > 0) { me.scrollTo(ranges[0].getClientRects()[0].top - 150); }
	}
});
