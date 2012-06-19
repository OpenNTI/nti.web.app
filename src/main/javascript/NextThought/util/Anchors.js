Ext.define('NextThought.util.Anchors', {
	requires: [
		'NextThought.model.anchorables.TextDomContentPointer',
		'NextThought.model.anchorables.ElementDomContentPointer',
		'NextThought.model.anchorables.DomContentPointer'
	],
	singleton: true,

	//TODO - testing
	toDomRange: function(contentRangeDescription, docElement) {
		   var ancestorNode = contentRangeDescription.getAncestor().locateRangePointInAncestor(docElement).node || docElement;
		   return Anchors.resolveSpecBeneathAncestor(contentRangeDescription, ancestorNode, docElement);
	},


	//TODO - testing
	createRangeDescriptionFromRange: function(range) {
		if(!range || range.collapsed){
			Ext.Error.raise('Cannot create anchorable, range missing or collapsed');
		}

		range = Anchors.makeRangeAnchorable(range);
		var ancestorNode = range.commonAncestorContainer;

		//If the ancestorcontainer is a text node, we want a containing element as per the docs
		if (Ext.isTextNode(ancestorNode)) {
			ancestorNode = ancestorNode.parentNode;
		}
		ancestorNode = Anchors.referenceNodeForNode(ancestorNode);

		var ancestorAnchor = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
			node: ancestorNode,
			role: 'ancestor'
		});

		return Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
			start: Anchors.createPointer(range, 'start'),
			end: Anchors.createPointer(range, 'end'),
			ancestor: ancestorAnchor
		});
	},


	//TODO - testing
	createPointer: function(range, role, node) {
		var endEdgeNode = node || Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));

		if (Ext.isTextNode(endEdgeNode)) {
			return Anchors.createTextPointerFromRange(range, role);
		}
		else if (Ext.isElement(endEdgeNode)) {
			var id = endEdgeNode.getAttribute('Id'),
				tagName = endEdgeNode.tagName;
			return Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
				elementTagName: tagName,
				elementId: id,
				role: role
			});
		}
		else {
			console.error('Not sure what to do with this node', node, role);
			Ext.Error.raise('Unable to translate node to pointer');
		}
	},


	/* tested */
	createTextPointerFromRange: function(range, role){
		if (!range || range.collapsed) {
			Ext.Error.raise('Cannot proceed without range or with a collapsed range');
		}

		var start = role === 'start',
			container = start ? range.startContainer : range.endContainer,
			offset = start ? range.startOffset : range.endOffset,
			contexts = [],
			edgeOffset,
			ancestor;

		if(!Ext.isTextNode(container)){
			Ext.Error.raise('Range must contain text containers');
		}

		var referenceNode = Anchors.referenceNodeForNode(container.parentNode);

		ancestor = Anchors.createPointer(range, 'ancestor', referenceNode);

		var primaryContext = Anchors.generatePrimaryContext(range, role);

		if(primaryContext){
			contexts.push(primaryContext);
		}

		//Generate the edge offset
		var normalizedOffset = primaryContext.getContextOffset();
		if(start){
			normalizedOffset = container.textContent.length - normalizedOffset;
		}

		edgeOffset = offset - normalizedOffset;

		//Now we want to collect subsequent context
		var collectedCharacters = 0;
		var maxSubsequentContextObjects = 5;
		var maxCollectedChars = 15;

		var walker = document.createTreeWalker( referenceNode, NodeFilter.SHOW_TEXT );
		walker.currentNode = container;

		var nextSiblingFunction = start ? walker.previousNode : walker.nextNode;

		while( (sibling = nextSiblingFunction.call(walker)) ) {
			if(   collectedCharacters >= maxCollectedChars
					  || contexts.length - 1 >= maxSubsequentContextObjects ){
					break;
			}

			var additionalContext = Anchors.generateAdditionalContext(sibling, role);
			collectedCharacters += additionalContext.getContextText().length;
			contexts.push(additionalContext);
		}

		return Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
			role: role,
			contexts: contexts,
			edgeOffset: edgeOffset,
			ancestor: ancestor
		});
    },


	/* tested */
	generateAdditionalContext: function(relativeNode, role){
		if (!relativeNode){
			Ext.Error.raise('Node must not be null');
		}
		var contextText = null;
		if(role === 'start'){
			contextText = Anchors.lastWordFromString(relativeNode.textContent);
		}
		else{
			contextText = Anchors.firstWordFromString(relativeNode.textContent);
		}

		if (!contextText && contextText.length === 0){
			return null;
		}

		var offset = relativeNode.textContent.indexOf(contextText);
		if(role === 'start'){
			offset = relativeNode.textContent.length - offset;
		}

		return Ext.create('NextThought.model.anchorables.TextContext', {
			contextText: contextText,
			contextOffset: offset
		});
	},


	/* tested */
	generatePrimaryContext: function(range, role) {
		if (!range){
			Ext.Error.raise('Range must not be null');
		}

		var container = null,
			offset = null,
			contextText, contextOffset;

		if(role === 'start'){
			container = range.startContainer;
			offset = range.startOffset;
		}
		else{
			container = range.endContainer;
			offset = range.endOffset;
		}

		//For the primary context we want a word on each side of the
		//range
		var textContent = container.textContent;
		if (!textContent || textContent.length ===0 ) {
			return null;
		}

		var prefix = Anchors.lastWordFromString(textContent.substring(0, offset));
		var suffix = Anchors.firstWordFromString(textContent.substring(offset, textContent.length));

		contextText = prefix+suffix;
		contextOffset = textContent.indexOf(contextText);

		//If start then we readjust offset to be from the right side...
		if( role === 'start' ){
			contextOffset = textContent.length - contextOffset;
		}

		return Ext.create('NextThought.model.anchorables.TextContext', {
			contextText: contextText,
			contextOffset: contextOffset
		});
    },


	/* tested */
	lastWordFromString: function(str){
		if (str === null || str === undefined){Ext.Error.raise('Must supply a string');}

		var word = '',
			readingWord = false,
			c, i;

		for(i=str.length - 1; i >= 0; i--){
			c = str.charAt(i);
			if(/\s/.test(c)){
					if(readingWord){
							break;
					}
					word += c;
			}
			else{
					readingWord = true;
					word += c;
			}
		}
		return word.split("").reverse().join("");
	},


	/* tested */
	firstWordFromString: function(str){
		if (str === null || str === undefined){Ext.Error.raise('Must supply a string');}
		var word = '',
			readingWord = false,
			c, i;

		for(i=0; i < str.length; i++){
			c = str.charAt(i);
			if(/\s/.test(c)){
					if(readingWord){
							break;
					}
					word += c;
			}
			else{
					readingWord = true;
					word += c;
			}
		}
		return word;
	},


	/* tested */
	resolveSpecBeneathAncestor: function(rangeDesc, ancestor, docElement){
		if(!rangeDesc){
			Ext.Error.raise('Must supply Description');
		}
		else if(!docElement){
			Ext.Error.raise('Must supply a docElement');
		}

		//Resolve the start anchor.
		//see below for details no resolving various
		//anchor types
		var startResult = rangeDesc.getStart().locateRangePointInAncestor(ancestor);

		//If we can't even resolve the start anchor there
		//is no point in resolving the end
		if(    !startResult.node
			|| !startResult.hasOwnProperty('confidence')
			|| startResult.confidence !== 1){
			return null;
		}

		//Resolve the end anchor.
		//see below for details no resolving various
		//anchor types
		var endResult = rangeDesc.getEnd().locateRangePointInAncestor(ancestor);

		if(    !endResult.node
			|| !endResult.hasOwnProperty('confidence')
			|| endResult.confidence !== 1){
			return null;
		}

		var range = docElement.createRange();
		if(startResult.hasOwnProperty('confidence')){
			range.setStart(startResult.node, startResult.offset);
		}
		else{
			range.setStartBefore(startResult.node);
		}

		if(endResult.hasOwnProperty('confidence')){
			range.setEnd(endResult.node, endResult.offset);
		}
		else{
			range.setEndAfter(endResult.node);
		}
		return range;
	},


	/* tested */
	locateElementDomContentPointer: function(pointer, ancestor){
		//only element dom pointers after this point:
		if (!(pointer instanceof NextThought.model.anchorables.ElementDomContentPointer)) {
			Ext.Error.raise('This method expects ElementDomContentPointers only');
		}

		var selector = '[Id='+pointer.getElementId()+']',
			potentials = Ext.query(selector, ancestor),
			p, i;

		for(i in potentials){
			if (potentials.hasOwnProperty(i)){
				p = potentials[i];
				if (p.tagName !== pointer.getElementTagName()) {
					console.error('Found a potential match to node, but tagnames do not match', p);
				}
				else {
					return {confidence: 1, node: p};
				}
			}
		}

		return {confidence: 0};
	},


	/* tested */
	//TODO - refactor this, break it up
	locateRangeEdgeForAnchor: function(pointer, referenceNode){
		if (!pointer) {
			Ext.Error.raise('Must supply a Pointer');
		}
		else if (!(pointer instanceof NextThought.model.anchorables.TextDomContentPointer)) {
			Ext.Error.raise('ContentPointer must be a TextDomContentPointer');
		}

		//var declarations:
		var isStart = pointer.role === 'start',
			primaryContext = pointer.primaryContext(),
			indexOfContext = primaryContext.getContextOffset(),
			textNode, treeWalker;


		//We use a tree walker to search beneath the reference node
		//for textContent matching our primary context with confidence
		// >= requiredConfidence

		treeWalker = document.createTreeWalker( referenceNode, NodeFilter.SHOW_TEXT, null, null);

		if(treeWalker.currentNode.nodeType === Node.TEXT_NODE){
				textNode = treeWalker.currentNode;
		}
		else{
				textNode = treeWalker.nextNode();
		}

		function contextMatchNode(context, node, isStart)
		{

				var adjustedOffset = context.getContextOffset(),
					indexOf = node.textContent.indexOf(context.getContextText());
				if(isStart){
						adjustedOffset = node.textContent.length - adjustedOffset;
				}

				if( indexOf !== -1 && indexOf === adjustedOffset){
						return true;
				}
				return false;
		}

			//If we are working on the start anchor, when checking context
		//we look back at previous nodes.  if we are looking at end we
		//look forward to next nodes
		var siblingFunction = isStart ? treeWalker.previousNode : treeWalker.nextNode;
		while( textNode ) {
				//Do all our contexts match this textNode
				var nextNodeToCheck = textNode;
				var match = true;
				var i;
				for(i = 0; i < pointer.getContexts().length; i++ ){
						var contextObj = pointer.getContexts()[i];

						//Right now, if we don't have all the nodes we need to have
						//for the contexts, we fail.  In the future this
						//probably changes but that requires looking ahead to
						//see if there is another node that makes us ambiguous
						//if we don't apply all the context
						if(!nextNodeToCheck){
							match = false;
								break;
						}
						//If we don't match this context with high enough confidence
						//we fail
						if( !contextMatchNode(contextObj, nextNodeToCheck, isStart) ){
								match = false;
								break;
						}

						//That context matched so we continue verifying.
						nextNodeToCheck = siblingFunction.call(treeWalker);
				}

				//We matched as much context is we could,
				//this is our node
				if(match){
						break;
				}
				else{
						//That wasn't it.  Continue searching
						treeWalker.currentNode = textNode;
				}

				//Start the context search over in the next textnode
				textNode = treeWalker.nextNode();
		}

		//If we made it through the tree without finding
		//a node we failed
		if(!textNode){
				return {confidence: 0};
		}

		if(isStart){
			indexOfContext = textNode.textContent.length - indexOfContext;
		}
		indexOfContext += pointer.getEdgeOffset();
		return {node: textNode, offset: indexOfContext, confidence: 1};
	},


	/* tested */
	referenceNodeForNode: function(node){
		if(!node){
			return null;
		}
		if( Anchors.isNodeAnchorable(node)){
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
			return true;
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
