export default Ext.define('NextThought.util.Anchors', {
	requires: [
		'NextThought.model.anchorables.TextDomContentPointer',
		'NextThought.model.anchorables.ElementDomContentPointer',
		'NextThought.model.anchorables.DomContentPointer',
		'NextThought.model.anchorables.ContentRangeDescription',
		'NextThought.util.Ranges'
	],

	containerSelectors: ['object[type$=naquestion][data-ntiid]', 'object[type$=ntivideo][data-ntiid]'],

	singleton: true,

	//To control some logging
	isDebug: false,

	PURIFICATION_TAG: 'data-nti-purification-tag',
	NON_ANCHORABLE_ATTRIBUTE: 'data-non-anchorable',
	NO_ANCHORABLE_CHILDREN_ATTRIBUTE: 'data-no-anchors-within',


	isNodeIgnored: function(node) {
		return Boolean(node.getAttribute(this.NON_ANCHORABLE_ATTRIBUTE) ||
					   node.getAttribute(this.NO_ANCHORABLE_CHILDREN_ATTRIBUTE));
	},


	IGNORE_WHITESPACE_TEXTNODES: true,
	IGNORE_WHITESPACE_TEXTNODE_FILTER: {
		acceptNode: function(node) {
			if (node.nodeType === 3) {
				if (Ext.isEmpty(node.textContent.trim())) {
					return NodeFilter.FILTER_REJECT;
				}
			}
			return NodeFilter.FILTER_ACCEPT;
		}
	},


	getWhitespaceFilter: function() {
		if (!this.IGNORE_WHITESPACE_TEXTNODES) {
			return null;
		}

		//Sigh. Imagine that, some browsers want a proper NodeFilter and some want just a function.
		//See http://stackoverflow.com/questions/5982648/recommendations-for-working-around-ie9-treewalker-filter-bug
		var safeFilter = this.IGNORE_WHITESPACE_TEXTNODE_FILTER.acceptNode;
		safeFilter.acceptNode = this.IGNORE_WHITESPACE_TEXTNODE_FILTER.acceptNode;
		return safeFilter;
	},


	//Is this a content range description we know how to deal with.
	//We handle non nil values that are empty or dom content range descriptions
	supportedContentRange: function(contentRangeDescription) {
		if (!contentRangeDescription) {
			return false;
		}

		return contentRangeDescription.isEmpty || contentRangeDescription.isDomContentRangeDescription;
	},


	//FIXME we run into potential problems with this is ContentRangeDescriptions ever occur in different documents
	//or locations but have the same container id.  That seem unlikely but may Need to figure that out eventually
	preresolveLocatorInfo: function(contentRangeDescriptions, docElement, cleanRoot, containers, docElementContainerId) {
		var virginContentCache = {},
				locatorsFound = 0;

		docElementContainerId = docElementContainerId || Anchors.rootContainerIdFromDocument(docElement);

		if (!contentRangeDescriptions || (containers && contentRangeDescriptions.length !== containers.length)) {
			Ext.Error.raise('toDomRanges requires contentRangeDescriptions and containers to be the same length if containers provided');
		}

		function getVirginNode(node) {
			var theId = node.getAttribute('id'),
					key = theId || node,
					clean;

			if (!node) {
				return null;
			}

			clean = virginContentCache[node];
			if (!clean) {
				clean = node.cloneNode(true);
				virginContentCache[key] = clean;
			}
			return clean;
		}

		function cacheLocatorForDescription(desc, docElement, cleanRoot, containerId, docElementContainerId) {
			var searchWithin, ancestorNode, virginNode, locator = null;

			if (!containerId) {
				console.warn('No container id provided will assume root without validating container');
			}
			if (!Anchors.supportedContentRange(desc)) {
				console.warn('nothing to parse?');
				return;
			}

			if (desc.isEmpty || Anchors.cachedLocatorEnsuringDocument(desc, docElement)) {
				locatorsFound++;
				return;
			}

			searchWithin = Anchors.scopedContainerNode(cleanRoot, containerId, docElementContainerId);
			if (!searchWithin) {
				Ext.Error.raise('Unable to find container ' + containerId + ' in provided doc element');
			}

			ancestorNode = desc.getAncestor().locateRangePointInAncestor(searchWithin).node || searchWithin;
			if (!ancestorNode) {
				Ext.Error.raise('Failed to get ancestor node for description. ' + desc + ' This should happen b/c we should default to ' + searchWithin);
			}

			virginNode = getVirginNode(ancestorNode);

			try {
				if (Anchors.resolveCleanLocatorForDesc(desc, virginNode, docElement)) {
					locatorsFound++;
				}
			}
			catch (e) {
				console.error('Error resolving locator for desc', desc, Globals.getError(e));
			}
		}

		//First step is build all the locators cloning and purifying the least
		//amount possible.  That is one of the places the profiler indicated problems
		Ext.each(contentRangeDescriptions, function(desc, idx) {
			var containerId = containers ? containers[idx] : null;
			try {
				cacheLocatorForDescription(desc, docElement, cleanRoot, containerId, docElementContainerId);
			}
			catch (e) {
				console.error('Unable to generate locator for desc', Globals.getError(e));
				Globals.getError(e);
			}
		});

		console[locatorsFound === contentRangeDescriptions.length ?
				'log' : 'warn']('Preresolved ' + locatorsFound + '/' + contentRangeDescriptions.length + ' range descriptions');
	},


	toDomRange: function(contentRangeDescription, docElement, cleanRoot, containerId, docElementContainerId) {
		var ancestorNode, resultRange, searchWithin, locator;

		if (!Anchors.supportedContentRange(contentRangeDescription)) {
			console.warn('nothing to parse?');
			return null;
		}

		docElementContainerId = docElementContainerId || Anchors.rootContainerIdFromDocument(docElement);

		try {

			if (!containerId) {
				console.log('No container id provided will use root without validating container ids');
			}

			//FIXME we run into potential problems with this is ContentRangeDescriptions ever occur in different documents
			//or locations but have the same container id.  That seem unlikely but may Need to figure that out eventually
			//Optimization shortcut, if we have a cached locator use it
			//TODO a potential optimization here is that if locator() is defined but null return null.  We already tried
			//to resolve it once and it failed.  Right now we try again but in reality nothing changes between when we
			//preresolve the locator and now
			locator = Anchors.cachedLocatorEnsuringDocument(contentRangeDescription, docElement);
			if (locator) {
				return Anchors.convertContentRangeToDomRange(locator.start, locator.end, locator.doc);
			}


			if (contentRangeDescription.isEmpty) {
				return Anchors.createEmptyContentRangeDescription(docElement, containerId, docElementContainerId);
			}

			if (!cleanRoot) {
				cleanRoot = (docElement.body || this.findElementsWithTagName(docElement, 'body')[0] || docElement).cloneNode(true);
				Anchors.purifyNode(cleanRoot);
			}

			searchWithin = Anchors.scopedContainerNode(cleanRoot, containerId, docElementContainerId);
			if (!searchWithin) {
				Ext.Error.raise('Unable to find container ' + containerId + ' in provided doc element');
			}
			ancestorNode = contentRangeDescription.getAncestor().locateRangePointInAncestor(searchWithin).node || searchWithin;

			if (!ancestorNode) {
				Ext.Error.raise('Failed to get ancestor node for description. ' + contentRangeDescription +
								' This should happen b/c we should default to ' + searchWithin);
			}

			resultRange = Anchors.resolveSpecBeneathAncestor(contentRangeDescription, ancestorNode, docElement);

			return resultRange;
		}
		catch (e) {
			console.warn('Unable to generate range for description', Globals.getError(e));
			Globals.getError(e);
		}
		return null;
	},


	findElementsWithTagName: function(root, name) {
		if (root.getElementsByTagName) {
			return root.getElementsByTagName(name);
		}
		return root.querySelectorAll(name);
	},


	/*
	 *	Returns a boolean indicating whether or not the provided contentRangeDescription
	 *  can be found in the provided node
	 *
	 *	@param contentRagneDescription must not be null
	 *  @param node the node to look in.  This node must be clean.  IE it must come from the virgin
	 *				content document or it must have been cleaned already
	 *  @param doc the doc or doc fragment that can be used to generate ranges.  If this param is undefined
	 *				node.ownderDocument will be used
	 *
	 *  Note: if we find ourselves using inside a loop over contentRangeDescriptions on the same node
	 *  an optimized versio nof this function should be written and used
	 */
	doesContentRangeDescriptionResolve: function(contentRangeDescription, node, doc) {
		var result, range, theDoc = (node && node.ownerDocument) || doc;

		//Ok so this sucks.  There is a complicated reason why we can't let ourselves
		//use our cached locator for this query.  Basically, the locator gets cached by the owner document
		//that the original range is resolved from.  The problem is sometimes node is a docFragment that
		//we really want the search scoped within, however the docFragment has an owner doc of the main
		//document (one place this happens is presentation mode).  This means that this method could return
		//yes if the contentRangeDescription resolves in nodes ownerdoc even if it is not technically
		//resolved beneath node.  This is partly a result of this method being bolted on to an existing implementation
		//as well as a caching strategy that was devised back when we only ever used the anchor methods on the content
		//fragment.  Unfortunately the easiest, and safest, thing to do about this is prevent the locator from
		//being used.  Double unfortunately, the only way to do that right now is to dump the cached information.
		if (contentRangeDescription) {
			contentRangeDescription.attachLocator(null);
		}

		range = this.locateContentRangeDescription(contentRangeDescription, node, theDoc);


		result = !!range;
		if (range && range.detach) {
			range.detach();
		}
		return result;
	},


	//TODO lots of duplicated code here
	locateContentRangeDescription: function(contentRangeDescription, cleanRoot, doc) {
		var ancestorNode, resultRange, searchWithin, containerId, docElementContainerId,
				docElement = (cleanRoot && cleanRoot.ownerDocument) || doc, locator;

		if (!Anchors.supportedContentRange(contentRangeDescription)) {
			console.warn('nothing to parse?');
			return null;
		}

		docElementContainerId = Anchors.rootContainerIdFromDocument(docElement);

		try {

			if (!containerId) {
				console.log('No container id provided will use root without validating container ids');
			}

			//FIXME we run into potential problems with this is ContentRangeDescriptions ever occur in different documents
			//or locations but have the same container id.  That seem unlikely but may Need to figure that out eventually
			//Optimization shortcut, if we have a cached locator use it
			//TODO a potential optimization here is that if locator() is defined but null return null.  We already tried
			//to resolve it once and it failed.  Right now we try again but in reality nothing changes between when we
			//preresolve the locator and now
			locator = Anchors.cachedLocatorEnsuringDocument(contentRangeDescription, docElement);
			if (locator) {
				return Anchors.convertContentRangeToDomRange(locator.start, locator.end, locator.doc);
			}


			if (contentRangeDescription.isEmpty) {
				return Anchors.createEmptyContentRangeDescription(docElement, containerId, docElementContainerId);
			}

			if (!cleanRoot) {
				cleanRoot = (docElement.body || this.findElementsWithTagName(docElement, 'body')[0] || docElement).cloneNode(true);
				Anchors.purifyNode(cleanRoot);
			}

			searchWithin = Anchors.scopedContainerNode(cleanRoot, containerId, docElementContainerId);
			if (!searchWithin) {
				Ext.Error.raise('Unable to find container ' + containerId + ' in provided doc element');
			}
			ancestorNode = contentRangeDescription.getAncestor().locateRangePointInAncestor(searchWithin).node || searchWithin;

			if (!ancestorNode) {
				Ext.Error.raise('Failed to get ancestor node for description. ' + contentRangeDescription + ' This should happen b/c we should default to ' + searchWithin);
			}

			resultRange = Anchors.resolveCleanLocatorForDesc(contentRangeDescription, ancestorNode, docElement);

			return resultRange;
		}
		catch (e) {
			console.warn('Unable to generate range for description', Globals.getError(e));
		}
		return null;
	},


	createEmptyContentRangeDescription: function(docElement, containerId, rootId) {
		var searchWithin = Anchors.scopedContainerNode(docElement, containerId, rootId), resultRange;

		if (!searchWithin) {
			Ext.Error.raise('Unable to find container ' + containerId + ' in provided docElement');
		}

		//console.debug('Given an empty content range description, returning a range wrapping the container', searchWithin);
		resultRange = docElement.createRange();
		resultRange.selectNode(searchWithin);
		return resultRange;
	},


	cachedLocatorEnsuringDocument: function(contentRangeDescription, document) {
		var loc = contentRangeDescription.locator();
		if (loc && loc.doc !== document) {
			console.debug('Dumping locator because its from a different doc');
			contentRangeDescription.attachLocator(null);
			loc = null;
		}
		return loc;
	},


	/*tested*/
	scopedContainerNode: function(fragOrNode, containerId, rootId) {
		var searchWithin,
				node = fragOrNode && fragOrNode.body || fragOrNode && this.findElementsWithTagName(fragOrNode, 'body')[0] || fragOrNode;

		if (!containerId) {
			searchWithin = node;
		}
		else {
			searchWithin = (rootId !== containerId) ? Anchors.getContainerNode(containerId, node, null) : node;
		}

		return searchWithin;
	},


	rootContainerIdFromDocument: function(doc) {
		if (!doc) {
			return null;
		}

		var foundContainer, metaNtiidTag,
				head = doc.head || this.findElementsWithTagName(doc, 'head')[0];

		if (head) {
			metaNtiidTag = head.querySelectorAll('meta[name="NTIID"]');
			if (metaNtiidTag && metaNtiidTag.length > 0) {
				if (metaNtiidTag.length > 1) {
					console.error('Encountered more than one NTIID meta tag. Using first, expect problems', metaNtiidTag);
				}
				metaNtiidTag = metaNtiidTag[0];
			}
			else {
				metaNtiidTag = null;
			}
			if (metaNtiidTag) {
				foundContainer = metaNtiidTag.getAttribute('content');
			}
		}
		return foundContainer;
	},


	/* tested */
	createRangeDescriptionFromRange: function(range, docElement) {
		if (!range) {
			console.log('Returning empty ContentRangeDescription for null range');
			return {description: NextThought.model.anchorables.ContentRangeDescription.create({})};
		}

		Anchors.cleanRangeFromBadStartAndEndContainers(range);
		range = Anchors.makeRangeAnchorable(range, docElement);
		if (!range || range.collapsed) {
			console.error('Anchorable range for provided range could not be found', range);
			Ext.Error.raise('Anchorable range for range could not be found');
		}
		var pureRange = Anchors.purifyRange(range, docElement),
			ancestorAnchor,
			ancestorNode = range.commonAncestorContainer,
			result = {};

		if (!pureRange || pureRange.collapsed) {
			console.error('Unable to purify anchorable range', range, pureRange);
			Ext.Error.raise('Unable to purify anchorable range for ContentRangeDescription generation');
		}

		//If the ancestorcontainer is a text node, we want a containing element as per the docs
		//NOTE: use range, not pureRange here because the pureRange's ancestor is probably a doc fragment.
		if (Ext.isTextNode(ancestorNode)) {
			ancestorNode = ancestorNode.parentNode;
		}
		ancestorNode = Anchors.referenceNodeForNode(ancestorNode);

		result.container = this.getContainerNtiid(ancestorNode, docElement);

		ancestorAnchor = NextThought.model.anchorables.ElementDomContentPointer.create({
			node: ancestorNode,
			role: 'ancestor'
		});

		try {
			result.description = NextThought.model.anchorables.DomContentRangeDescription.create({
				start: Anchors.createPointer(pureRange, 'start'),
				end: Anchors.createPointer(pureRange, 'end'),
				ancestor: ancestorAnchor
			});
		} catch (e) {
			console.warn('There was an error generating the description, hopefully the container will do.', Globals.getError(e));
		}
		return result;
	},


	/*
	 *	Returns the node for the supplied container or defaultNode
	 *  if that container can't be found.  If containerId resolves
	 *  to a node that isn't valid as described by getContainerNtiid
	 *  we warn and return the node anyway
	 */
	getContainerNode: function(containerId, root, defaultNode) {
		var result, isContainerNode = false,
			potentials = [];

		if (!containerId) {
			return null;
		}


		if (containerId.indexOf('tag:nextthought.com') >= 0) {
			Ext.each(root.querySelectorAll('[data-ntiid]'), function(x) {
				if (x.getAttribute('data-ntiid') === containerId) {
					potentials.push(x);
				}
			});
		}
		else {
			if (root.getElementById) {
				potentials.push(root.getElementById(containerId));
			}
			else {
				potentials = root.querySelectorAll('[id="' + containerId + '"]');
			}
		}

		if (!potentials || potentials.length === 0) {
			return defaultNode;
		}

		if (potentials.length > 1) {
			//TODO what do we actually do here?
			console.warn('Found several matches for container. Will return first. Bad content?', containerId, potentials);
		}
		result = Ext.fly(potentials[0]);

		Ext.each(Anchors.containerSelectors, function(sel) {
			isContainerNode = Ext.fly(result).is(sel);
			return !isContainerNode;
		});

		if (!isContainerNode) {
			console.warn('Found container we think is an invalid container node', result);
		}

		return result.dom;
	},


	/*
	 *	Finds a containerId for the closet valid container
	 *  of node.  At this point valid cantainers are questions
	 *  with a data-ntiid attribute or the page.  Note we currently
	 *  don't contain things in section-style sub containers.  Support on
	 *  the ds is questionable and other parts of the app (carousel?) will
	 *  need to be reworked
	 */
	getContainerNtiid: function(node, def) {
		var n = Ext.get(node), ntiidAttr = 'data-ntiid',
			containerNode;

		function ancestorOrSelfMatchingSelector(node, sel) {
			if (!node) {
				return false;
			}
			return Ext.fly(node).is(sel) ? node : Ext.fly(node).parent(sel, true);
		}

		function nodeIfObject(n) {
			var node = null;

			if (!n) {
				return null;
			}

			Ext.each(Anchors.containerSelectors, function(sel) {
				node = ancestorOrSelfMatchingSelector(n, sel);
				return node === null;
			}, this);

			return node;
		}

		containerNode = nodeIfObject(node);

		if (containerNode) {
			return containerNode.getAttribute(ntiidAttr);
		}

		//ok its not in a subcontainer, return default
		if (def && !Ext.isString(def)) {
			n = def.getElementById('NTIContent') || {};
			n = n.getAttribute && n.getAttribute('data-page-ntiid');
			if (n) {
				def = n;
			}
		}

		return def;
	},


	doesElementMatchPointer: function(element, pointer) {
		var id = element.id || (element.getAttribute ? element.getAttribute('id') : null);
		return (id === pointer.elementId || (element.getAttribute && element.getAttribute('data-ntiid') === pointer.elementId)) &&
			element.tagName.toUpperCase() === pointer.elementTagName.toUpperCase();
	},


	//TODO - testing
	createPointer: function(range, role, node) {
		var edgeNode = node || Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));

		if (Ext.isTextNode(edgeNode)) {
			return Anchors.createTextPointerFromRange(range, role);
		}

		if (Ext.isElement(edgeNode)) {
			return NextThought.model.anchorables.ElementDomContentPointer.create({
				elementTagName: edgeNode.tagName,
				elementId: edgeNode.getAttribute('data-ntiid') || edgeNode.getAttribute('id'),
				role: role
			});
		}

		console.error('Not sure what to do with this node', node, role);
		Ext.Error.raise('Unable to translate node to pointer');
	},


	/* tested */
	createTextPointerFromRange: function(range, role) {
		if (!range) {
			Ext.Error.raise('Cannot proceed without range');
		}

		var start = role === 'start',
			container = start ? range.startContainer : range.endContainer,
			offset = start ? range.startOffset : range.endOffset,
			contexts = [],
			edgeOffset,
			ancestor,
			parent = container.parentNode,
			referenceNode,
			additionalContext,
			primaryContext,
			normalizedOffset,
			collectedCharacters = 0,
			maxSubsequentContextObjects = 5,
			maxCollectedChars = 15,
			filter = this.getWhitespaceFilter(),
			walker,
			nextSiblingFunction,
			sibling;

		if (!Ext.isTextNode(container)) {
			container = Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));
			offset = role === 'start' ? 0 : container.textContent.length;
		}

		//If we run into a doc fragment here, then we may have to bump out of the fragment:
		if (parent.nodeType === 11) { //DOCUMENT_FRAGMENT_NODE
			parent = range.ownerNode;
		}

		referenceNode = Anchors.referenceNodeForNode(parent);

		ancestor = Anchors.createPointer(range, 'ancestor', referenceNode);

		primaryContext = Anchors.generatePrimaryContext(range, role);

		if (primaryContext) {
			contexts.push(primaryContext);
		}

		//Generate the edge offset
		normalizedOffset = primaryContext.getContextOffset();
		if (start) {
			normalizedOffset = container.textContent.length - normalizedOffset;
		}

		edgeOffset = offset - normalizedOffset;

		//Now we want to collect subsequent context
		walker = document.createTreeWalker(referenceNode, NodeFilter.SHOW_TEXT, filter, false);
		walker.currentNode = container;

		nextSiblingFunction = start ? walker.previousNode : walker.nextNode;

		sibling = nextSiblingFunction.call(walker);
		while (sibling) {
			if (collectedCharacters >= maxCollectedChars ||
				contexts.length - 1 >= maxSubsequentContextObjects) { break; }

			additionalContext = Anchors.generateAdditionalContext(sibling, role);
			collectedCharacters += additionalContext.getContextText().length;
			contexts.push(additionalContext);

			sibling = nextSiblingFunction.call(walker);
		}

		return NextThought.model.anchorables.TextDomContentPointer.create({
			role: role,
			contexts: contexts,
			edgeOffset: edgeOffset,
			ancestor: ancestor
		});
	},


	/* tested */
	generateAdditionalContext: function(relativeNode, role) {
		if (!relativeNode) {
			Ext.Error.raise('Node must not be null');
		}
		var contextText = null, offset;
		if (role === 'start') {
			contextText = Anchors.lastWordFromString(relativeNode.textContent);
		}
		else {
			contextText = Anchors.firstWordFromString(relativeNode.textContent);
		}

		if (!contextText && contextText.length === 0) {
			return null;
		}

		offset = relativeNode.textContent.indexOf(contextText);
		if (role === 'start') {
			offset = relativeNode.textContent.length - offset;
		}

		return NextThought.model.anchorables.TextContext.create({
			contextText: contextText,
			contextOffset: offset
		});
	},


	/* tested */
	generatePrimaryContext: function(range, role) {
		if (!range) {
			Ext.Error.raise('Range must not be null');
		}

		var container = null,
			offset = null,
			contextText, contextOffset, textContent, prefix, suffix;

		if (role === 'start') {
			container = range.startContainer;
			offset = range.startOffset;
		}
		else {
			container = range.endContainer;
			offset = range.endOffset;
		}

		if (!Ext.isTextNode(container)) {
			container = Anchors.nodeThatIsEdgeOfRange(range, (role === 'start'));
			offset = role === 'start' ? 0 : container.textContent.length;
		}

		//For the primary context we want a word on each side of the
		//range
		textContent = container.textContent;
		if (!textContent || textContent.length === 0) {
			return null;
		}

		prefix = Anchors.lastWordFromString(textContent.substring(0, offset));
		suffix = Anchors.firstWordFromString(textContent.substring(offset, textContent.length));

		contextText = prefix + suffix;
		contextOffset = textContent.indexOf(contextText);

		//If start then we readjust offset to be from the right side...
		if (role === 'start') {
			contextOffset = textContent.length - contextOffset;
		}

		//console.log('Created Context, TEXT', "'"+textContent+"'", 'CONTEXT', contextText, 'OFFSET', contextOffset);

		return NextThought.model.anchorables.TextContext.create({
			contextText: contextText,
			contextOffset: contextOffset
		});
	},


	/* tested */
	lastWordFromString: function(str) {
		if (str === null || str === undefined) {
			Ext.Error.raise('Must supply a string');
		}
		return (/\S*\s?$/).exec(str)[0];
	},


	/* tested */
	firstWordFromString: function(str) {
		if (str === null || str === undefined) {
			Ext.Error.raise('Must supply a string');
		}
		return (/^\s?\S*/).exec(str)[0];
	},


	resolveCleanLocatorForDesc: function(rangeDesc, ancestor, docElement) {
		var confidenceCutoff = 0.4, loc,
			startResult,
			endResult,
			startResultLocator,
			endResultLocator,
			locatorInfo;

		if (!rangeDesc) {
			Ext.Error.raise('Must supply Description');
		}
		else if (!docElement) {
			Ext.Error.raise('Must supply a docElement');
		}

		loc = Anchors.cachedLocatorEnsuringDocument(rangeDesc, docElement);
		if (loc) {
			//console.debug('Using cached locator info');
			return loc;
		}

		startResult = rangeDesc.getStart().locateRangePointInAncestor(ancestor);
		if (!startResult.node ||
			!startResult.hasOwnProperty('confidence') ||
			startResult.confidence === 0) {
			if (this.isDebug) {
				console.warn('No possible start found for', rangeDesc, startResult);
			}
			return null;
		}

		if (startResult.confidence < confidenceCutoff) {
			if (this.isDebug) {
				console.warn('No start found with an acceptable confidence.', startResult, rangeDesc);
			}
			return null;
		}

		if (startResult.confidence < 1.0) {
			if (this.isDebug) {
				console.log('Matched start with confidence of', startResult.confidence, startResult, rangeDesc);
			}
		}
		else {
			if (this.isDebug) {
				console.log('Found an exact match for start', startResult, rangeDesc);
			}
		}

		endResult = rangeDesc.getEnd().locateRangePointInAncestor(ancestor, startResult);
		if (!endResult.node ||
			!endResult.hasOwnProperty('confidence') ||
			endResult.confidence === 0) {
			if (this.isDebug) {
				console.warn('No possible end found for', rangeDesc, endResult);
			}
			return null;
		}

		if (endResult.confidence < confidenceCutoff) {
			if (this.isDebug) {
				console.warn('No end found with an acceptable confidence.', endResult, rangeDesc);
			}
			return null;
		}

		if (endResult.confidence < 1.0) {
			if (this.isDebug) {
				console.log('Matched end with confidence of', endResult.confidence, endResult, rangeDesc);
			}
		}
		else {
			if (this.isDebug) {
				console.log('Found an exact match for end', endResult, rangeDesc);
			}
		}

		startResultLocator = Anchors.toReferenceNodeXpathAndOffset(startResult);
		endResultLocator = Anchors.toReferenceNodeXpathAndOffset(endResult);

		//Right not rangeDescriptions and the virgin content are immutable so stash the locator
		//on the desc to save work
		locatorInfo = {start: startResultLocator, end: endResultLocator, doc: docElement};
		rangeDesc.attachLocator(locatorInfo);
		return locatorInfo;
	},


	/* tested */
	resolveSpecBeneathAncestor: function(rangeDesc, ancestor, docElement) {
		var locator = Anchors.resolveCleanLocatorForDesc(rangeDesc, ancestor, docElement);
		if (!locator) {
			return null;
		}

		return Anchors.convertContentRangeToDomRange(locator.start, locator.end, locator.doc);
	},


	//TODO - testing
	convertContentRangeToDomRange: function(startResult, endResult, docElement) {

		var liveStartResult = Anchors.convertStaticResultToLiveDomContainerAndOffset(startResult, docElement),
			liveEndResult = Anchors.convertStaticResultToLiveDomContainerAndOffset(endResult, docElement),
			range;

		//		console.log('liveStartResult', liveStartResult, 'liveEndResult', liveEndResult);
		if (!liveStartResult || !liveEndResult) {
			return null;
		}

		range = docElement.createRange();
		if (liveStartResult.hasOwnProperty('offset')) {
			range.setStart(liveStartResult.container, liveStartResult.offset);
		}
		else {
			range.setStartBefore(liveStartResult.container);
		}

		if (liveEndResult.hasOwnProperty('offset')) {
			range.setEnd(liveEndResult.container, liveEndResult.offset);
		}
		else {
			range.setEndAfter(liveEndResult.container);
		}
		return range;
	},


	/* tested */
	locateElementDomContentPointer: function(pointer, ancestor) {
		//only element dom pointers after this point:
		if (!(pointer instanceof NextThought.model.anchorables.ElementDomContentPointer)) {
			Ext.Error.raise('This method expects ElementDomContentPointers only');
		}

		//In these case of the document body (root) we may be the ancestor
		if (Anchors.doesElementMatchPointer(ancestor, pointer)) {
			return {confidence: 1, node: ancestor};
		}

		var theId = pointer.getElementId(),
				potentials = [], parts,
				p, i, r;

		if (theId.indexOf('tag:nextthought.com') === 0) {
			parts = theId.split(',');
			if (parts.length < 2) {
				console.warn('Encountered an ntiid looking id that doesn\'t split by comma');
			}
			else {
				//Note this may not technically be an exact match, but the potentials loop below should weed out any issues
				potentials = ancestor.querySelectorAll('[data-ntiid^="' + parts.first() + '"][data-ntiid$="' + parts.last() + '"]');
			}
		}
		else {
			potentials = ancestor.querySelectorAll('[id="' + theId + '"]');
		}


		for (i in potentials) {
			if (potentials.hasOwnProperty(i)) {
				p = potentials[i];
				if (Anchors.doesElementMatchPointer(p, pointer)) {
					r = {confidence: 1, node: p};
				}
				else if (this.isDebug) {
					console.warn('Potential match doesn\'t match pointer', p, pointer);
				}

				if (r) {
					return r;
				}
			}
		}

		return {confidence: 0};
	},


	/* tested */
	isNodeChildOfAncestor: function(node, ancestor) {
		while (node && node.parentNode) {
			if (node.parentNode === ancestor) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	},


	/* tested */
	locateRangeEdgeForAnchor: function(pointer, ancestorNode, startResult) {
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
			result = {}, matches,
			possibleNodes = [],
			done = false,
			i, filter, node;

		if (root.parentNode) {
			root = root.parentNode;
		}

		referenceNode = pointer.getAncestor().locateRangePointInAncestor(root).node;
		foundReferenceNode = true;
		if (!referenceNode) {
			foundReferenceNode = false;
			referenceNode = ancestorNode;
		}

		isStart = pointer.getRole() === 'start';

		//We use a tree walker to search beneath the reference node
		//for textContent matching our contexts
		filter = this.getWhitespaceFilter();
		treeWalker = document.createTreeWalker(referenceNode, NodeFilter.SHOW_TEXT, filter, false);

		//If we are looking for the end node.  we want to start
		//looking where the start node ended.  This is a shortcut
		//in the event that the found start node is in our reference node
		if (!isStart && startResult && startResult.node && Anchors.isNodeChildOfAncestor(startResult.node, referenceNode)) {

			treeWalker.currentNode = startResult.node;
		}

		//We may be in the same textNode as start
		if (treeWalker.currentNode.nodeType === Node.TEXT_NODE) {
			textNode = treeWalker.currentNode;
		}
		else {
			textNode = treeWalker.nextNode();
		}

		//In the past we had contexts with empty contextText
		//that added no value but made things more fragile.
		//We don't create those anymore but for old data we filter them out.
		//Note we do this here for performance reasons.  It is a more localized change
		//to do this in getCurrentNodeMatches but that gets called for every node we
		//are iterating over.  Maybe there is a better way to architect this since its probably
		//a change that stays in place for ever...
		if (this.getWhitespaceFilter()) {
			pointer.nonEmptyContexts = Ext.Array.filter(pointer.getContexts(), function(c, i) {
				//Always keep the primary.  It should never be empty, but just in case
				if (i === 0) {
					if (Ext.isEmpty(c.contextText.trim())) {
						console.error('Found a primary context with empty contextText.  Where did that come from?', pointer);
					}
					return true;
				}
				return !Ext.isEmpty(c.contextText.trim());
			});
		}
		else {
			pointer.nonEmptyContexts = pointer.getContexts();
		}

		while (textNode && !done) {
			matches = Anchors.getCurrentNodeMatches(pointer, treeWalker);
			for (i = 0; i < matches.length; i++) {
				result = matches[i];
				if (matches[i].confidence > 0) {
					possibleNodes.push(matches[i]);
				}
				//100% sure, that is the best we can do
				if (matches[i].confidence === 1) {
					done = true;
					break;
				}
			}
			if (done) {
				break;
			}

			//Start the context search over in the next textnode
			textNode = treeWalker.nextNode();
		}

		//If we made it through the tree without finding
		//a node we failed
		if (possibleNodes.length === 0) {
			return {confidence: 0};
		}

		node = null;
		//Did we stop because we found a perfect match?
		if (possibleNodes[possibleNodes.length - 1].confidence === 1) {
			result = possibleNodes[possibleNodes.length - 1];
		}
		else {
			//Not a perfect match, if we are in a properly
			//resolved reference node we want the thing that
			//makes us the largest range.  If not we fail to resolve
			if (!foundReferenceNode) {
				//TODO hmm so if we failed to resolve the reference node and we fell back
				//to looking in the ancestor we don't do any partial matching.  We should
				//reevaluate this decision.  In something like the mathcounts case where we have stuff anchored
				//to non stable ids that have changed we end up never partial matching.
				//Instead of doing that maybe instead of not trying to partial match we just take a
				//deduciton from the overal confidence.
				if (this.isDebug) {
					console.info('Ignoring fuzzy matching because we could not resolve the pointers ancestor', pointer, possibleNodes, ancestorNode);
				}
				return {confidence: 0};
			}


			//We want the best match
			//NOTE in the past we were "normalizing" the highest confidence
			//by dividing by the sum of all the confidence values.  Not
			//only is that an improper way to normalize these values,
			//it is counterintuitive to what we are actually trying to do.
			if (result === null) {
				result = {confidence: 0};
			}
			if (this.isDebug) {
				console.log('Searching for best ' + pointer.getRole() + ' match in ', possibleNodes);
			}
			for (i = 0; i < possibleNodes.length; i++) {
				if (possibleNodes[i].confidence > result.confidence) {
					result = possibleNodes[i];
				}
			}

		}
		return result;
	},


	getCurrentNodeMatches: function(pointer, treeWalker) {
		function multiIndexOf(str, tomatch) {
			var all = [], next = -2;
			while (next !== -1) {
				next = str.indexOf(tomatch, next + 1);
				if (next !== -1) {
					all.push(next);
				}
			}
			return all;
		}

		function getPrimaryContextMatches(context, node, isStart) {
			if (!node) {
				return [];
			}

			var allmatches = [],
					adjustedOffset = context.contextOffset,
					nodeContent = node.textContent,
					i, f, p, score;


			if (isStart) {
				adjustedOffset = node.textContent.length - adjustedOffset;
			}

			p = multiIndexOf(nodeContent, context.contextText);
			for (i = 0; i < p.length; i++) {
				//Penalzies score based on disparity between expected
				//and real offset. For longer paragraphs, which we
				//expect will have larger and more changes made to them,
				//we relax the extent of the penalty
				f = Math.sqrt(node.textContent.length) * 2 + 1;
				score = f / (f + Math.abs(p[i] - adjustedOffset));
				if (score < 0.25) {
					score = 0.25;
				}
				allmatches.push({offset: p[i] + pointer.getEdgeOffset(),
					node: currentNode,
					confidence: score});
			}
			return allmatches;
		}

		function secondaryContextMatch(context, node, isStart) {
			if (!node) {
				return 0;
			}
			if (node.nodeType === node.ELEMENT_NODE) {
				return context.contextText === '';
			}
			var adjustedOffset = context.contextOffset;

			if (isStart) {
				adjustedOffset = node.textContent.length - adjustedOffset;
			}
			return node.textContent.substr(adjustedOffset).indexOf(context.contextText) === 0;
		}

		if (pointer.nonEmptyContexts === undefined) {
			console.error('nonEmptyContexts not set. This should only happen when testing');
			pointer.nonEmptyContexts = Ext.Array.filter(pointer.getContexts(), function(c, i) {
				//Always keep the primary.  It should never be empty, but just in case
				if (i === 0) {
					if (Ext.isEmpty(c.contextText.trim())) {
						console.error('Found a primary context with empty contextText.  Where did that come from?', pointer);
					}
					return true;
				}
				return !Ext.isEmpty(c.contextText.trim());
			});
		}

		var currentNode = treeWalker.currentNode,
			lookingAtNode = currentNode,
			isStart = pointer.getRole() === 'start',
			siblingFunction = isStart ? treeWalker.previousNode : treeWalker.nextNode,
			contexts = pointer.nonEmptyContexts, //Caller sets this up
			contextObj = contexts[0],
			numContexts = contexts.length,
			matches = getPrimaryContextMatches(contextObj, lookingAtNode, isStart),
			i, c,
			confidenceMultiplier = 1;

		lookingAtNode = siblingFunction.call(treeWalker);

		if (matches.length > 0) {
			for (i = 1; i < numContexts; i++) {
				contextObj = contexts[i];

				c = secondaryContextMatch(contextObj, lookingAtNode, isStart);
				if (!c) {
					confidenceMultiplier *= i / (i + 0.5);
					break;
				}
				//That context matched so we continue verifying.
				lookingAtNode = siblingFunction.call(treeWalker);
			}
		}

		//If we don't have a full set of contexts.  lookingAtNode
		//should be null here.  If it isn't, then we might have a problem
		if (confidenceMultiplier === 1) {
			//TODO in our handling of past data we assume that if it had a full context
			//before we stripped out the empty Context objects it has full context after that.
			//I think that is the right behaviour for what is intended here.
			if (!Anchors.containsFullContext(pointer) && lookingAtNode) {
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


	containsFullContext: function(pointer) {
		//Do we have a primary + 5 additional?

		if (!pointer.getContexts()) {
			return false;
		}

		if (pointer.getContexts().length >= 6) {
			return true;
		}

		//Maybe we have 5 characters of additional context
		var i,
				chars = 0;

		for (i = 1; i < pointer.getContexts().length; i++) {
			chars += pointer.getContexts()[i].contextText.length;
		}

		return chars >= 15;
	},


	/* tested */
	referenceNodeForNode: function(node, allowsUnsafeAnchors) {
		if (!node) {
			return null;
		}
		if (Anchors.isNodeAnchorable(node, allowsUnsafeAnchors)) {
			return node;
		}

		return Anchors.referenceNodeForNode(node.parentNode, allowsUnsafeAnchors);
	},


	/* tested */
	makeRangeAnchorable: function(range, docElement) {
		if (!range) {
			Ext.Error.raise('Range cannot be null');
		}

		var startEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, true),
				endEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, false),
				newRange,
				startOffset = range.startOffset,
				endOffset = range.endOffset;

		//If both anchors are already anchorable, we are done here.
		if (endEdgeNode === range.endContainer &&
			startEdgeNode === range.startContainer &&
			Anchors.isNodeAnchorable(startEdgeNode) &&
			Anchors.isNodeAnchorable(endEdgeNode)) {
			return range;
		}

		//Clean up either end by looking for anchorable nodes inward or outward:
		if (!Anchors.isNodeAnchorable(startEdgeNode)) {
			startEdgeNode = Anchors.searchFromRangeStartInwardForAnchorableNode(startEdgeNode, range.commonAncestorContainer);
			startOffset = 0;
		}
		if (!Anchors.isNodeAnchorable(endEdgeNode)) {
			endEdgeNode = Anchors.searchFromRangeEndInwardForAnchorableNode(endEdgeNode);
			if (Ext.isTextNode(endEdgeNode)) {
				endOffset = endEdgeNode.nodeValue.length;
			}
		}

		//If we still have nothing, give up:
		if (!startEdgeNode || !endEdgeNode) {
			return null;
		}

		//If we get here, we got good nodes, figure out the best way to create the range now:
		newRange = docElement.createRange();

		//case 1: a single node
		if (startEdgeNode === endEdgeNode) {
			newRange.selectNode(startEdgeNode);
		}
		//case2: nodes are different, handle each:
		else {
			//start:
			if (Ext.isTextNode(startEdgeNode)) {
				newRange.setStart(startEdgeNode, startOffset);
			}
			else {
				newRange.setStartBefore(startEdgeNode);
			}
			//end:
			if (Ext.isTextNode(endEdgeNode)) {
				newRange.setEnd(endEdgeNode, endOffset);
			}
			else {
				newRange.setEndAfter(endEdgeNode);
			}
		}

		return newRange;
	},


	//TODO for these two methods consider skipping over any nodes with 'data-no-anchorable-children'
	//as an optimization. (Probably minor since those are small parts of the tree right now)
	//TODO provide an end we don't go past
	/* tested */
	searchFromRangeStartInwardForAnchorableNode: function(startNode, commonParent) {
		if (!startNode) {
			return null;
		}


		var walker = document.createTreeWalker(commonParent, NodeFilter.SHOW_ALL, null, null),
				temp;

		walker.currentNode = startNode;
		temp = walker.currentNode;

		while (temp) {
			if (Anchors.isNodeAnchorable(temp)) {
				return temp;
			}
			temp = walker.nextNode();
		}

		//if we got here, we found nada:
		return null;
	},


	/* tested */
	//TODO provide a node we don't go past
	searchFromRangeEndInwardForAnchorableNode: function(endNode) {
		//handle simple cases where we can immediatly return
		if (!endNode) {
			return null;
		}
		if (Anchors.isNodeAnchorable(endNode)) {
			return endNode;
		}

		endNode = Anchors.walkDownToLastNode(endNode);

		function recurse(n) {
			if (!n) {
				return null;
			}
			if (Anchors.isNodeAnchorable(n)) {
				return n;
			}

			var recurseOn = n;
			while (!recurseOn.previousSibling && recurseOn.parentNode) {
				recurseOn = recurseOn.parentNode;
			}

			if (!recurseOn.previousSibling) {
				return null;
			}
			recurseOn = recurseOn.previousSibling;
			recurseOn = Anchors.walkDownToLastNode(recurseOn);

			return Anchors.searchFromRangeEndInwardForAnchorableNode(recurseOn);
		}

		return recurse(endNode);
	},


	/* tested */
	walkDownToLastNode: function(node) {
		if (!node) {
			Ext.Error.raise('Node cannot be null');
		}

		var workingNode = node,
				result = workingNode;

		while (workingNode) {
			workingNode = workingNode.lastChild;
			if (workingNode) {
				result = workingNode;
			}
		}

		return result;
	},


	/* tested */
	nodeThatIsEdgeOfRange: function(range, start) {
		return RangeUtils.nodeThatIsEdgeOfRange(range, start);
	},


	/* tested */
	isNodeAnchorable: function(theNode, unsafeAnchorsAllowed) {
		//obviously not if node is not there
		if (!theNode) {
			return false;
		}

		function isNodeItselfAnchorable(node, allowUnsafeAnchors) {
			//distill the possible ids into an id var for easier reference later
			var id = node.id || (node.getAttribute ? node.getAttribute('id') : null),
					ntiid = node.getAttribute ? node.getAttribute('data-ntiid') : null,
					nonAnchorable = node.getAttribute ? node.getAttribute('data-non-anchorable') : false;

			if (nonAnchorable) {
				return false;
			}

			//Most common is text
			if (Ext.isTextNode(node)) {
				//We don't want to try to anchor to empty text nodes
				return node.nodeValue.trim().length > 0;
			}

			if (ntiid) {
				return true;
			}

			//no mathjax ids allowd
			if (id && id.indexOf('MathJax') !== -1) {
				return false;
			}

			//no extjs ids allowd
			if (id && id.indexOf('ext-gen') !== -1) {
				return false;
			}

			if (!allowUnsafeAnchors && id && /^a[0-9]*$/.test(id)) {
				return false; //ugly non reliable anchor
			}

			//If this node had an id and a tagName, then yay node!
			if (id && node.tagName) {
				return true;
			}

			//if not a text node, us it missing an id or a tagname?
			if (!id || !node.tagName) {
				return false;
			}

			//otherwise, assume not
			return false;
		}

		//If the itself is anchorable make sure its not in a parent
		//that claims nothing is anchorable
		if (isNodeItselfAnchorable(theNode, unsafeAnchorsAllowed)) {
			return !Ext.fly(theNode).up('[' + Anchors.NO_ANCHORABLE_CHILDREN_ATTRIBUTE + ']');
		}
		return false;
	},


	/* tested */
	purifyRange: function(range, doc) {
		var docFrag,
			extElement,
			tempRange = doc.createRange(),
			parentContainer,
			nodeToInsertBefore,
			origStartNode = range.startContainer,
			origEndNode = range.endContainer,
			origStartOff = range.startOffset,
			origEndOff = range.endOffset,
			origStartModifiedOff = range.startOffset,
			origEndModifiedOff = range.endOffset,
			origStartEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, true),
			origEndEdgeNode = Anchors.nodeThatIsEdgeOfRange(range, false),
			resultRange,
			ancestor = range.commonAncestorContainer,
			startEdge,
			endEdge,
			newStartOffset,
			newEndOffset;

		//make sure the common ancestor is anchorable, otherwise we have a problem, climb to one that is
		while (ancestor && (!Anchors.isNodeAnchorable(ancestor) || Ext.isTextNode(ancestor))) {
			ancestor = ancestor.parentNode;
		}
		if (!ancestor) {
			Ext.Error.raise('No anchorable nodes in heirarchy');
		}

		//start by normalizing things, just to make sure it's normalized from the beginning:
		ancestor.normalize();
		//Ext.fly(ancestor).clean(); TODO - maybe clean and remove whitespace?

		//apply tags to start and end, note we use the edge nodes so
		//that we can recreate all the range info including the offset, not just the containers

		if (origStartEdgeNode !== origStartNode) {
			origStartModifiedOff = 0;
		}
		if (origEndEdgeNode !== origEndNode) {
			origEndModifiedOff = origEndEdgeNode.textContent.length;
		}


		Anchors.tagNode(origStartEdgeNode, 'start', origStartModifiedOff);
		Anchors.tagNode(origEndEdgeNode, 'end', (origStartEdgeNode === origEndEdgeNode) ? origEndModifiedOff + 33 : origEndModifiedOff);

		//setup our copy range
		tempRange.selectNode(ancestor);
		docFrag = tempRange.cloneContents();

		//return original range back to it's original form:
		Anchors.cleanNode(origStartEdgeNode, 'start');
		Anchors.cleanNode(origEndEdgeNode, 'end');
		range.setStart(origStartNode, origStartOff);
		range.setEnd(origEndNode, origEndOff);

		//clean the node of undesirable things:
		Anchors.purifyNode(docFrag);

		//at this point we know the range ancestor is stored in the 'a' variable, now that the data is cleaned and
		//normalized, we need to find the range's start and end points, and create a fresh range.
		startEdge = Anchors.findTaggedNode(docFrag, 'start');
		endEdge = Anchors.findTaggedNode(docFrag, 'end');

		newStartOffset = Anchors.cleanNode(startEdge, 'start');
		newEndOffset = Anchors.cleanNode(endEdge, 'end');

		//build the new range divorced from the dom and return:
		resultRange = doc.createRange();
		if (!startEdge && !Ext.isTextNode(endEdge)) {
			resultRange.selectNodeContents(endEdge);
		}
		else {
			resultRange.selectNodeContents(docFrag);
			if (Ext.isTextNode(startEdge)) {
				resultRange.setStart(startEdge, newStartOffset);
			}
			else {
				resultRange.setStartBefore(startEdge);
			}

			if (Ext.isTextNode(endEdge)) {
				resultRange.setEnd(endEdge, newEndOffset);
			}
			else {
				resultRange.setEndAfter(endEdge);
			}
		}

		//for use whenever someone wants to know where this fits in the doc.
		resultRange.ownerNode = range.commonAncestorContainer.parentNode;
		return resultRange;
	},


	purifyNode: function(docFrag) {
		if (!docFrag) {
			Ext.Error.raise('must pass a node to purify.');
		}

		var parentContainer, nodeToInsertBefore;

		//remove any action or counter spans and their children:
		// (this can be simplified to Ext.fly(docFrag).select('...').remove()
		(new Ext.CompositeElement(Ext.fly(docFrag).query('span.application-highlight.counter'))).remove();
		(new Ext.CompositeElement(Ext.fly(docFrag).query('span.redactionAction'))).remove();
		(new Ext.CompositeElement(Ext.fly(docFrag).query('span.blockRedactionAction'))).remove();

		//loop over elements we need to remove and, well, remove them:
		Ext.each(Ext.fly(docFrag).query('[data-non-anchorable]'), function(n) {
			if (n.parentNode) {
				parentContainer = n.parentNode;
				nodeToInsertBefore = n;
				Ext.each(n.childNodes, function(c) {
					parentContainer.insertBefore(c, nodeToInsertBefore);
				});
			}
			else {
				Ext.Error.raise('Non-Anchorable node has no previous siblings or parent nodes.');
			}

			//remove non-anchorable node
			parentContainer.removeChild(nodeToInsertBefore);
		});
		function fallbackNormalize(node) {
			var i = 0, nc = node.childNodes;
			while (i < nc.length) {
				while (nc[i].nodeType === node.TEXT_NODE && i + 1 < nc.length && nc[i + 1].nodeType === node.TEXT_NODE) {
					nc[i].data += nc[i + 1].data;
					node.removeChild(nc[i + 1]);
				}
				fallbackNormalize(nc[i]);
				i += 1;
			}
		}

		if (Ext.isIE9) {
			fallbackNormalize(docFrag);
		}
		docFrag.normalize();
		return docFrag;
	},


	/* tested */
	tagNode: function(node, tag, textOffset) {
		var attr = Anchors.PURIFICATION_TAG,
				start, end;

		if (Ext.isTextNode(node)) {
			start = node.textContent.substring(0, textOffset);
			end = node.textContent.substring(textOffset);
			node.textContent = start + '[' + attr + ':' + tag + ']' + end;
		}
		else {
			node.setAttribute(attr + '-' + tag, 'true');
		}
	},


	/* tested */
	cleanNode: function(node, tag) {
		var attr = Anchors.PURIFICATION_TAG,
				tagSelector, offset;

		//generic protection:
		if (!node) {
			return null;
		}

		if (Ext.isTextNode(node)) {
			tagSelector = '[' + attr + ':' + tag + ']';
			offset = node.textContent.indexOf(tagSelector);
			if (offset >= 0) {
				node.textContent = node.textContent.replace(tagSelector, '');
			}
		}
		else {
			node.removeAttribute(attr + '-' + tag);
		}
		return offset;
	},


	/* tested */
	findTaggedNode: function(root, tag) {
		var walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, null, null),
			attr = Anchors.PURIFICATION_TAG,
			selector = '[' + attr + ':' + tag + ']',
			temp = root,
			a;

		while (temp) {
			if (Ext.isTextNode(temp)) {
				if (temp.textContent.indexOf(selector) >= 0) {
					return temp; //found it
				}
			}
			else if (temp.getAttribute) {
				a = temp.getAttribute(attr + '-' + tag);
				if (a) {
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
	toReferenceNodeXpathAndOffset: function(result) {
		//get a reference node that is NOT a text node...
		var adaptedResult = {}, parts, node,
			referencePointer,
			referenceNode = Anchors.referenceNodeForNode(result.node, true);

		while (referenceNode && Ext.isTextNode(referenceNode)) {
			referenceNode = Anchors.referenceNodeForNode(referenceNode.parentNode, true);
		}
		if (!referenceNode) {
			Ext.Error.raise('Could not locate a valid ancestor');
		}


		//TODO - must be a Node, not txt?
		referencePointer = NextThought.model.anchorables.ElementDomContentPointer.create({node: referenceNode, role: 'ancestor'});
		adaptedResult.referencePointer = referencePointer;
		adaptedResult.offset = result.offset;

		if (result.node !== referenceNode) {
			parts = [];
			node = result.node;

			while (node && node !== referenceNode) {
				parts.push(Anchors.indexInParentsChildren(node).toString());
				node = node.parentNode;
			}

			adaptedResult.xpath = parts.join('/');
		}

		return adaptedResult;
	},


	//TODO - testing
	indexInParentsChildren: function(node) {
		var i = 0;
		while ((node = node.previousSibling) !== null) {
			i++;
		}
		return i;
	},


	convertStaticResultToLiveDomContainerAndOffset: function(staticResult, docElement) {
		if (!staticResult) {
			return null;
		}

		var result,
				body = docElement.body || this.findElementsWithTagName(docElement, 'body')[0],
				referenceNode = staticResult.referencePointer.locateRangePointInAncestor(body).node,
				container,
				parts,
				kids,
				part,
				lastPart;

		if (!referenceNode) {
			return null;
		}

		referenceNode.normalize();

		if (!staticResult.xpath) {
			return {container: referenceNode};
		}

		container = referenceNode;
		parts = staticResult.xpath.split('/');

		while (parts.length > 1) {

			if (container.nodeType === Node.TEXT_NODE) {
				console.error('Expected a non text node.  Expect errors', container);
			}

			kids = container.childNodes;
			part = parseInt(parts.pop(), 10);

			if (part >= kids.length) {
				console.error('Invalid xpath ' + staticResult.xpath + ' from node', referenceNode);
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
	ithChildAccountingForSyntheticNodes: function(node, idx, offset) {
		if (idx < 0 || !node.firstChild) {
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
		if (idx >= childrenWithSyntheticsRemoved.length) {
			return null;
		}

		//We assume that before synthetic nodes the dom was normalized
		//That means when iterating here we skip consecutive text nodes
		while (i < childrenWithSyntheticsRemoved.length) {
			child = childrenWithSyntheticsRemoved[i];

			if (adjustedIdx === idx) {
				break;
			}

			//If child is a textNode we want to advance to the last
			//nextnode adjacent to it.
			if (child.nodeType === Node.TEXT_NODE) {
				while (i < childrenWithSyntheticsRemoved.length - 1 && childrenWithSyntheticsRemoved[i + 1].nodeType === Node.TEXT_NODE) {
					i++;
				}
			}

			//Advance to the next child
			i++;
			adjustedIdx++;
		}

		if (!child || adjustedIdx !== idx) {
			return null;
		}

		//We've been asked to resolve an offset at the same time
		if (offset !== null) {
			//If the container isn't a text node, the offset is the ith child
			if (child.nodeType !== Node.TEXT_NODE) {
				result = {container: Anchors.ithChildAccountingForSyntheticNodes(child, offset, null)};
				//console.log('Returning result from child is not textnode branch', result);
				return result;
			}

			while (i < childrenWithSyntheticsRemoved.length) {
				textNode = childrenWithSyntheticsRemoved[i];
				if (textNode.nodeType !== Node.TEXT_NODE) {
					break;
				}

				//Note <= range can be at the very end (equal to length)
				limit = textNode.textContent.length;
				if (offset <= limit) {
					result = {container: textNode, offset: offset};
					return result;
				}

				offset -= limit;
				i++;
			}

			console.error('Can`t find offset in joined textNodes');
			return null;

		}

		return {container: child};
	},


	//TODO -testing
	//TODO - this can probably somehow be replaced with a purifiedNode call, rather than the logic that skips text nodes and subtracts offsets etc.
	childrenIfSyntheticsRemoved: function(node) {
		var sanitizedChildren = [], i,
			children = node.childNodes,
			child;

		if (Ext.fly(node).is('span.application-highlight.counter') ||
			Ext.fly(node).is('span.redactionAction') ||
			Ext.fly(node).is('span.blockRedactionAction')) {
			//ignore children:
			//console.log('ignoring children of', node, 'when finding non synthetic kids');
			return [];
		}

		for (i = 0; i < children.length; i++) {
			child = children[i];
			if (child.getAttribute && child.getAttribute('data-non-anchorable')) {
				sanitizedChildren = sanitizedChildren.concat(Anchors.childrenIfSyntheticsRemoved(child));
			}
			else {
				sanitizedChildren.push(child);
			}
		}
		return sanitizedChildren;
	},


	/* tested */
	cleanRangeFromBadStartAndEndContainers: function(range) {
		function isBlankTextNode(n) {
			return (Ext.isTextNode(n) && n.textContent.trim().length === 0);
		}

		var startContainer = range.startContainer,
				endContainer = range.endContainer,
				ancestor = Ext.isTextNode(range.commonAncestorContainer) ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer,
				txtNodes = AnnotationUtils.getTextNodes(ancestor),
				index = 0, i;


		if (isBlankTextNode(startContainer)) {
			console.log('found a range with a starting node that is nothing but whitespace');
			index = Ext.Array.indexOf(txtNodes, startContainer);
			for (i = index; i < txtNodes.length; i++) {
				if (!isBlankTextNode(txtNodes[i])) {
					range.setStart(txtNodes[i], 0);
					break;
				}
			}
		}

		if (isBlankTextNode(endContainer)) {
			console.log('found a range with a end node that is nothing but whitespace');
			index = Ext.Array.indexOf(txtNodes, endContainer);
			for (i = index; i >= 0; i--) {
				if (!isBlankTextNode(txtNodes[i])) {
					range.setEnd(txtNodes[i], txtNodes[i].textContent.length);
					break;
				}
			}
		}
		return range;
	},


	isMathChild: function(node) {
		if (!node) {
			return false;
		}
		if (!Ext.isTextNode(node) && Ext.fly(node).hasCls('math')) {
			//top level math is not a math child :)
			return false;
		}

		return !!Ext.fly(node).up('.math');
	},


	expandRangeToIncludeMath: function(range) {
		if (!range) {
			return null;
		}

		if (Anchors.isMathChild(range.startContainer)) {
			range.setStartBefore(Ext.fly(range.startContainer).up('.math').dom);
		}

		if (Anchors.isMathChild(range.endContainer)) {
			range.setEndAfter(Ext.fly(range.endContainer).up('.math').dom);
		}
	},


	expandSelectionToIncludeMath: function(sel) {
		var range = sel.getRangeAt(0);
		if (range) {
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
	 * http://stackoverflow.com/questions/19450655/rangy-expands-for-cyrillic
	 */
	snapSelectionToWord: function(doc) {
		try {
			var sel = rangy.getSelection(doc),
				r = sel.rangeCount ? sel.getRangeAt(0) : null;

			//if selection is collapsed, don't expand.
			if (!r || r.collapsed) {
				return;
			}
			/*
			 * \u2018 = fancy left single quote
			 * \u2019 = fancy right single quote
			 * \u201C = fancy left double quote
			 * \u201D = fancy right double quote
			 */

			r.expand('word', {wordRegex: XRegExp('[\\p{L}\\d]+(\'[\\p{L}\\d]+)*', 'gi')});

			Anchors.expandRangeToIncludeMath(r);
			sel.setSingleRange(r);
		}
		catch (e) {
			console.error(e.stack || e.message || e);
		}
	}


});
