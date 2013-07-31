/*jslint */
/*global Anchors, Globals, Node, NodeFilter*/
Ext.define('NextThought.util.Ranges',{
	singleton: true,

	nonContextWorthySelectors: [
		'object:not([type*=nti])'
	],

	saveRange: function(r){
		if(!r){ return null; }
		return{
			startContainer: r.startContainer,
			startOffset: r.startOffset,
			endContainer: r.endContainer,
			endOffset: r.endOffset,
			collapsed:r.collapsed
		};
	},


	saveInputSelection: function(s){
		if (!s || !s.focusNode || !s.focusNode.firstChild || s.focusNode.firstChild.tagName !== 'INPUT'){return null;}
		var i = s.focusNode.firstChild;

		return {
			selectionStart: i.selectionStart,
			selectionEnd: i.selectionEnd,
			input: i
		};
	},


	restoreSavedRange: function(o){
		if(!o){return null;}
		var d, r;

		try {
			d = o.startContainer.ownerDocument;
			r = d.createRange();
			r.setStart(o.startContainer, o.startOffset);
			r.setEnd(o.endContainer, o.endOffset);
		}
		catch(e){
			console.error(e.message);
		}
		return r;
	},


	nodeIfObjectOrInObject: function(node){
		var selector = 'object', n;
		if(!node){
			return null;
		}
		n = Ext.fly(node);
		if(n.is(selector)){
			return n;
		}
		return n.up(selector);
	},


	rangeIfItemPropSpan: function(range, doc){
		/*
		 * Special case for annototable images: We don't want to expand past the annototable img.
		 * And since we usually expand by a given number of characters,
		 * if you have multiple consecutive images, we were getting all of them; which is an unexpected behavior.
		 */
		var node = range.commonAncestorContainer, r, container,
			markupSelector = '[itemprop~=nti-data-markupenabled]';

		if(!node){
			return null;
		}

		if(Ext.fly(node).is(markupSelector)){
			container = node;
		}
		else{
			container = Ext.fly(node).parent(markupSelector, true);
		}

		//If we are an annotatable image make sure we get the enclosing span so that it is
		//annotatable in the note window.
		if(container){
			console.log("we're inside a itemprop span.", container);
			r = document.createRange();
			r.selectNode(container);
			return r;
		}
		return null;
	},


	//How about a registry that maps the mimetype of the object
	//to a handler that knows how to give contents
	contentsForObjectTag: function(object){
		var contents;

		//For questions we look for the contained div with class naquestion
		//Why do we do this instead of cloning the object?
		contents = object.down('.naquestion');
		if(contents){
			return contents.dom.cloneNode(true);
		}

		return object.dom.cloneNode(true);
	},

	nodeThatIsEdgeOfRange: function(range, start){
		if (!range){
			Ext.Error.raise('Node is not defined');
		}

		var container = start ? range.startContainer : range.endContainer,
			offset = start ? range.startOffset : range.endOffset,
			cont;

		//If the container is a textNode look no further, that node is the edge
		if(Ext.isTextNode(container)){
			return container;
		}

		if(start){
			//If we are at the front of the range
			//the first full node in the range is the containers ith child
			//where i is the offset
			cont = container.childNodes.item(offset);
			if(!cont) {
				return container;
			}
			if (Ext.isTextNode(cont) && cont.textContent.trim().length < 1) {
				return container;
			}
			return container.childNodes.item(offset);
		}

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
			return container.previousSibling;
		}
		return container.childNodes.item(offset - 1);
	},

	coverAll: function(rangeA) {
		var range = rangeA ? rangeA.cloneRange() : null,
			start, end, newStart, newEnd;

		function test(c){
			return c.nodeType === Node.TEXT_NODE
				|| Anchors.isNodeIgnored(c)
				|| /^(a|b|i|u|img|li)$/i.test(c.tagName);
//				|| c.childNodes.length === 1;
		}

		function walkOut(node, direction){
			if (!node){return null;}

			var doc = node.ownerDocument,
				walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ALL, null, null),
				nextName = direction === 'start' ? 'previousNode' : 'nextNode',
				temp, result;

			walker.currentNode = node;
			temp = walker.currentNode;
			result = temp;

			while (temp && test(temp)){
				result = temp;
				temp = walker[nextName]();
			}

			//if we got here, we found nada:
			return result;
		}

		if(!range){
			return null;
		}

		start = this.nodeThatIsEdgeOfRange(range, true);
		end = this.nodeThatIsEdgeOfRange(range);

		newStart = walkOut(start, 'start');
		if(newStart){
			range.setStartBefore(newStart);
		}
		newEnd = walkOut(end, 'end');
		if(newEnd){
			range.setEndAfter(newEnd);
		}

		return range;
	},


	expandRange: function(range, doc){
		var object = this.nodeIfObjectOrInObject(range.commonAncestorContainer)
				|| this.nodeIfObjectOrInObject(range.startContainer),
			r;

		if(object) {
			return this.contentsForObjectTag(object);
		}

		r = this.rangeIfItemPropSpan(range, doc);
		if(r){
			return this.clearNonContextualGarbage(r.cloneContents());
		}

		r = this.coverAll(range);
		//Anchors.expandSelectionToIncludeMath(sel);
		return this.clearNonContextualGarbage(r.cloneContents());
	},


	expandRangeGetNode: function(range, doc, dontClone){
		var tempDiv = doc.createElement('div'),
			n = this.expandRange(range);
		try{
			tempDiv.appendChild(n);
		}
		catch(e){
			console.error('Could not clone range contents',Globals.getError(e));
		}
//		if(!dontClone){
//			tempDiv = tempDiv.cloneNode(true);
//		}
		return tempDiv;
	},


	expandRangeGetString: function(range, doc){
		var tempDiv, str;
		tempDiv = this.expandRangeGetNode(range, doc, true);
		str = tempDiv.innerHTML;

		//cleanup:
		Ext.fly(tempDiv).destroy();

		//return string clean of ids:
		return str.replace(/\wid=".*?"/ig, '');
	},


	/**
	 * Removes any nodes we don't want to show up in the context, for now that is assessment objects nodes, which have
	 * a size but no display, so it looks like a bunch of emopty space in the note window.
	 *
	 * @param dom - the dom you want cleaned, make sure it's a clone or you will delete stuff from the dom it belongs to.
	 */
	clearNonContextualGarbage: function(dom){
		Ext.each(this.nonContextWorthySelectors, function(sel){
			Ext.each(Ext.fly(dom).query(sel), function(remove){
				Ext.fly(remove).remove();
			});
		});
		return dom;
	},


	/**
	 * Takes a range or a rangy range and returns the bounding rect
	 * @param r - either a browser range or a rangy range
	 */
	getBoundingClientRect: function(r) {
		if (r.nativeRange) {
			return r.nativeRange.getBoundingClientRect();
		}
		return r.getBoundingClientRect();
	},


	getSelectedNodes: function(range, doc){
		var walker,
			sc = range.startContainer, ec = range.endContainer,
			so = range.startOffset, eo = range.endOffset,
			nodes = [],
			startAt = Ext.isTextNode(sc) ? sc : sc.childNodes[so],
			endAt = Ext.isTextNode(ec) ? ec : ec.childNodes[eo],
			node;

		doc = doc || document;

		//NOTE in every browser but IE the last two params are optional, but IE explodes if they aren't provided

		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		walker = doc.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT, null, false);

		//NOTE IE also blows up if you call nextNode() on a newly initialized treewalker whose root is a text node.
		//Use a similar strategy as what is used in Anchors.js
		if(walker.currentNode.nodeType === Node.TEXT_NODE){
			node = walker.currentNode;
		}
		else{
			node = walker.nextNode();
		}
		while( node ){

			if (node === endAt){
				break;
			}
			if (node === startAt || startAt === true){
				if (!Ext.isTextNode(walker.currentNode)){nodes.push(node);}
				startAt = true;
			}
			node = walker.nextNode();
		}
		// console.log('nodes from getSelectedNdoes', nodes);
		return nodes;
	},


	/**
	 *
	 * @param applicableRange {NextThought.model.anchorables.ContentRangeDescription}
	 * @param doc {Document}
	 * @param cleanRoot {Node}
	 * @param containerId {String}
	 * @return {Node}
	 */
	getContextAroundRange: function(applicableRange, doc, cleanRoot, containerId){
		var utils = Boolean(applicableRange.isTimeRange) ? NextThought.view.slidedeck.transcript.AnchorResolver : Anchors,
			range = utils.toDomRange.apply(this, arguments);

		if(range){
			return this.fixUpCopiedContext(this.expandRangeGetNode(range, doc));
		}
		return null;
	},


	/**
	 *
	 * @param n {Node}
	 * @return {Node}
	 */
	fixUpCopiedContext: function(n){
		var node = Ext.get(n);
//          firstChild = node.first();
//        if (!firstChild || !(firstChild.is('div') || firstChild.is('object'))){
//	        node.setHTML('[...][...]');
//        }

		node.select('[itemprop~=nti-data-markupenabled] a').addCls('skip-anchor');
		node.select('a[href]:not(.skip-anchor)').set({target:'_blank'});
		node.select('a[href^=#]:not(.skip-anchor)').set({href:undefined,target:undefined});
		node.select('a[href^=tag]').set({href:undefined,target:undefined});

		return node.dom;
	},


	/**
	 * Gets the bounding rect of the provided range.  If the rect is zero
	 * but the range is not collapsed we will attempt to get the bounding box
	 * based on the ranges contents.  We do this because IE sucks.
	 */
	safeBoundingBoxForRange: function(r){
		var rect = r ? r.getBoundingClientRect(r) : null, node;
		try {
			if(rect && !r.collapsed && RectUtils.isZeroRect(rect) && r.toString() === '' && !Ext.isTextNode(r.startContainer)){
				console.log('No rect information...attempting to get selected node rect instead');
				node = r.startContainer.childNodes[r.startOffset];
				rect = node.getBoundingClientRect();
			}
		}
		catch(er){
			console.error(Globals.getError(er));
		}
		return rect;
	},


},function(){
	window.RangeUtils = this;
});
