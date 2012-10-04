Ext.Loader.setPath('rangy', 'resources/lib/rangy-1.3alpha.681/rangy-core.js');
Ext.Loader.setPath('rangy.modules.TextRange', 'resources/lib/rangy-1.3alpha.681/rangy-textrange.js');

Ext.define('NextThought.util.Anchors', {
	requires: [
		'NextThought.model.anchorables.TextDomContentPointer',
		'NextThought.model.anchorables.ElementDomContentPointer',
		'NextThought.model.anchorables.DomContentPointer',
		'NextThought.model.anchorables.ContentRangeDescription',
		'rangy'
	],
	uses: [
		'rangy.modules.TextRange'
	],

	singleton: true,

	PURIFICATION_TAG: 'data-nti-purification-tag',

/*	toDomRange: function(contentRangeDescription, docElement, containerId) {
		if(!containerId){console.warn('No container id provided will assume page container (body element)');}
		if(!contentRangeDescription){console.warn('nothing to parse?');return null;}
		var ancestorNode = contentRangeDescription.getAncestor().locateRangePointInAncestor(docElement).node || docElement.body;

        //TODO - if an ancestor doesn't exist, do some better logging here, something like below

		if (!ancestorNode){
			console.error('Failed to get ancestor node for description', contentRangeDescription);
		}

		//Clone and purify the ancestor node, so our range can always build against a clean source:
		//TODO - consider caching these somewhere for performance
		var clonedAncestor = ancestorNode.cloneNode(true),
            resultRange;
		Anchors.purifyNode(clonedAncestor);
		resultRange = Anchors.resolveSpecBeneathAncestor(contentRangeDescription, clonedAncestor, docElement);
        if (!resultRange) {
            console.warn('could not generate range, trying again from body');
            clonedAncestor = docElement.body.cloneNode(true);
            Anchors.purifyNode(clonedAncestor);
            resultRange = Anchors.resolveSpecBeneathAncestor(contentRangeDescription, clonedAncestor, docElement);
        }
        return resultRange;
	},*/

	toDomRange: function(contentRangeDescription, docElement, containerId) {
		var ancestorNode, clonedAncestor, resultRange, searchWithin;
		if(!containerId){
			console.warn('No container id provided will assume page container (body element)');
		}
		if(!contentRangeDescription){
			console.warn('nothing to parse?');
			return null;
		}

		//Todo resolve the containerId to the node we want to restrict our search within
		searchWithin = this.getContainerNode(containerId, docElement);
		if(!searchWithin){
			//TODO if the container is not the page id but we can't find it we could
			//just skip to the end now.  Maybe we decide there is no point searching the whole body.
			//that may allow us to skip some work in some cases
			searchWithin = docElement.body;
			console.warn('Unable to resolve containerId will fallback to root ', containerId, searchWithin);
		}

		//TODO need a better way to detect the empty description
		if (   !contentRangeDescription.start 
			&& !contentRangeDescription.end 
			&& !contentRangeDescription.ancestor)
		{
			console.log('Given an empty content range description, returning a range wrapping the container', contentRangeDescription, searchWithin);
			resultRange = docElement.createRange();
			//Hmm, selectNode or selectNodeContents
			resultRange.selectNodeContents(searchWithin);
			return resultRange;
		}
		
		//console.log('Will perform resolution of', contentRangeDescription,  'within', searchWithin);

		ancestorNode = contentRangeDescription.getAncestor().locateRangePointInAncestor(searchWithin).node || searchWithin;

        //TODO - if an ancestor doesn't exist, do some better logging here, something like below

		if (!ancestorNode){
			console.error('Failed to get ancestor node for description.', contentRangeDescription,'This should happen b/c we should default to ', searchWithin);
			//TODO return here, raise exception, or just let the below potentially explode
		}

		//Clone and purify the ancestor node, so our range can always build against a clean source:
		//TODO - consider caching these somewhere for performance
		clonedAncestor = ancestorNode.cloneNode(true);

		Anchors.purifyNode(clonedAncestor);
		resultRange = Anchors.resolveSpecBeneathAncestor(contentRangeDescription, clonedAncestor, docElement);

        if (!resultRange && ancestorNode !== searchWithin) {
            console.warn('could not generate range, will try again from ', searchWithin);
            clonedAncestor = searchWithin.cloneNode(true);
            Anchors.purifyNode(clonedAncestor);
            resultRange = Anchors.resolveSpecBeneathAncestor(contentRangeDescription, clonedAncestor, docElement);
        }

		/*//All our fallbacks failed
		  if(!resultRange){
			//TOOD if we can't recreate the range but we have a containerId, should
			//we just create a range that is the entire container.  This may be ok
			//for something like a note that is only renderd in the gutter, but it
			//could be bad news for something like highlights.  The caller
			//would probably need to request this behavior
		}*/

        return resultRange;
	},



	/* tested */
	createRangeDescriptionFromRange: function(range, docElement) {
		if(!range){
			console.log('Returning empty ContentRangeDescription for null range');
			return {description: Ext.create('NextThought.model.anchorables.ContentRangeDescription', {})};
		}

		Anchors.cleanRangeFromBadStartAndEndContainers(range);
		range = Anchors.makeRangeAnchorable(range, docElement);
		var pureRange = Anchors.purifyRange(range, docElement),
			ancestorNode = range.commonAncestorContainer,
            result = {};

		//If the ancestorcontainer is a text node, we want a containing element as per the docs
		//NOTE: use range, not pureRange here because the pureRange's ancestor is probably a doc fragment.
		if (Ext.isTextNode(ancestorNode)) {
			ancestorNode = ancestorNode.parentNode;
		}
		ancestorNode = Anchors.referenceNodeForNode(ancestorNode);

        result.container = this.getContainerNtiid(ancestorNode);

		var ancestorAnchor = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
			node: ancestorNode,
			role: 'ancestor'
		});

		result.description = Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
			start: Anchors.createPointer(pureRange, 'start'),
			end: Anchors.createPointer(pureRange, 'end'),
			ancestor: ancestorAnchor
		});
        return result;
	},

	getContainerNode: function(containerId, root){
		if(!containerId){
			return null;
		}

		var selector = '['+(containerId.indexOf('tag:nextthought.com') >= 0 ? 'data-ntiid' : 'Id')+'="'+containerId+'"]',
			potentials = Ext.query(selector, root);
		
		if(!potentials || potentials.length === 0){
			console.warn('Unable to find container', containerId);
			return null;
		}

		if(potentials.length > 1){
			//TODO what do we actually do here?
			console.warn('Found several matches for container. Will return first', containerId, potentials);
		}

		return potentials[0];
	},

    getContainerNtiid: function(node){
        var n = Ext.get(node),
            a = 'data-ntiid',
            s = '['+a+']',
            up = n.up(s);

        if (n.is(s)){
            return n.getAttribute(a);
        }
        else if (up) {
            return up.getAttribute(a);
        }
        else {
            return LocationProvider.currentNTIID;
        }

    },


	doesElementMatchPointer: function(element, pointer) {
		if( (element.id === pointer.elementId 
			 || (element.getAttribute && element.getAttribute('data-ntiid') === pointer.elementId))
			&& element.tagName.toUpperCase() === pointer.elementTagName.toUpperCase() ){
			return true;
		}
		return false;
	},


	//TODO - testing
	createPointer: function(range, role, node) {
		var edgeNode = node || Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));

		if (Ext.isTextNode(edgeNode)) {
			return Anchors.createTextPointerFromRange(range, role);
		}
		else if (Ext.isElement(edgeNode)) {
			var id = edgeNode.getAttribute('data-ntiid') || edgeNode.getAttribute('Id'),
				tagName = edgeNode.tagName;
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
		if (!range) {
			Ext.Error.raise('Cannot proceed without range');
		}

		var start = role === 'start',
			container = start ? range.startContainer : range.endContainer,
			offset = start ? range.startOffset : range.endOffset,
			contexts = [],
			edgeOffset,
			ancestor,
			parent = container.parentNode;

		if(!Ext.isTextNode(container)){
			container = Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));
			offset = role === 'start' ? 0 : container.textContent.length;
		}

		//If we run into a doc fragment here, then we may have to bump out of the fragment:
		if (parent.nodeType === 11){ //DOCUMENT_FRAGMENT_NODE
			parent = range.ownerNode;
		}

		var referenceNode = Anchors.referenceNodeForNode(parent);

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

		var walker = document.createTreeWalker( referenceNode, NodeFilter.SHOW_TEXT, null, false );
		walker.currentNode = container;

		var nextSiblingFunction = start ? walker.previousNode : walker.nextNode;
		var sibling;//oops... this was being declared globally
		while( Boolean(sibling = nextSiblingFunction.call(walker)) ) {
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

        if(!Ext.isTextNode(container)){
            container = Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));
            offset = role === 'start' ? 0 : container.textContent.length;
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

		//console.log('Created Context, TEXT', "'"+textContent+"'", 'CONTEXT', contextText, 'OFFSET', contextOffset);

		return Ext.create('NextThought.model.anchorables.TextContext', {
			contextText: contextText,
			contextOffset: contextOffset
		});
    },

	/* tested */
	lastWordFromString: function(str){
		if (str === null || str === undefined){Ext.Error.raise('Must supply a string');}
		return (/\S*\s?$/).exec(str)[0];
	},

	/* tested */
	firstWordFromString: function(str){
		if (str === null || str === undefined){Ext.Error.raise('Must supply a string');}
		return (/^\s?\S*/).exec(str)[0];
	},

	/* tested */
	resolveSpecBeneathAncestor: function(rangeDesc, ancestor, docElement){
		if(!rangeDesc){
			Ext.Error.raise('Must supply Description');
		}
		else if(!docElement){
			Ext.Error.raise('Must supply a docElement');
		}

		//Resolve start and end.
		var startResult = rangeDesc.getStart().locateRangePointInAncestor(ancestor);
		//console.log('Resolution of start result was', startResult);
		if(!startResult.node
			|| !startResult.hasOwnProperty('confidence')
			|| startResult.confidence < 0.4){
			return null;
		}
		if(!startResult.node
			|| !startResult.hasOwnProperty('confidence')
			|| startResult.confidence !== 1){
			console.error('startResult has low confidance', startResult.confidence, startResult, ancestor, rangeDesc);
		}

		var endResult = rangeDesc.getEnd().locateRangePointInAncestor(ancestor, startResult);
		//console.log('Resolution of end result was', endResult);
		if(!endResult.node
			|| !endResult.hasOwnProperty('confidence')
			|| endResult.confidence < 0.4){
			return null;
		}
		if(!endResult.node
			|| !endResult.hasOwnProperty('confidence')
			|| endResult.confidence !== 1){
			console.error('endResult has low confidance', endResult.confidence, endResult, ancestor, rangeDesc);
		}

		var startResultLocator = Anchors.toReferenceNodeXpathAndOffset(startResult);
		var endResultLocator = Anchors.toReferenceNodeXpathAndOffset(endResult);
		//console.log('startResultLocator ', startResultLocator, ' endResultLocator ', endResultLocator);

		return Anchors.convertContentRangeToDomRange(startResultLocator, endResultLocator, docElement);
	},


	//TODO - testing
	convertContentRangeToDomRange: function(startResult, endResult, docElement) {

		var liveStartResult = Anchors.convertStaticResultToLiveDomContainerAndOffset(startResult, docElement);
		var liveEndResult = Anchors.convertStaticResultToLiveDomContainerAndOffset(endResult, docElement);
//		console.log('liveStartResult', liveStartResult, 'liveEndResult', liveEndResult);
		if(!liveStartResult || !liveEndResult){
			return null;
		}

		var range = docElement.createRange();
		if(liveStartResult.hasOwnProperty('offset')){
			range.setStart(liveStartResult.container, liveStartResult.offset);
		}
		else{
			range.setStartBefore(liveStartResult.container);
		}

		if(liveEndResult.hasOwnProperty('offset')){
			range.setEnd(liveEndResult.container, liveEndResult.offset);
		}
		else{
			range.setEndAfter(liveEndResult.container);
		}
		return range;
	},


	/* tested */
	locateElementDomContentPointer: function(pointer, ancestor){
		//only element dom pointers after this point:
		if (!(pointer instanceof NextThought.model.anchorables.ElementDomContentPointer)) {
			Ext.Error.raise('This method expects ElementDomContentPointers only');
		}

		//In these case of the document body (root) we may be the ancestor
		if(Anchors.doesElementMatchPointer(ancestor, pointer) ){
			return {confidence: 1, node: ancestor};
		}

		var selector = '['+(pointer.getElementId().indexOf('tag:nextthought.com') >= 0 ? 'data-ntiid' : 'Id')+'="'+pointer.getElementId()+'"]',
			potentials = Ext.query(selector, ancestor),
			p, i;

		for(i in potentials){
			if (potentials.hasOwnProperty(i)){
				p = potentials[i];
				if (p.tagName !== pointer.getElementTagName()) {
					console.error('Found a potential match to node, but tagnames do not match', p);
				}
				else {
					if(Anchors.doesElementMatchPointer(p, pointer) ){
						return {confidence: 1, node: p};
					}
				}
			}
		}

		return {confidence: 0};
	},


	/* tested */
	isNodeChildOfAncestor: function(node, ancestor) {
			while(node && node.parentNode){
					if(node.parentNode === ancestor){
							return true;
					}
					node = node.parentNode;
			}
			return false;
	},


	/* tested */
	locateRangeEdgeForAnchor: function(pointer, ancestorNode, startResult ){
		if (!pointer) {
			Ext.Error.raise('Must supply a Pointer');
		}
		else if (!(pointer instanceof NextThought.model.anchorables.TextDomContentPointer)) {
			Ext.Error.raise('ContentPointer must be a TextDomContentPointer');
		}

		//Resolution starts by locating the reference node
		//for this text anchor.  If it can't be found ancestor is used

		var root = ancestorNode,
			referenceNode,
			foundReferenceNode,
			isStart,
			treeWalker,
			textNode,
			result = {},
			possibleNodes = [],
			done = false,
			i;



		if(root.parentNode){
			root = root.parentNode;
		}

		referenceNode = pointer.getAncestor().locateRangePointInAncestor(root).node;
		foundReferenceNode = true;
		if(!referenceNode){
			foundReferenceNode = false;
			referenceNode = ancestorNode;
		}

		isStart = pointer.getRole() === 'start';

		//We use a tree walker to search beneath the reference node
		//for textContent matching our contexts

		treeWalker = document.createTreeWalker( referenceNode, NodeFilter.SHOW_TEXT, null, false );

		//If we are looking for the end node.  we want to start
		//looking where the start node ended.  This is a shortcut
		//in the event that the found start node is in our reference node
		if( !isStart && startResult && startResult.node
			&& Anchors.isNodeChildOfAncestor(startResult.node, referenceNode)){

			treeWalker.currentNode = startResult.node;
		}

		//We may be in the same textNode as start
		if(treeWalker.currentNode.nodeType === Node.TEXT_NODE){
			textNode = treeWalker.currentNode;
		}
		else{
			textNode = treeWalker.nextNode();
		}

		while( textNode && !done) {
			var matches = Anchors.getCurrentNodeMatches(pointer, treeWalker);
			for (i = 0; i < matches.length; i++) {
				result = matches[i];
				if(matches[i].confidence > 0){
					possibleNodes.push(matches[i]);
				}
				//100% sure, that is the best we can do
				if(matches[i].confidence === 1){
					done = true;
					break;
				}
			}
			if (done){break;}

			//Start the context search over in the next textnode
			textNode = treeWalker.nextNode();
		}

		//If we made it through the tree without finding
		//a node we failed
		if(possibleNodes.length === 0){
			return {confidence: 0};
		}

		var node = null;
		//Did we stop because we found a perfect match?
		if(possibleNodes[possibleNodes.length - 1].confidence === 1){
			result = possibleNodes[possibleNodes.length - 1];
		}
		else{
			//Not a perfect match, if we are in a properly
			//resolved reference node we want the thing that
			//makes us the largest range.  If not we fail to resolve
			if(!foundReferenceNode){
				//TODO hmm so if we failed to resolve the reference node and we fell back
				//to looking in the ancestor we don't do any partial matching.  We should
				//reevaluate this decision.  In something like the mathcounts case where we have stuff anchored
				//to non stable ids that have changed we end up never partial matching.
				//Instead of doing that maybe instead of not trying to partial match we just take a 
				//deduciton from the overal confidence.
				console.warn('Ignoring fuzzy matching because we could not resolve the pointers ancestor', pointer, 
							 'and we fell back to just looking in the whole descriptions ancestor', ancestorNode);
				console.warn('Possible matches were', possibleNodes);
				return {confidence: 0};
			}
			else{
				//We want the best match
				var totalConfidenceScores = 0;
				if (result === null){result = {confidence: 0};}
				for (i = 0; i < possibleNodes.length; i++) {
					totalConfidenceScores += possibleNodes[i].confidence;
					if (possibleNodes[i].confidence > result.confidence) {
						result = possibleNodes[i];
					}
				}
				result.confidence *= 1 / totalConfidenceScores;
			}
		}
		return result;
	},

	getCurrentNodeMatches: function(pointer, treeWalker) {
		function multiIndexOf(str,tomatch) { 
			var all = [], next = -2;
			while (next !== -1) {
				next = str.indexOf(tomatch,next + 1);
				if (next !== -1){all.push(next);}
			}
			return all;
		}

		function getPrimaryContextMatches(context, node, isStart) {
			if (!node){return [];}

			var allmatches = [],
				adjustedOffset = context.contextOffset,
				nodeContent = node.textContent,
				i, f, score;


			if(isStart){
				adjustedOffset = node.textContent.length - adjustedOffset;
			}
			var p = multiIndexOf(nodeContent,context.contextText);
			for (i = 0; i < p.length; i++) {
				//Penalzies score based on disparity between expected
				//and real offset. For longer paragraphs, which we
				//expect will have larger and more changes made to them,
				//we relax the extent of the penalty
				f = Math.sqrt(node.textContent.length) * 2 + 1;
				score = f / (f + Math.abs(p[i] - adjustedOffset));
				if (score < 0.25){score = 0.25;}
				allmatches.push({offset: p[i] + pointer.getEdgeOffset(),
								 node: currentNode,
								 confidence: score});
			}
			return allmatches;
		}
		function secondaryContextMatch(context, node, isStart){
			if (!node){return 0;}
			if (node.nodeType === node.ELEMENT_NODE){return context.contextText === '';}
			var adjustedOffset = context.contextOffset;

			if(isStart){adjustedOffset = node.textContent.length - adjustedOffset;}
			return node.textContent.substr(adjustedOffset).indexOf(context.contextText) === 0;
		}

		var currentNode = treeWalker.currentNode,
			lookingAtNode = currentNode,
			isStart = pointer.getRole() === 'start',
			siblingFunction = isStart ? treeWalker.previousNode : treeWalker.nextNode,
			numContexts = pointer.getContexts().length,
			contextObj = pointer.getContexts()[0],
			matches = getPrimaryContextMatches(contextObj, lookingAtNode, isStart),
			i, c;

		var confidenceMultiplier = 1;
		lookingAtNode = siblingFunction.call(treeWalker);

		if (matches.length > 0) {
			for (i = 1; i < numContexts; i++ ){
				contextObj = pointer.getContexts()[i];
	
				c = secondaryContextMatch(contextObj, lookingAtNode, isStart);
				if( !c ){
					confidenceMultiplier *= i / (i+0.5);
					break;
				}
				//That context matched so we continue verifying.
				lookingAtNode = siblingFunction.call(treeWalker);
			}
		}

		//If we don't have a full set of contexts.  lookingAtNode
		//should be null here.  If it isn't, then we might have a problem
		if(confidenceMultiplier === 1){
			if(!Anchors.containsFullContext(pointer) && lookingAtNode){
				if (lookingAtNode) {
					confidenceMultiplier *= numContexts / (numContexts + 0.5);
				}
			}
		}
		for (i = 0; i < matches.length; i++) {
			matches[i].confidence *= confidenceMultiplier;
		}
		treeWalker.currentNode = currentNode;
		return matches;
	},


	containsFullContext: function(pointer){
		//Do we have a primary + 5 additional?

		if(!pointer.getContexts()){
				return false;
		}

		if(pointer.getContexts().length >= 6){
				return true;
		}

		//Maybe we have 5 characters of additional context
		var i,
			chars = 0;

		for(i = 1; i< pointer.getContexts().length; i++){
				chars += pointer.getContexts()[i].contextText.length;
		}

		return chars >= 15;
	},


	/* tested */
	referenceNodeForNode: function(node, allowsUnsafeAnchors){
		if(!node){
			return null;
		}
		if( Anchors.isNodeAnchorable(node, allowsUnsafeAnchors)){
			return node;
		}
		else{
			return Anchors.referenceNodeForNode(node.parentElement, allowsUnsafeAnchors);
		}
	},


	/* tested */
	makeRangeAnchorable: function(range, docElement) {
		if (!range){Ext.Error.raise('Range cannot be null');}

		var startEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, true),
			endEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, false),
			newRange,
			startOffset = range.startOffset,
			endOffset = range.endOffset;

		//If both anchors are already anchorable, we are done here.
		if(Anchors.isNodeAnchorable(startEdgeNode) && Anchors.isNodeAnchorable(endEdgeNode)){
			return range;
		}

		//Clean up either end by looking for anchorable nodes inward or outward:
		if(!Anchors.isNodeAnchorable(startEdgeNode) ){
			startEdgeNode = Anchors.searchFromRangeStartInwardForAnchorableNode(startEdgeNode);
			startOffset = 0;
		}
		if(!Anchors.isNodeAnchorable(endEdgeNode) ){
			endEdgeNode = Anchors.searchFromRangeEndInwardForAnchorableNode(endEdgeNode);
			if(Ext.isTextNode(endEdgeNode)){endOffset = endEdgeNode.nodeValue.length;}
		}

		//If we still have nothing, give up:
		if (!startEdgeNode || !endEdgeNode) {return null;}

		//If we get here, we got good nodes, figure out the best way to create the range now:
		newRange = docElement.createRange();

		//case 1: a single node
		if (startEdgeNode === endEdgeNode) {
			newRange.selectNodeContents(startEdgeNode);
		}
		//case2: nodes are different, handle each:
		else {
			//start:
			if(Ext.isTextNode(startEdgeNode)){newRange.setStart(startEdgeNode, startOffset);}
	        else{newRange.setStartBefore(startEdgeNode);}
			//end:
			if(Ext.isTextNode(endEdgeNode)){newRange.setEnd(endEdgeNode, endOffset);}
			else{newRange.setEndAfter(endEdgeNode);}
		}

        return newRange;
 },


	/* tested */
	searchFromRangeStartInwardForAnchorableNode: function(startNode) {
        if (!startNode){return null;}


        var walker = document.createTreeWalker(startNode, NodeFilter.SHOW_ALL, null, null),
            temp = startNode, t;

        while (temp){
            if (Anchors.isNodeAnchorable(temp)){
                return temp;
            }
            //advance:
            t = walker.nextNode();
            if (!t){
                t = temp.parentNode ? temp.parentNode.nextSibling : null;
                if (t){walker.currentNode = t;}
                temp = t;
            }
            else{ temp = t; }
        }

        //if we got here, we found nada:
        return null;
	 },


	/* tested */
	searchFromRangeEndInwardForAnchorableNode: function(endNode) {
		//handle simple cases where we can immediatly return
		if(!endNode){ return null; }
		if( Anchors.isNodeAnchorable(endNode)){return endNode;}

		endNode = Anchors.walkDownToLastNode(endNode);

		function recurse(n) {
			if(!n){ return null; }
			if( Anchors.isNodeAnchorable(n)){return n;}

			var recurseOn = n;
			while(!recurseOn.previousSibling && recurseOn.parentNode){
				recurseOn = recurseOn.parentNode;
			}

			if(!recurseOn.previousSibling){
				return null;
			}
			recurseOn = recurseOn.previousSibling;
			recurseOn = Anchors.walkDownToLastNode(recurseOn);

			return Anchors.searchFromRangeEndInwardForAnchorableNode(recurseOn);
		}

		return recurse(endNode);
	},


	/* tested */
	walkDownToLastNode: function(node){
		if (!node){Ext.Error.raise('Node cannot be null');}

		var workingNode = node,
			result = workingNode;

		while(workingNode){
			workingNode = workingNode.lastChild;
			if(workingNode){result = workingNode;}
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
		if(Ext.isTextNode(container)){
			return container;
		}

		if(start){
			//If we are at the front of the range
			//the first full node in the range is the containers ith child
			//where i is the offset
			var cont = container.childNodes.item(offset);
			if(!cont) {
				return container;
			}
			else if (Ext.isTextNode(cont) && cont.textContent.trim().length < 1) {
				return container;
			}
			else {
				return container.childNodes.item(offset);
			}
		}
		else{
			//At the end the first fully contained node is
			//at offset-1
			if(offset < 1){
				if(container.previousSibling){
					return container.previousSibling;
				}
				while(!container.previousSibling && container.parentNode && offset !== 0){
					container = container.parentNode;
				}

				if (!container.previousSibling){
					//Ext.Error.raise('No possible node');
					return container;
				}
				else {
					return container.previousSibling;
				}
			}
			return container.childNodes.item(offset - 1);
		}
	},


	/* tested */
	isNodeAnchorable: function(node, allowUnsafeAnchors){
		//obviously not if node is not there
		if (!node) {return false;}

		//distill the possible ids into an id var for easier reference later
		var id = node.id || (node.getAttribute ? node.getAttribute('id') : null),
            ntiid = node.getAttribute ? node.getAttribute('data-ntiid') : null,
			nonAnchorable = node.getAttribute ? node.getAttribute('data-non-anchorable'): false;

		if (nonAnchorable) {return false;}

		//Most common is text
		if( Ext.isTextNode(node)){
			//We don't want to try to anchor to empty text nodes
			if( node.nodeValue.trim().length < 1 ){
				return false;
			}
			return true;
		}

        if (ntiid) {
            return true;
        }

		//no mathjax ids allowd
		else if (id && id.indexOf("MathJax") !== -1) {
			return false;
		}

		//no extjs ids allowd
		else if (id && id.indexOf("ext-gen") !== -1) {
			return false;
		}

        else if (!allowUnsafeAnchors && id && /^a[0-9]*$/.test(id)) {
            return false; //ugly non reliable anchor
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
	},


	/* tested */
	purifyRange: function(range, doc){
		var docFrag,
			extElement,
			tempRange = doc.createRange(),
			parentContainer,
			nodeToInsertBefore,
			origStartNode = range.startContainer,
			origEndNode = range.endContainer,
			origStartOff = range.startOffset,
			origEndOff = range.endOffset,
			resultRange,
			ancestor = range.commonAncestorContainer;

		//make sure the common ancestor is anchorable, otherwise we have a problem, climb to one that is
		while(ancestor && (!Anchors.isNodeAnchorable(ancestor) || Ext.isTextNode(ancestor))){
			ancestor = ancestor.parentNode;
		}
		if (!ancestor){
			Ext.Error.raise('No anchorable nodes in heirarchy');
		}

		//start by normalizing things, just to make sure it's normalized from the beginning:
		ancestor.normalize();
        //Ext.fly(ancestor).clean(); TODO - maybe clean and remove whitespace?

		//apply tags to start and end:
		Anchors.tagNode(origStartNode, 'start');
		Anchors.tagNode(origEndNode, 'end');
		if (Ext.isIE9) { //IE9 bumps up the nodes of these ranges to their parents when they're tagged
			range.setStart(origStartNode, origStartOff);
			range.setEnd(origEndNode, origEndOff);
		}

		//setup our copy range
		tempRange.selectNode(ancestor);
		docFrag = tempRange.cloneContents();

		//return original range back to it's original form:
		Anchors.cleanNode(origStartNode, 'start');
		Anchors.cleanNode(origEndNode, 'end');
		range.setStart(origStartNode, origStartOff);
		range.setEnd(origEndNode, origEndOff);

		//clean the node of undesirable things:
		Anchors.purifyNode(docFrag);

		//at this point we know the range ancestor is stored in the 'a' variable, now that the data is cleaned and
		//normalized, we need to find the range's start and end points, and create a fresh range.
		var startNode = Anchors.findTaggedNode(docFrag, 'start');
		var endNode = Anchors.findTaggedNode(docFrag, 'end');
		var newStartOffset = Anchors.cleanNode(startNode, 'start');
		var newEndOffset = Anchors.cleanNode(endNode, 'end');

		//some adjustment if the text nodes are the same then the start offset will be wrong
		if (origStartNode === origEndNode) {
			newStartOffset -= ('['+Anchors.PURIFICATION_TAG+':end]').length;
		}

		//build the new range divorced from the dom and return:
		resultRange = doc.createRange();
		if (!startNode && !Ext.isTextNode(endNode)){
			resultRange.selectNodeContents(endNode);
		}
		else {
			resultRange.selectNodeContents(docFrag);
			resultRange.setStart(startNode, newStartOffset + origStartOff);
			resultRange.setEnd(endNode, newEndOffset + origEndOff);
		}

		//for use whenever someone wants to know where this fits in the doc.
		resultRange.ownerNode = range.commonAncestorContainer.parentNode;
		return resultRange;
	},

	purifyNode: function(docFrag) {
		if (!docFrag){Ext.Error.raise('must pass a node to purify.');}

		var parentContainer, nodeToInsertBefore;

		//remove any action or counter spans and their children:
		(new Ext.CompositeElement(Ext.fly(docFrag).query('span.application-highlight.counter'))).remove();
		(new Ext.CompositeElement(Ext.fly(docFrag).query('span.redactionAction'))).remove();
		(new Ext.CompositeElement(Ext.fly(docFrag).query('span.blockRedactionAction'))).remove();

		//loop over elements we need to remove and, well, remove them:
		Ext.each(Ext.fly(docFrag).query('[data-non-anchorable]'), function(n){
			if (n.parentNode){
				parentContainer = n.parentNode;
				nodeToInsertBefore = n;
					Ext.each(n.childNodes, function(c){
					parentContainer.insertBefore(c, nodeToInsertBefore);
				});
			}
			else{
				Ext.Error.raise('Non-Anchorable node has no previous siblings or parent nodes.');
			}

			//remove non-anchorable node
			parentContainer.removeChild(nodeToInsertBefore);
		});
		function fallbackNormalize(node) {
			var i = 0, nc = node.childNodes;
			while (i < nc.length) {
				while (nc[i].nodeType === node.TEXT_NODE && i+1 < nc.length && nc[i+1].nodeType === node.TEXT_NODE) {
					nc[i].data += nc[i+1].data;	
					node.removeChild(nc[i+1]);
				}
				fallbackNormalize(nc[i]);
				i += 1;
			}
		}
		if (Ext.isIE9) { fallbackNormalize(docFrag); }
		docFrag.normalize();
		return docFrag;
	},



	/* tested */
	tagNode: function(node, tag){
		var attr = Anchors.PURIFICATION_TAG;

		if (Ext.isTextNode(node)){
			node.textContent = '['+attr+':'+tag+']' + node.textContent;
		}
		else {
			node.setAttribute(attr, tag);
		}
	},


	/* tested */
	cleanNode: function(node, tag){
		var attr = Anchors.PURIFICATION_TAG,
			tagSelector, offset;

		//generic protection:
		if (!node){return null;}

		if (Ext.isTextNode(node)) {
			tagSelector = '['+attr+':'+tag+']';
			offset = node.textContent.indexOf(tagSelector);
			if ( offset >= 0 ) {
				node.textContent = node.textContent.replace(tagSelector, '');
			}
		}
		else {
			node.removeAttribute(attr);
		}
		return offset;
	},


	/* tested */
	findTaggedNode: function(root, tag) {
		var walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, null, null),
			attr = Anchors.PURIFICATION_TAG,
			selector = '['+attr+':'+tag+']',
			temp = root,
			a;

		while (temp){
			if (Ext.isTextNode(temp)){
				if (temp.textContent.indexOf(selector) >= 0) {
					return temp; //found it
				}
			}
			else if (temp.getAttribute) {
				a = temp.getAttribute(attr);
				if (a && a === tag) {
					return temp;
				}

			}
			else {
				console.warn('skipping node while looking for tag', temp);
			}

			//advance:
			temp = walker.nextNode();
		}

		return null;
	},


	//TODO - testing
	toReferenceNodeXpathAndOffset: function( result ){
		//get a reference node that is NOT a text node...
		var referenceNode = Anchors.referenceNodeForNode(result.node, true);
		while(referenceNode && Ext.isTextNode(referenceNode)){
			referenceNode = Anchors.referenceNodeForNode(referenceNode.parentNode, true);
		}
		if (!referenceNode) {
			Ext.Error.raise('Could not locate a valid ancestor');
		}


		//TODO - must be a Node, not txt?
		var referencePointer = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {node: referenceNode, role: 'ancestor'});

		var adaptedResult = {};

		adaptedResult.referencePointer = referencePointer;
		adaptedResult.offset = result.offset;

		if(result.node !== referenceNode){
			var parts = [];

			var node = result.node;

			while(node && node !== referenceNode){
				parts.push(Anchors.indexInParentsChildren(node).toString());
				node = node.parentNode;
			}

			adaptedResult.xpath = parts.join('/');
		}

		return adaptedResult;
	},


	//TODO - testing
	indexInParentsChildren: function(node){
		var i = 0;
		while( (node = node.previousSibling) !== null ){
			i++;
		}
		return i;
	},


	convertStaticResultToLiveDomContainerAndOffset: function( staticResult, docElement ) {
		if(!staticResult){return null;}

		var result,
			referenceNode = staticResult.referencePointer.locateRangePointInAncestor(docElement.body).node,
			container,
			parts,
			kids,
			part,
			lastPart;

		if(!referenceNode){return null;}

		referenceNode.normalize();

		if(!staticResult.xpath){
			return {container: referenceNode};
		}

		container = referenceNode;
		parts = staticResult.xpath.split('/');

		while( parts.length > 1 ){

			if(container.nodeType === Node.TEXT_NODE){
				console.error('Expected a non text node.  Expect errors', container);
			}

			kids = container.childNodes;
			part = parseInt(parts.pop(), 10);

			if(part >= kids.length){
				console.error('Invalid xpath '+staticResult.xpath+' from node', referenceNode);
				return null;
			}

			result = Anchors.ithChildAccountingForSyntheticNodes(container, part, null);
			container = result.container;
		}

		lastPart = parseInt(parts.pop(), 10);
		result = Anchors.ithChildAccountingForSyntheticNodes(container, lastPart, staticResult.offset);

		return result;
	},


	//TODO - testing
	ithChildAccountingForSyntheticNodes: function( node, idx, offset){
		if(idx < 0 || !node.firstChild){
			return null;
		}

		var childrenWithSyntheticsRemoved = Anchors.childrenIfSyntheticsRemoved(node),
			i = 0,
			child,
			adjustedIdx = 0,
			result,
			textNode,
			limit;

		//Short circuit the error condition
		if( idx >= childrenWithSyntheticsRemoved.length ){
			return null;
		}

		//We assume that before synthetic nodes the dom was normalized
		//That means when iterating here we skip consecutive text nodes
		while(i < childrenWithSyntheticsRemoved.length ){
			child = childrenWithSyntheticsRemoved[i];

			if(adjustedIdx === idx){
				break;
			}

			//If child is a textNode we want to advance to the last
			//nextnode adjacent to it.
			if( child.nodeType === Node.TEXT_NODE ){
				while(i < childrenWithSyntheticsRemoved.length - 1
					&& childrenWithSyntheticsRemoved[i+1].nodeType === Node.TEXT_NODE ){
					i++;
				}
			}

			//Advance to the next child
			i++;
			adjustedIdx++;
		}

		if(!child || adjustedIdx !== idx){
			return null;
		}

		//We've been asked to resolve an offset at the same time
		if(offset !== null){
			//If the container isn't a text node, the offset is the ith child
			if(child.nodeType !== Node.TEXT_NODE){
				result = {container: Anchors.ithChildAccountingForSyntheticNodes( child, offset, null)};
				//console.log('Returning result from child is not textnode branch', result);
				return result;
			}
			else{
				while( i < childrenWithSyntheticsRemoved.length){
					textNode = childrenWithSyntheticsRemoved[i];
					if(textNode.nodeType !== Node.TEXT_NODE){
						break;
					}

					//Note <= range can be at the very end (equal to length)
					limit = textNode.textContent.length;
					if(offset <= limit){
						result = {container: textNode, offset: offset};
						return result;
					}

					offset = offset - limit;
					i++;
				}

				console.error('Can\'t find offset in joined textNodes');
				return null;
			}
		}

		return {container: child};
	},

	//TODO -testing
	//TODO - this can probably somehow be replaced with a purifiedNode call, rather than the logic that skips text nodes and subtracts offsets etc.
	childrenIfSyntheticsRemoved: function(node){
		var sanitizedChildren = [];

		var i,
			children = node.childNodes,
			child;

		if (Ext.fly(node).is('span.application-highlight.counter') ||
			Ext.fly(node).is('span.redactionAction') ||
			Ext.fly(node).is('span.blockRedactionAction')) {
			//ignore children:
			//console.log('ignoring children of', node, 'when finding non synthetic kids');
			return [];
		}

		for( i = 0; i < children.length; i++ ){
			child = children[i];
			if( child.getAttribute && child.getAttribute('data-non-anchorable') ){
				sanitizedChildren = sanitizedChildren.concat(Anchors.childrenIfSyntheticsRemoved(child));
			}
			else{
				sanitizedChildren.push(child);
			}
		}
		return sanitizedChildren;
	},


	/* tested */
	cleanRangeFromBadStartAndEndContainers: function(range){
		function isBlankTextNode(n){
			return (Ext.isTextNode(n) && n.textContent.trim().length===0);
		}

		var startContainer = range.startContainer,
			endContainer = range.endContainer,
			ancestor = Ext.isTextNode(range.commonAncestorContainer) ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer,
			txtNodes = AnnotationUtils.getTextNodes(ancestor),
			index = 0, i;


		if (isBlankTextNode(startContainer)) {
			console.log('found a range with a starting node that is nothing but whitespace');
			index = Ext.Array.indexOf(txtNodes, startContainer);
			for(i = index; i < txtNodes.length; i++){
				 if (!isBlankTextNode(txtNodes[i])) {
					 range.setStart(txtNodes[i], 0);
					 break;
				 }
			}
		}

		if (isBlankTextNode(endContainer)) {
			console.log('found a range with a end node that is nothing but whitespace');
			index = Ext.Array.indexOf(txtNodes, endContainer);
			for(i = index; i >= 0; i--){
				 if (!isBlankTextNode(txtNodes[i])) {
					 range.setEnd(txtNodes[i], txtNodes[i].textContent.length);
					 break;
				 }
			}
		}
		return range;
	},


	isMathChild: function(node) {
		if (!node){return false;}
		if(!Ext.isTextNode(node) && Ext.fly(node).hasCls('math')) {
			//top level math is not a math child :)
			return false;
		}

		return !!Ext.fly(node).up('.math');
	},


	expandRangeToIncludeMath: function(range) {
		if (!range){return null;}

		if(Anchors.isMathChild(range.startContainer)){
			range.setStartBefore(Ext.fly(range.startContainer).up('.math').dom);
		}

		if(Anchors.isMathChild(range.endContainer)){
			range.setEndAfter(Ext.fly(range.endContainer).up('.math').dom);
		}
	},


	expandSelectionToIncludeMath: function(sel){
		var range = sel.getRangeAt(0);
		if (range){
			sel.removeAllRanges();
			Anchors.expandRangeToIncludeMath(range);
			sel.addRange(range);
		}

		return sel;
	},

	/*
	 * Snap the selection to whole words as opposed to partial words.  This code is taken and only
	 * minimally adjusted, from here:
	 * http://stackoverflow.com/questions/10964016/how-do-i-extend-selection-to-word-boundary-using-javascript-once-only/10964743#10964743
	 */
	snapSelectionToWord: function(doc) {
		var sel = rangy.getSelection(doc),
			r = sel.getRangeAt(0);

		//if selection is collapsed, don't expand.
		if (r.collapsed){return;}

		r.expand('word');
		Anchors.expandRangeToIncludeMath(r);
		sel.setSingleRange(r);
	}

},
function(){
	window.Anchors = this;
	function rangyReady(){
//		console.log('rangy ready...');
		if(!window.rangy || !rangy.modules.TextRange){
			setTimeout(rangyReady, 100);
			return;
		}
		rangy.init();
	}
	rangyReady();
});
