Ext.define('NextThought.util.Anchors', {
	singleton: true,

	createRangeDescriptionFromRange: function(range) {
		range = Anchors.makeRangeAnchorable(range);

		if(!range || range.collapsed){
			Ext.Error.raise('Cannot create anchorable, range missing or collapsed');
		}

		var ancestorNode = Anchors.referenceNodeForNode(range.commonAncestorContainer);
		var ancestorAnchor = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
			node: ancestorNode,
			role: 'ancestor'
		});

		return Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
			start: NextThought.DomContentPointer.createStartAnchorForRange(range),
			end: NextThought.DomContentPointer.createEndAnchorForRange(range),
			ancestor: ancestorAnchor
		});
	},


	/* tested */
	referenceNodeForNode: function(node){
		if(!node){
			return null;
		}

		if( Anchors.isNodeAnchorable(node) ){
			return node;
		}
		else{
			return Anchors.referenceNodeForNode(node.parentElement);
		}
	},


	/* tested */
	makeRangeAnchorable: function(range) {
		if (!range){Ext.Error.raise('Range cannot be null');}

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
                 var adjustedStartNode = Anchors.searchFromRangeStartInwardForAnchorableNode(startEdgeNode);
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
                 var adjustedEndNode = Anchors.searchFromRangeEndInwardForAnchorableNode(endEdgeNode);
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

	/* tested */
	searchFromRangeStartInwardForAnchorableNode: function(startNode) {
		//resolve some initials, do we have a node and is it already anchorable?
		if(!startNode){return null;}
		if( Anchors.isNodeAnchorable(startNode) ) { return startNode; }

		//declare some vars we will use from here on out
		var recurseOn;

		//If we get here we know we are going to have to search for one.  So get the first child
		//or the next sibling
		recurseOn = startNode.firstChild;
		if(!recurseOn){ recurseOn = startNode.nextSibling; }

		//Try to recurse, until we find something or don't
		return Anchors.searchFromRangeStartInwardForAnchorableNode(recurseOn);
	 },


	/* tested */
	searchFromRangeEndInwardForAnchorableNode: function(endNode) {
		//handle simple cases where we can immediatly return
		if(!endNode){ return null; }
		if( Anchors.isNodeAnchorable(endNode)){return endNode;}

		var recurseOn = endNode;
		while(!recurseOn.previousSibling && recurseOn.parentNode){
			recurseOn = recurseOn.parentNode;
		}

		if(!recurseOn.previousSibling){
			return null;
		}
		recurseOn = recurseOn.previousSibling;

		recurseOn = Anchors.walkDownToLastNode(recurseOn);
		return Anchors.searchFromRangeEndInwardForAnchorableNode(recurseOn);
	},


	/* tested */
	walkDownToLastNode: function(node){
		if (!node){Ext.Error.raise('Node cannot be null');}

		//no more kids? return it.
		if(!node.firstChild){return node;}

		var workingNode = node.firstChild,
			result = workingNode,
			next;

		while(workingNode){
			next = workingNode.nextSibling;
			if (next === null) {
				workingNode = workingNode.firstChild;
			}
			else {
				workingNode = next;
			}

			if(workingNode){
				result = workingNode;
			}
		}

		return result;
	},


	/* tested */
	nodeThatIsEdgeOfRange: function(range, start){
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


	/* tested */
	isNodeAnchorable: function(node){
		//obviously not if node is not there
		if (!node) {return false;}

		//distill the possible ids into an id var for easier reference later
		var id = node.id || node.getAttribute ? node.getAttribute('id') : null;

		//Most common is text
		if( node.nodeType === Node.TEXT_NODE ){
			//We don't want to try to anchor to empty text nodes
			if( node.nodeValue.trim().length < 1 ){
				return false;
			}
			return true
		}


		//no mathjax ids allowd
		else if (id && id.indexOf("MathJax") !== -1) {
			return false;
		}

		//If this node had an id and a tagName, then yay node!
		else if (id && node.tagName){
			return true;
		}

		//if not a text node, us it missing an id or a tagname?
		else if(!id || !node.tagName ){
        	return false;
        }

		//otherwise, assume not
	    return false;
	}
},
function(){
	window.Anchors = this;
});
