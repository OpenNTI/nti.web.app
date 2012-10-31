Ext.define('NextThought.ux.TextRangeFinder', {
	requires: [],


    rangeIsInsideRedaction: function(r){
        if (r.dom && r.hasCls('redacted')){return r;}
        else if (r.commonAncestorContainer){return Ext.fly(r.commonAncestorContainer).up('.redacted');}
        return false;
    },


    getRedactionActionSpan: function(r){
        var redactionParent = this.rangeIsInsideRedaction(r),
            redactionAction, blockRedaction;
        if (!redactionParent){return null;}


        redactionAction = redactionParent.prev('.redactionAction');
        if (!redactionAction){
            blockRedaction = redactionParent.prev('.block-redaction');
            if (blockRedaction){
                redactionAction = blockRedaction.down('.redactionAction');
            }
        }

        return redactionAction;
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
	findTextRanges: function(node, doc, searchFor, which){

		// normalize search arguments, here is what is accepted:
		// - single string
		// - single regex (optionally, a 'which' argument, default to 0)
		if(Ext.isString(searchFor)) {
			// rhill 2012-01-29: escape regex chars first
			// http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript
			searchFor = new RegExp(searchFor.replace(/[.*+?|()\[\]{}\\$\^]/g,'\\$&'),'ig');
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

            var redactionParent = this.rangeIsInsideRedaction(range);
            if(redactionParent){
                ranges.push(redactionParent);
            }
            ranges.push(range);
        }
		return ranges;
	}

});
