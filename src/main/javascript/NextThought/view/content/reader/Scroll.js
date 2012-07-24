Ext.define('NextThought.view.content.reader.Scroll',{


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

			e = c.getRange();
			if(e){

				c.getEl().scrollIntoView(this.body, true);
				//this.scrollTo(e.getBoundingClientRect().top - this.getAnnotationOffsets().top);
				return;
			}
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

		text = text.toLowerCase();

		var me = this,
			doc = me.getDocumentElement(),
			ranges = [],
			created = {},
			texts,
			textLength = text.length;

		texts = AnnotationUtils.getTextNodes(doc);

		Ext.each(texts, function(node) {
				var nv = node.nodeValue.toLowerCase(),
					index = nv.indexOf(text),
					r;

				while(index >= 0) {
					r = doc.createRange();
					r.setStart(node, index);
					r.setEnd(node, index + textLength);

					if (!created[nv] || !created[nv][index]) {
						created[nv] = created[nv] || {} ;
						created[nv][index] = true;
						ranges.push(r);
					}
					index = nv.indexOf(text, index + 1);
				}
			},
			this);

		me.showRanges(ranges);
		me.scrollTo(ranges[0].getClientRects()[0].top - 150);
	}
});
