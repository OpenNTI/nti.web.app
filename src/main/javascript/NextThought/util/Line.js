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

		var range;

		if (doc.caretRangeFromPoint){
			range = this.rangeForLineByPoint(y, doc);
		}
		else {
			range = this.rangeForLineBySelection(y, doc);
		}

		if(range){
			return { rect: range.getBoundingClientRect(), range: range };
		}
		return null;
	},


	/** @private */
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

		//testing, show ranges:
		//doc.parentWindow.getSelection().removeAllRanges();
		//doc.parentWindow.getSelection().addRange(range);

		return range;
	},


	/** @private */
	rangeForLineBySelection: function(y, doc){
		var sel = doc.parentWindow.getSelection(),
			elem,
			iterationCount = 0,
			range,
			x = 80;

			//clear ranges and get the node on this y
			sel.removeAllRanges();
		    elem = Anchors.referenceNodeForNode(doc.elementFromPoint(x, y)); //TODO - dynamically figure out the number 80?

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

			//detect weirdness where sometimes extending to a line causes entire paragraphs to be selected.
			/* TODO finish
			while(sel.getRangeAt(0).getBoundingClientRect().height > 35) {
				sel.modify('extend', 'backward', 'word');
			}
			*/

			//get the range, clear the selection, and return the range:
			range = sel.getRangeAt(0);

			//for testing, comment next line to show ranges
			//sel.removeAllRanges();

			return range;
	},


	/** @private */
	isNodeAnchorable: function(node){
		if (!node){return false;}
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
