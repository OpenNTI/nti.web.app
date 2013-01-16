Ext.define('NextThought.ux.TextRangeFinder', {
	requires: ['NextThought.util.Search'],


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
	 * These functions are a heavily modified version of Raymond Hill's doHighlight code. Attribution below
	 */
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

	//Returns an object with two properties indices
	//and text.  If nodeFilterFn is provided it will
	//be called with each node before it is indexed.  nodes returning
	//true will be indexed
	indexText: function(node, nodeFilterFn){
			// initialize root loop
		var indices = [],
			text = [], // will be morphed into a string later
			iNode = 0,
			nNodes = node.childNodes.length,
			nodeText,
			textLength = 0,
			stack = [],
			child, nChildren;
		// collect text and index-node pairs
		for (;;){
			while (iNode<nNodes){
				child = node.childNodes[iNode++];

				// text: collect and save index-node pair
				if(child.nodeType === 3){

					if(Ext.isFunction(nodeFilterFn) && !nodeFilterFn(child)){
						continue;
					}

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
			return null;
		}

		// morph array of text into contiguous text
		text = text.join('');

		// sentinel
		indices.push({i:text.length});

		return {text: text, indices: indices};
	},

	// find entry in indices array (using binary search)
	searchForEntry: function(start, end, lookFor, array, endEdge){
		var i;
		while (start < end) {
			i = start + end >> 1;
			if(lookFor < array[i].i + (endEdge ? 1 : 0)){end = i;}
			else if (lookFor >= array[i+1].i + (endEdge ? 1 : 0) ){start = i + 1;}
			else {start = end = i;}
		}
		return start;
	},

	adjustLocatedRange: function(range){
		return this.rangeIsInsideRedaction(range) || range;
	},

	mapMatchToTextRange: function(match, whichGroup, textIndex, doc){
		var iMatch, iTextStart, iTextEnd, iEntryLeft, iEntryRight,
			entryLeft, entryRight, iNodeTextStart, iNodeTextEnd,
			indices = textIndex.indices, range;
		if(!match[whichGroup].length){
			Ext.error("No match for group", match, whichGroup);
		}

		// calculate a span from the absolute indices
		// for start and end of match

		//TODO this could be optimized slightly to start with the
		//offset of the last match
		iTextStart = match.index;
		for (iMatch=1; iMatch < whichGroup; iMatch++){
			iTextStart += match[iMatch].length;
		}
		iTextEnd = iTextStart + match[whichGroup].length;

		iEntryLeft = this.searchForEntry(0, indices.length, iTextStart, indices);
		iEntryRight = this.searchForEntry(iEntryLeft, indices.length, iTextEnd, indices, true);

		entryLeft = indices[iEntryLeft];
		entryRight = indices[iEntryRight];
		iNodeTextStart = iTextStart - entryLeft.i;
		iNodeTextEnd = iTextEnd - entryRight.i;

		range = doc.createRange();
		range.setStart(entryLeft.n, Math.max(iNodeTextStart, 0));
		range.setEnd(entryRight.n, iNodeTextEnd);

		return range;
	},

	/**
	 * @param node - the node to search for ranges beneath
	 * @param doc - the document fragment node is a child of
	 * @param searchFor - a string or a regex to search for
	 * @param which - if provided the subexpression of the regex to be matched or an array of subexpression idexes
	 * Note cutz: for the which param to work it expects each part of your regex to be captured
	 * IE if your goal is to have a capture in the middle of the regex you must also capture the first portion prior to it
	 *
	 * @returns a list of range objects that represent the portion of text to highlight
	 **/
	findTextRanges: function(node, doc, searchFor, which, textIndex){
		var iMatch, matchingText,
			iTextStart, iTextEnd,
			i, iLeft, iRight,
			iEntryLeft, iEntryRight, entryLeft, entryRight,
			parentNode, nextNode, newNode,
			iNodeTextStart, iNodeTextEnd,
			textStart, textMiddle, textEnd, range, indexedText, ranges = [],
			text, indices, quit;

		console.log('Finding text range for ', searchFor);

		// normalize search arguments, here is what is accepted:
		// - single string
		// - single regex (optionally, a 'which' argument, default to 0)
		if(Ext.isString(searchFor)) {
			// rhill 2012-01-29: escape regex chars first
			// http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript
			searchFor = new RegExp(searchFor.replace(/[.*+?|()\[\]{}\\$\^]/g,'\\$&'),'ig');
		}
		which = which || 0;
		if(!Ext.isArray(which)){
			which = [which];
		}
		which = Ext.Array.sort(which);

		function allButQuestions(child){
			return !Ext.fly(child).parent('.naquestion');
		}

		//Index all the text beneath node
		indexedText = textIndex || this.indexText(node, allButQuestions);
		if(!indexedText){
			return ranges;
		}

		text = indexedText.text;
		console.log(text);
		indices = indexedText.indices;

		function processGroup(whichGroup){
				var range;
				try{
					range = this.mapMatchToTextRange(matchingText, whichGroup, indexedText, doc);
					if(range){
						ranges.push(range);
					}
				}
				catch(e){
					quit = true;
					return false;
				}
		}

		// loop until no more matches
		for (;;){
			// find matching text, stop if none
			matchingText = searchFor.exec(text);
			if(!matchingText || matchingText.length <= which[which.length - 1]){
				break;
			}
			quit = false;
			//loop over the which capture groups
			Ext.each(which, processGroup, this);

			//TODO should we just continue here?  The original
			//implementation stops all work here but that may
			//not be what we want
			if(quit){
				break;
			}
        }
		return ranges;
	},

	findTextRangesForSearchHit: function(hit, node, doc){
		var fragments, phrase, ranges = [], textIndex;

		if(!hit){
			return null;
		}

		fragments = hit.get('Fragments');
		phrase = hit.get('PhraseSearch');

		if(Ext.isEmpty(fragments)){
			return null;
		}

		//index the text
		textIndex = this.indexText(node);

		//For each fragment build are regex string
		//and grap the ranges
		Ext.each(fragments, function(frag){
			console.log('Working on frag', frag);
			var re = SearchUtils.contentRegexForFragment(frag, phrase, true);

			Ext.Array.push(ranges, this.findTextRanges(node, doc, re.re, re.matchingGroups, textIndex));
		}, this);

		return ranges;
	}

});
