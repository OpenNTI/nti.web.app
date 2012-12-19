Ext.define('NextThought.util.Line',{
	singleton: true,

	getStyle: function(node,prop){
		if(!node){return '';}
		var view = node.ownerDocument.defaultView;
		return view.getComputedStyle(node,undefined).getPropertyValue(prop);
	},


	/**
	 * This is the main exported function in this utility.
	 *
	 * @param y
	 * @param [doc]
	 * @return {*}
	 */
	findLine: function(y, doc){
		y = Math.round(y);
		doc = doc || document;

		var range, objectSelector = 'object[type$=naquestion]',
			ancestor, questionObject;
		//The "IE9" search is actually more accurate for assessment pages
		if (Ext.isIE9) {
			range = this.rangeByRecursiveSearch(y,doc);
		}
		else if (doc.caretRangeFromPoint){
			range = this.rangeForLineByPoint(y, doc);
		}
		else {
			range = this.rangeForLineBySelection(y, doc);
		}

        try{
            //ranges created next to videos sometimes require massaging to be anchorable, do that now.
            if(!Ext.isTextNode(range.commonAncestorContainer) && Ext.fly(range.commonAncestorContainer).hasCls('externalvideo')){
                range.setStartBefore(range.startContainer);
                range.setEndAfter(range.endContainer);
            }
            range = Anchors.makeRangeAnchorable(range, doc);
        }
        catch (e){
            range = null;
        }
		if(range){
			//If we are in a question do some magic to make sure we only return one line.
			//TODO actually refactor this stuff in a way that we work with the assessment overlay
			//to determine notability
			ancestor = range.commonAncestorContainer;
			if(ancestor){
				questionObject = Ext.fly(ancestor).is(objectSelector) ? ancestor : Ext.fly(ancestor).parent(objectSelector, true);
			}
			if(questionObject){
				range = doc.createRange();
				range.selectNodeContents(questionObject);
			}

			return { rect: range.getBoundingClientRect(), range: range };
		}
		return null;
	},

	/** @private */
	//IE
	rangeByRecursiveSearch: function(y,doc) {
		y -= 30; //Correction
		var curNode = doc.documentElement, range, rect, sibling;
		//First text node ending past y
		var i, cn;
		for (i = 0; curNode.nodeType === curNode.ELEMENT_NODE && i < curNode.childNodes.length; i++) {
			cn = curNode.childNodes;
			range = doc.createRange();
			range.selectNode(cn[i]);
			rect = range.getBoundingClientRect();
			if (!rect){ rect = range.getClientRects()[0];}
			if (rect.bottom > y && (cn[i].data || cn[i].innerText || '  ').length > 1) {
				curNode = cn[i];
				i = -1;
			}
			//If recursive search takes us to a bad node, depth-first search forward from there
			while (curNode.nodeType !== curNode.TEXT_NODE && (i+1) >= curNode.childNodes.length && curNode.parentNode) {
				i = 0;
				sibling = curNode;
				while ( (sibling = sibling.previousSibling) !== null ) { i += 1; }
				curNode = curNode.parentNode;
			}
		}
		if (!curNode) { console.log('rangeByRecursiveSearch failed'); return null; }
		range = doc.createRange();
		var left = 0, right = curNode.data.length, center;
		// First single character ending past y
		while (right-left > 1) {
			center = Math.floor((left+right)/2);
			range.setStart(curNode,center - 1); //We want to bias the algorithm to the right a bit
			range.setEnd(curNode,right);
			rect = range.getBoundingClientRect();
			if (rect.top < y) { left = center; }
			else { right = center; }
		}
		//Extend as long as height remains the same, another binary search
		var h = rect.height;
		var ll = left + 1, rr = curNode.data.length;
		while (rr - ll > 1) {
			center = Math.floor((ll+rr)/2);
			range.setEnd(curNode,center);
			rect = range.getBoundingClientRect();
			if (rect.height > h) { rr = center; }
			else { ll = center; }
		}

		if (range.collapsed){return null;}
		if (!this.isNodeAnchorable(range.commonAncestorContainer)){return null;}

		return range;
	},


	/** @private */
	//webkit mostly
	rangeForLineByPoint: function(y, doc) {
		var xStart = 0,
			xEnd = doc.querySelector('#NTIContent .page-contents').getBoundingClientRect().width,
			range = doc.caretRangeFromPoint(xStart, y),
			rangeEnd = doc.caretRangeFromPoint(xEnd, y);

		if (!range){return null;}

		//If we managed to grab an end, use it to expand the range, otherwise, just stick with the
		//first word...
		if(rangeEnd) {
			range.setEnd(rangeEnd.endContainer, rangeEnd.endOffset);
		}
		else {range.expand('word');}

		//If we have selected a range that is still collapsed.  No anchor.
		if (range.collapsed){return null;}

		//testing, show ranges:
		//doc.parentWindow.getSelection().removeAllRanges();
		//doc.parentWindow.getSelection().addRange(range);
		//console.log('range', range, range.toString());

		return range;
	},


	/** @private */
	//mozilla mostly
	rangeForLineBySelection: function(y, doc){
		var xStart = 0,
            xEnd = doc.querySelector('#NTIContent .page-contents').getBoundingClientRect().width,
            sel = doc.parentWindow.getSelection(),
			elem,
			iterationCount = 0,
			range;

			//clear ranges and get the node on this y
			sel.removeAllRanges();

            while(xStart < xEnd) {
                elem = doc.elementFromPoint(xStart, y);
                if(!this.isNodeAnchorable(elem) && elem.getAttribute('Id') !== 'NTIContent'){
                    elem = AnnotationUtils.getTextNodes(elem)[0];
                }
				//more right 20, it's a guess of a reasonable offset.
                xStart += 20;
            }

            if (!this.isNodeAnchorable(elem)){
                return null;
            }

			//we have an element, it's an object but not a video (an assessment probably)
            if (Ext.fly(elem).is('object:not(.naqvideo)') || Ext.fly(elem).parent('object:not(.naqvideo)')) {
				elem = Ext.fly(elem).parent('object') || elem;
                sel.selectAllChildren(Ext.fly(elem).down('div.naquestionpart').dom);
                range = sel.getRangeAt(0);
                sel.removeAllRanges();
                return range;
            }

		    elem = Anchors.referenceNodeForNode(elem);

			//check to make sure this node is selectable, if not, then return null:
			if (!this.isNodeAnchorable(elem)){return null;}

			//we probably got a block node, select children and prepare to start looking for the correct y:
			sel.selectAllChildren(elem);
			sel.collapseToStart();

			//If there is no range here, skip this line:
			if (sel.rangeCount === 0){return null;}

			//Go line by line until we get one on the correct y, quit trying after 100 tries:
			while(iterationCount < 100 && sel.getRangeAt(0).getBoundingClientRect().bottom < y){
				sel.modify('extend', 'forward', 'line');
				iterationCount++;
			}

			//minor adjustment to move/extend selection to last line only:
			sel.modify('extend', 'backward', 'line');
			sel.collapseToEnd();
			sel.modify('extend', 'forward', 'line');

			//detect weirdness, if we have not been able to select anything by this point,
			//do not allow anchoring:
			//If we have selected a range that is still collapsed.  No anchor.
			if (sel.toString().trim().length === 0){return false;}

			//get the range, clear the selection, and return the range:
			range = sel.getRangeAt(0);

			//for testing, comment next line to show ranges
			sel.removeAllRanges();

			return range;
	},


	/** @private */
	isNodeAnchorable: function(n){
		if (!n){return false;}

        //check for figured inside assessments:
        if (Ext.fly(n).is('.figure') && Ext.fly(n).up('object')){
            return null;
        }

		var node = Anchors.referenceNodeForNode(n);

        //shortcut, found nothing..
        if(!node){return false;}

		if (Ext.isTextNode(node) && node.nodeValue.trim().length > 0) {
			return true;
		}

		var nonAnchorableNodeClasses = [
				'page-contents',
				'label',
				'injected-related-items'],
			nonAnchorableNodeNames = [
				'HTML'
			],
			nonAnchorableIds = [
				'NTIContent'
			],
			result = true;

		//it is not anchorable if it has one of the listed classes:
		Ext.each(nonAnchorableNodeClasses, function(c){
			if (Ext.fly(node).hasCls(c)){
				result = false;
			}
		});

		//it is not anchorable if it has one of the listed classes:
		Ext.each(nonAnchorableIds, function(c){
			if (node.getAttribute('id') === c){
				result = false;
			}
		});

		//it is not anchorable if it is a node with the name:
		if(Ext.Array.contains(nonAnchorableNodeNames, node.tagName)){result = false;}

		//console.log('node', node, 'anchorable?', result);

		return result;
	}

}, function(){
	window.LineUtils = this;
});
