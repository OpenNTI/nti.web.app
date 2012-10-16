Ext.define('NextThought.view.content.reader.Scroll',{

	requires: ['NextThought.util.Search'],

	constructor: function(){
		this.on('afterrender',function(){

			this.body.on('scroll',function(){
				Ext.menu.Manager.hideAll();
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

	/** 
	 * A heavily modified version of Raymond Hill's doHighlight code. Attribution below 
	 *
	 * @param node - the node to search for ranges beneath
	 * @param doc - the document fragment node is a child of
	 * @param searchFor - a string or a regex to search for
	 * @param which - if provided the subexpression of the regex to be matched
	 * 
	 * @returns a list of range objects that represent the portion of text to highlight
	 **/

	// Author: Raymond Hill
	// Version: 2011-01-17
	// Title: HTML text hilighter
	// Permalink: http://www.raymondhill.net/blog/?p=272
	// Purpose: Hilight portions of text inside a specified element, according to a search expression.
	// Key feature: Can safely hilight text across HTML tags.
	// History:
	//   2012-01-29
	//     fixed a bug which caused special regex characters in the
	//     search string to break the highlighter
	findHighlightRanges: function(node, doc, searchFor, which){

		// normalize search arguments, here is what is accepted:
		// - single string
		// - single regex (optionally, a 'which' argument, default to 0)
		if(Ext.isString(searchFor)) {
			// rhill 2012-01-29: escape regex chars first
			// http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript
			searchFor = new RegExp(searchFor.replace(/[.*+?|()\[\]{}\\$^]/g,'\\$&'),'ig');
		}
		which = which || 0;

		// initialize root loop
		var indices = [],
			text = [], // will be morphed into a string later
			iNode = 0,
			nNodes = node.childNodes.length,
			nodeText,
			textLength = 0,
			stack = [],
			child, nChildren,
			state, ranges = [];
		// collect text and index-node pairs
		for (;;){
			while (iNode<nNodes){
				child = node.childNodes[iNode++];

				// text: collect and save index-node pair
				if(child.nodeType === 3){
					indices.push({i:textLength, n:child});
					nodeText = child.nodeValue;
					text.push(nodeText);
					textLength += nodeText.length;
				}
				// element: collect text of child elements,
				// except from script or style tags
				else if( child.nodeType === 1 ){

					// skip style/script tags
					if( child.tagName.search(/^(script|style)$/i) >= 0 ){
						continue;
					}

					//skip assessment items
					if( Ext.fly(child).is('.naquestion') ){
						continue;
					}

					// add extra space for tags which fall naturally on word boundaries
					if( child.tagName.search(/^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u)$/i) < 0 ){
						text.push(' ');
						textLength++;
					}

					// save parent's loop state
					nChildren = child.childNodes.length;
					if (nChildren){
						stack.push({n:node, l:nNodes, i:iNode});
						// initialize child's loop
						node = child;
						nNodes = nChildren;
						iNode = 0;
					}
				}
			}

			// restore parent's loop state
			if (!stack.length){
				break;
			}
			state = stack.pop();
			node = state.n;
			nNodes = state.l;
			iNode = state.i;
		}

		// quit if found nothing
		if (!indices.length){
			return ranges;
		}

		// morph array of text into contiguous text
		text = text.join('');

		// sentinel
		indices.push({i:text.length});

		// find and hilight all matches
		var iMatch, matchingText,
			iTextStart, iTextEnd,
			i, iLeft, iRight,
			iEntryLeft, iEntryRight, entryLeft, entryRight,
			parentNode, nextNode, newNode,
			iNodeTextStart, iNodeTextEnd,
			textStart, textMiddle, textEnd, range;

		// find entry in indices array (using binary search)
		function searchForEntry(start, end, lookFor, array, endEdge){
			var i;
			while (start < end) {
				i = start + end >> 1;
				if(lookFor < array[i].i + (endEdge ? 1 : 0)){end = i;}
				else if (lookFor >= array[i+1].i + (endEdge ? 1 : 0) ){start = i + 1;}
				else {start = end = i;}
			}
			return start;
		}

		// loop until no more matches
		for (;;){

			// find matching text, stop if none
			matchingText = searchFor.exec(text);
			if (!matchingText || matchingText.length<=which || !matchingText[which].length){
				break;
			}

			// calculate a span from the absolute indices
			// for start and end of match
			iTextStart = matchingText.index;
			for (iMatch=1; iMatch < which; iMatch++){
				iTextStart += matchingText[iMatch].length;
			}
			iTextEnd = iTextStart + matchingText[which].length;

			iEntryLeft = searchForEntry(0, indices.length, iTextStart, indices);
			iEntryRight = searchForEntry(iEntryLeft, indices.length, iTextEnd, indices, true);

			entryLeft = indices[iEntryLeft];
			entryRight = indices[iEntryRight];
			iNodeTextStart = iTextStart - entryLeft.i;
			iNodeTextEnd = iTextEnd - entryRight.i;

			range = document.createRange();
			range.setStart(entryLeft.n, Math.max(iNodeTextStart, 0));
			range.setEnd(entryRight.n, iNodeTextEnd);
			ranges.push(range);

		}
		return ranges;
	},

	scrollToSearchHit: function(result) {
		var me = this,
			doc = me.getDocumentElement(),
			ranges = [],
			rangeToScrollTo,
			nodeTop, scrollOffset, a, pos, assessmentAdjustment = 0,
			ps = result.hit.get('PhraseSearch'),
			regexToHighlight = SearchUtils.contentRegexForSearchHit(result.hit, ps);

		me.clearSearchRanges();
		if (!result || !regexToHighlight) {
			return;
		}


		ranges = me.findHighlightRanges(doc, doc, regexToHighlight);
		
		//Don't highlight phrase search until we get the issues worked out
		if(!ps){
			me.showRanges(ranges);
		}

		//If we found no range, try again not in iframe in case of assessments,
		//this is a bit of a hack to get it working for MC
		if(!ranges || ranges.length === 0){
			ranges = me.findHighlightRanges(document, document, regexToHighlight);
			assessmentAdjustment = 150;
		}

		//We may get ranges in our list that don't have any client rects.  A good example
		//is a node that is currently display none so make sure we account for that.  The
		//related topics list is one example of where we have seen this occur
		Ext.each(ranges, function(possibleRange){
			if(possibleRange.getClientRects().length > 0){
				rangeToScrollTo = possibleRange;
				return false; //Break
			}
			return true; //keep going
		});

		if(rangeToScrollTo){
			nodeTop = rangeToScrollTo.getClientRects()[0].top;
			//Assessment items aren't in the iframe so they don't take into account scroll
			scrollOffset = this.body.getScroll().top;
			scrollOffset = ( assessmentAdjustment > 0 ? scrollOffset : 0);

			pos = nodeTop - assessmentAdjustment + scrollOffset; 
			try{
				me.scrollTo(pos);
			} catch(e){
				console.log("Could not scrollTo: ", pos, e.message);
			}
		}
	}
});
