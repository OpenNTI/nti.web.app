Ext.define('NextThought.util.Anchors', {
	singleton: true,

	createRangeDescriptionFromRange: function(range) {
		range = Anchors.makeRangeAnchorable(range);

		if(!range || range.collapsed){
			Ext.Error.raise('Cannot create anchorable, range missing or collapsed');
		}

		var rangeSpec = new NextThought.DomContentRangeDescription();

		var ancestorNode = referenceNodeForNode(range.commonAncestorContainer);
		var ancestorAnchor = NextThought.ElementDomContentPointer.createWithNode(ancestorNode);
		ancestorAnchor.type = NextThought.DomContentPointer.ancestorType;

		rangeSpec.ancestor = ancestorAnchor;

		rangeSpec.start = NextThought.DomContentPointer.createStartAnchorForRange(range);
		rangeSpec.end = NextThought.DomContentPointer.createEndAnchorForRange(range);

		return rangeSpec;
	},


	makeRangeAnchorable: function(range) {
		var startEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, true);
		var endEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, false);

		//If both anchors are already anchorable, we are done here.
		if(Anchors.isNodeAnchorable(startEdgeNode) && Anchors.isNodeAnchorable(endEdgeNode)){
			return range;
		}

         var newRange = document.createRange();

         if( Anchors.isNodeAnchorable(startEdgeNode) ){
                 newRange.setStart(range.startContainer, range.startOffset);
         }
         else{
                 var adjustedStartNode = searchFromRangeStartInwardForAnchorableNode(startEdgeNode);
                 if(!adjustedStartNode){
                         return null;
                 }
                 if( adjustedStartNode.nodeType === Node.TEXT_NODE ){
                         newRange.setStart(adjustedStartNode, 0);
                 }
                 else{
                         newRange.setStartBefore(adjustedStartNode);
                 }
         }

         if( Anchors.isNodeAnchorable(endEdgeNode) ){
                 newRange.setEnd(range.endContainer, range.endOffset);
         }
         else{
                 var adjustedEndNode = searchFromRangeEndInwardForAnchorableNode(endEdgeNode);
                 if(!adjustedEndNode){
                         return null;
                 }
                 if( adjustedEndNode.nodeType === Node.TEXT_NODE ){
                         newRange.setEnd(adjustedEndNode, adjustedEndNode.nodeValue.length);
                 }
                 else{
                         newRange.setEndAfter(adjustedEndNode);
                 }
         }

         return newRange;
 },


	nodeThatIsEdgeOfRange: function(range, start)
	{
		if (!range){
			Ext.Error.raise('Node is not defined');
		}

		var container = start ? range.startContainer : range.endContainer,
	    	offset = start ? range.startOffset : range.endOffset;

	    //If the container is a textNode look no further, that node is the edge
	    if( container.nodeType === Node.TEXT_NODE ){
	    	return container;
		}

		if(start){
			//If we are at the front of the range
			//the first full node in the range is the containers ith child
			//where i is the offset
			return container.childNodes.item(offset);
		}
		else{
			//At the end the first fully contained node is
			//at offset-1
			if(offset < 1){
				if(container.previousSibling){
					return container.previousSibling;
				}
				while(!container.previousSibling && container.parentNode){
					container = container.parentNode;
				}

				if (!container.previousSibling){
					Ext.Error.raise('No possible node');
				}
				else {
					return container.previousSibling;
				}
			}
			return container.childNodes.item(offset - 1);
		}
	},

	isNodeAnchorable: function(node)
	{
		//obviously not if node is not there
		if (!node) {return false;}

		//Most common is text
		else if( node.nodeType === Node.TEXT_NODE ){
			//We don't want to try to anchor to empty text nodes
			if( node.nodeValue.trim().length < 1 ){
				return false;
			}
			return true
		}

		//if not a text node, us it missing an id or a tagname?
		else if( !node.id || !node.tagName ){
        	return false;
        }

		//no mathjax ids allowd
		else if (node.id.indexOf("MathJax") !== -1) {
			return false;
		}

		//otherwise, assume not
	    return false;
	}


},
function(){
	window.Anchors = this;
});
