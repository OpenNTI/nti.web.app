Ext.define('NextThought.util.AnnotationUtils',{
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.view.whiteboard.Canvas'
	],
	singleton: true,
	alternateClassName: 'AnnotationUtils',

	/** @constant */
	NOTE_BODY_DIVIDER: '\u200b<div id="{0}" class="body-divider" style="text-align: left; margin: 10px; padding: 5px;">{1}</div>\u200b',

	/** @constant */
	WHITEBOARD_THUMBNAIL: '<a class="whiteboard-magnifier"></a><img src="{0}" {2} onclick="{1}" class="whiteboard-thumbnail" alt="Whiteboard Thumbnail" border="0" />',

	SEPERATOR: null,
	DIVIDER_REGEX: null,


	callbackAfterRender: function(fn,scope){
		var a = NextThought.view.widgets.annotations.Annotation;

		function cb(){
			Globals.callback(fn,scope);
		}

		if(a.rendering || a.aboutToRender){
			a.events.on('finish',cb,null,{single: true});
			return;
		}
		console.log('wasn\'t rendering');
		cb();
	},


//tested
	getBodyTextOnly: function(obj) {
		var bdy = obj.get('body'), o, i, text = [],
			hlStart = obj.get('startHighlightedText'), //Highlight only
			hlEnd = obj.get('endHighlightedText'); //Highlight only
		for (i in bdy) {
			if(bdy.hasOwnProperty(i)) {
				o = bdy[i];
				if(typeof(o) === 'string'){
					text.push(o.replace(/<.*?>/g, ''));
				}
			}
		}

		//Do some checking of highlight start end end values to eliminate some weirdness...
		//that can occur when highlighting non text items.
		if (hlStart && hlStart.indexOf('DOMTreeID') !== -1) {
			hlStart = null;
		}
		else if (hlStart) { hlStart = hlStart.trim();}
		if (hlEnd && hlEnd.indexOf('DOMTreeID') !== -1) {
			hlEnd = null;
		}
		else if (hlEnd) { hlEnd = hlEnd.trim();}


		return text.join('') || hlStart || hlEnd || 'content';
	},


	objectToAttributeString: function(obj){
		if(!obj) {
			return '';
		}

		var a = [];

		Ext.Object.each(obj,function(i,o){
			if(o){ a.push([i,'="',o,'"'].join('')); }
		});

		return a.join(' ');
	},

//tested
	/**
	 * Build the body text with the various components mixed in.
	 *
	 * The callbacks need to define the scope and the two callback methods:
	 *		getThumbnail(canvas, guid)
	 *		getClickHandler(guid)
	 *
	 *	If no callbacks are passed in, default behaviour will take place, which is to
	 *	generate a thumbnail and no click handler.  Pass in callbacks if you want to
	 *	do something like preserve the canvas for use later.
	 *
	 * @param record (Must have a body[] field)
	 * @param [callbacks]
	 * @return String
	 */
	compileBodyContent: function(record, callbacks, whiteboardAttrs){

		var me = this,
			body = record.get('body'),
			text = [],
			cb = callbacks || {
				scope:me,
				getClickHandler: function(){return '';},
				getThumbnail: me.generateThumbnail
			},
			attrs = this.objectToAttributeString(whiteboardAttrs);


		Ext.Object.each(body, function(i,o){
			if(typeof(o) === 'string'){
				text.push(o);
				return;
			}

			var id = guidGenerator();

			text.push(
					Ext.String.format(me.NOTE_BODY_DIVIDER, id,
							Ext.String.format(me.WHITEBOARD_THUMBNAIL,
									cb.getThumbnail.call(cb.scope, o, id),
									cb.getClickHandler.call(cb.scope,id),
									attrs
							))
			);
		});


		return text.join(me.SEPERATOR).replace(me.DIVIDER_REGEX, "$2");
	},

//tested
	/**
	 * Generate a thumbnail from a canvas object.
	 *
	 * @param canvas - the canvas object
	 */
	generateThumbnail: function(canvas) {
		Ext.require('NextThought.view.whiteboard.Canvas');
		return NextThought.view.whiteboard.Canvas.getThumbnail(canvas);
	},

//tested
	getPathTo: function(element) {
		var nodeName = element.nodeName, siblings, sibling, len, i=0, ix=0;

		if (element.id && !/ext\-|a\d+|math/i.test(element.id)) {
			return 'id("'+element.id+'")';
		}
		if (element.tagName==='BODY') {
			throw 'too far!';
		}

		if (nodeName === '#text') {
			nodeName = 'text()';
		}


		siblings= element.parentNode.childNodes;
		len = siblings.length;

		for (; i<len; i++) {
			sibling = siblings[i];
			if (sibling.nodeName===element.nodeName) {
				ix = ix+1;
			}

			if (sibling===element) {
				return this.getPathTo(element.parentNode)+'/'+nodeName+'['+ix+']';
			}
		}
	},

//tested
	/**
	 * From a note, build its reply
	 * @param {NextThought.model.Note} note
	 * @return {NextThought.model.Note}
	 */
	noteToReply: function(note){
		var reply = Ext.create('NextThought.model.Note'),
				parent = note.get('NTIID'),
				refs = Ext.Array.clone(note.get('references') || []);

		refs.push(parent);

		reply.set('anchorPoint', note.get('anchorPoint'));
		reply.set('top', note.get('top'));
		reply.set('left', note.get('left'));
		reply.set('ContainerId', note.get('ContainerId'));
		reply.set('inReplyTo', parent);
		reply.set('references', refs);

		return reply;
	},

//tested
	/**
	 * From a reply, build its absent parent
	 * @param {NextThought.model.Note} note
	 * @return {NextThought.model.Note}
	 */
	replyToPlaceHolder: function(note){
		var holder = Ext.create('NextThought.model.Note'),
			refs = note.get('references') || [];

		if(refs.length){
			refs = Ext.Array.clone(refs);
			refs.pop();
		}

		if(refs.length) {
			holder.set('inReplyTo', refs[refs.length-1]);
		}

		holder.set('Creator', null);
		holder.set('anchorPoint', note.get('anchorPoint'));
		holder.set('top', note.get('top'));
		holder.set('left', note.get('left'));
		holder.set('ContainerId', note.get('ContainerId'));
		holder.set('NTIID', note.get('inReplyTo'));
		holder.set('references', refs);
		holder.set('Last Modified', note.get('Last Modified'));

		holder.placeHolder = true;
		delete holder.phantom;

		return holder;
	},

//tested
	selectionToNote: function(range) {
		var note = Ext.create('NextThought.model.Note'),
			node = range.startContainer || range.endContainer,
			anchorNode, pageOffsets;

		if(node.nodeType === Node.TEXT_NODE){
			node = node.parentNode;
		}

		anchorNode = Ext.fly(node).is('A[name]')? node: this.getPreviousAnchorInDOM(node);
		if(!anchorNode){
			anchorNode = this.getAnchors(node.ownerDocument).first();
		}

		pageOffsets = Ext.fly(anchorNode).getOffsetsTo(anchorNode.ownerDocument.getElementById('NTIContent'));

		note.set('anchorPoint', anchorNode.getAttribute('name'));
		note.set('top', pageOffsets[0]);
		note.set('left', pageOffsets[1]);
		return note;
	},


	getNextAnchorInBlock: function(node,createIfNotFound) {
		var anchor = null, block, pos;

		block = this.getBlockParent(node);

		Ext.each(this.getAnchors(block), function(a){
			pos = a.compareDocumentPosition(node);
			//node precedes the anchor
			if (pos & a.DOCUMENT_POSITION_PRECEDING) {
				anchor = a;
				return false;
			}
		});

		if(!anchor && createIfNotFound){
			anchor = block.ownerDocument.createElement('a');
			anchor.setAttribute('name','generated-anchor-'+guidGenerator());
			block.appendChild(anchor);
		}

		return anchor;
	},


//tested
	getNextAnchorInDOM: function(node) {
		var anchor = null, pos;
		Ext.each(this.getAnchors(node.ownerDocument), function(a){
			pos = a.compareDocumentPosition(node);
			//node precedes the anchor
			if (pos & a.DOCUMENT_POSITION_PRECEDING) {
				anchor = a;
				return false;
			}
		});
		return anchor;
	},

//tested
	getPreviousAnchorInDOM: function(node) {
		var anchor = null, pos;
		Ext.each(this.getAnchors(node.ownerDocument).reverse(), function(a){
			pos = a.compareDocumentPosition(node);
			//node precedes the anchor
			if (pos & a.DOCUMENT_POSITION_FOLLOWING) {
				anchor = a;
				return false;
			}
		});
		return anchor;
	},


	getBlockParent: function(node){
		if(!node || this.isBlockNode(node)){
			return node;
		}
		return this.getBlockParent(node.parentNode);
	},


//tested
	isBlockNode: function(n) {
		var e = Ext.get(n),
				p = /static|relative|^$/i,
				d = /block|box/i;

		if (n) {
			if (n.tagName === 'A') {
				return false;
			}
			else if (n.tagName === 'BODY') {
				return true;
			}
		}

		return (e && d.test(e.getStyle('display')) && p.test(e.getStyle('position')));
	},

//tested
	getNodeFromXPath: function(xpath, root) {
		root = root || document;

		try {
			return this.resolveXPath(xpath,root);
		}
		catch(e) { //getNodeFromXPath
			console.error('xpath: ', xpath, 'error:', e, e.stack);
		}
		return null;
	},


	resolveXPath: function resolveXPath(xpath, root){
		var path, pc, node, child, m,
			id = resolveXPath.id = (resolveXPath.id || /id\("(.+?)"\)/i),
			text = resolveXPath.text = (resolveXPath.text || /text\(\)(\[(\d+)\])?/i),
			tag = resolveXPath.tag || (resolveXPath.tag || /([A-Z]+)(\[(\d+)\])?/i);

		path = xpath.split('/').reverse();

		while( (pc = path.pop()) !== undefined ){
			m = pc.match(id);
			if(m && !node){
				node = root.getElementById(m[1]);
			}
			else {
				m = pc.match(text);
				if(m){
					// m[2] //index
					for (child = node.firstChild; child && m[2]; child = child.nextSibling) {
						if(child.nodeType === 3){
							m[2]--;
							if(m[2]===0){
								node = child;
							}
						}
					}
					if(m[2]>0 && !child){
						throw pc+' Node not found';
					}

				}
				else {
					m = pc.match(tag);
					// m[1] //tag
					// m[3] //index
					if(m){
						for (child = node.firstChild; child && m[3]; child = child.nextSibling) {
							if(child.tagName === m[1]){
								m[3]--;
								if(m[3]===0){
									node = child;
								}
							}
						}

						if(m[3]>0 && !child){
							throw pc+' Node not found';
						}
					}
				}
			}
		}
		return node;
	},


	buildRangeFromRecord: function(r, root) {
		try {
			var endElement = this.getNodeFromXPath(r.get('endXpath'),root),
				startElement = this.getNodeFromXPath(r.get('startXpath'), root),
				range = (root||document).createRange();

			try {
				range.setEnd(endElement ? endElement : startElement, r.get('endOffset'));
				range.setStart(startElement, r.get('startOffset'));
				if (startElement && !range.collapsed) {
					return range;
				}
			}
			catch(e) { console.warn('bad range', r, e, e.toString()); }
		}
		catch(er){
			if(!er.warn){
				console.error(er);
			}
		}

		//if we make it this far, there's something wrong with the range, we'll try to reconstruct from anchors
		return this.rangeFromAnchors(r,root);
	},


	getAnchors: function getAnchors(root){
//		var id = root&&root.tagName? Ext.get(root).id : 'null',
//			f = this.getAnchors,
//			c = (f.cache = f.cache || {}),
//			t = (f.timers = f.timers || {});

//		clearTimeout(t[id]);

//		if(!c[id]) {
//			c[id] = Ext.Array.unique(Ext.query('#NTIContent A[name]',root));
			return Ext.Array.unique(Ext.query('#NTIContent A[name]',root));
//		}
//		t[id] = setTimeout(function(){ delete c[id]; },500);
//		return c[id].slice();
	},


//tested
	getAnchor: function(a,root) {
		return Ext.query('a[name=' + a +']',root)[0];
	},

//tested
	getNextAnchor: function(a) {
		var all = this.getAnchors(a.ownerDocument),
			result = null;

		Ext.each(all, function(e, i){
			if (e===a) {
				result = all[i+1];
				return false;
			}
		});

		return result;
	},


	rangeFromAnchors: function(r,root) {
		//TODO: this still isn't qorking quite right, if the start/end anchor are the same but have diff text nodes.
		var startAnchor = r.get('startAnchor'),
			endAnchor = r.get('endAnchor'),
			startHighlightedFullText = r.get('startHighlightedFullText'),
			endHighlightedFullText = r.get('endHighlightedFullText'),
			resultRange = root.createRange(),
			container,
			text, texts,
			tempRange;

		if(!endHighlightedFullText) {
			endHighlightedFullText = startHighlightedFullText;
		}

		//resolve anchors to their actual DOM nodes
		startAnchor = this.getAnchor(startAnchor,root);
		endAnchor = endAnchor ? this.getAnchor(endAnchor,root) : this.getNextAnchor(startAnchor);

		try {
			tempRange = root.createRange();
			tempRange.setStart(startAnchor, 0);
			tempRange.setEnd(endAnchor, 0);
			container = tempRange.commonAncestorContainer;
		}
		catch (e) {
			console.warn('End Anchor is null', e, e.stack);
			container = Ext.get(startAnchor).up('.page-contents').dom;
		}

		texts = this.getTextNodes( container );

		while(resultRange.collapsed && !!(text = texts.shift())){
			if (text.nodeValue===startHighlightedFullText) {
				resultRange.setStart(text, r.get('startOffset'));
			}
			if (text.nodeValue===endHighlightedFullText) {
				resultRange.setEnd(text, r.get('endOffset'));
			}
		}

		//add xpaths here for simplicity next time
		if (!resultRange.collapsed){
			if (r.isModifiable()) {
				r.set('startXpath', this.getPathTo(resultRange.startContainer));
				r.set('endXpath', this.getPathTo(resultRange.endContainer));
				r.save();
			}
			return resultRange;
		}

		return null;
	},


	getTextNodes: function (root) {
		var textNodes = [];
		function getNodes(node) {
			var child;

			if (node.nodeType === 3) { textNodes.push(node); }
			else if (node.nodeType === 1) {
				for (child = node.firstChild; child; child = child.nextSibling) {
					getNodes(child);
				}
			}
		}
		getNodes(root.body || root);
		return textNodes;
	},


	selectionToHighlight: function(range) {
		if(range.collapsed){
			return;
		}

		var highlight = Ext.create('NextThought.model.Highlight'),
			startNode = range.startContainer,
			endNode = range.endContainer,
			startAnchor = this.ascendToAnchor(startNode),
			endAnchor = this.ascendToAnchor(endNode);

		highlight.set('text', range.toString());

		//start information
		highlight.set('startXpath', this.getPathTo(startNode));
		highlight.set('startAnchor', startAnchor);
		highlight.set('startOffset', range.startOffset);
		//end information
		highlight.set('endXpath', this.getPathTo(endNode));
		if (startAnchor !== endAnchor) {
			highlight.set('endAnchor', endAnchor);
		}
		highlight.set('endOffset', range.endOffset);

		//special case when the end node is a div containing an img.
		if (this.isBlockNode(endNode) && this.isImageNode(endNode.firstChild)){
			endNode = endNode.firstChild;
		}

		this.fixHighlightEndpoints(endNode, startNode, highlight);
		return highlight;
	},


	fixHighlightEndpoints: function(endNode, startNode, highlight) {
		var end = null,
			workingNode = endNode,
			fullText, endOffset, startOffset;

		if (!this.isTextNode(endNode) && !this.isMathNode(endNode) && !this.isImageNode(endNode)) {
			while(!end) {
				workingNode = (workingNode.previousSibling) ? workingNode.previousSibling : workingNode.parentNode;
				end = this.findLastHighlightableNodeFromChildren(workingNode, endNode);
				if (end) {
					endNode = end;
					highlight.set('endAnchor', this.ascendToAnchor(end));
					if (this.isTextNode(end)) {
						highlight.set('endOffset', endNode.nodeValue.length);
					}
				}
			}
		}

		//now we have our start and end, let's see if we span anchors
		fullText = this.getNodeTextValue(startNode);
		endOffset = highlight.get('endOffset');
		startOffset = highlight.get('startOffset');
		highlight.set('startHighlightedFullText', fullText);
		highlight.set('startHighlightedText', (fullText !== startNode.nodeValue) ?
			fullText : startNode.nodeValue.substring(startOffset));
		highlight.set('endHighlightedFullText', this.getNodeTextValue(endNode));

		fullText = this.getNodeTextValue(endNode);
		highlight.set('endHighlightedText',
			(endOffset !== 0 && endNode.nodeValue !== null) ?
				(fullText !== endNode.nodeValue) ?
					fullText : endNode.nodeValue.substring(0, endOffset)
				: highlight.get('endHighlightedFullText'));
	},


	ascendToAnchor: function(textNode) {
		var parentNode = textNode,
			previousSibling,
			name,
			anchorFromChildrenOrNull;

		if (this.isTextNode(textNode)) {
			parentNode = textNode.parentNode;
		}

		while (parentNode !== null) {
			if (parentNode.nodeName === 'A') {
				name = this.anchorNameOrNull(parentNode);
				if (name !== null) {
					//if we found a name, return it, otherwise allow this to continue.
					return name;
				}
			}

			//Look at all prior siblings at this level looking for an anchor
			previousSibling = parentNode.previousSibling;
			while(previousSibling !== null) {
				if (previousSibling.nodeName === 'A') {
					name = this.anchorNameOrNull(previousSibling);
					if (name !== null) {
						//if we found a name, return it, otherwise allow this to continue.
						return name;
					}

				}
				//look into the children of this previous node
				anchorFromChildrenOrNull = this.findLastAnchorFromChildren(previousSibling);
				if (anchorFromChildrenOrNull === null) {
					previousSibling = previousSibling.previousSibling;
				}
				else {
					return anchorFromChildrenOrNull;
				}
			}
			parentNode = parentNode.parentNode;
		}

		//if we make it here, we haven't found an anchor name:
		return null;
	},


	anchorNameOrNull: function(node) {
		if (node.name !== null && node.name.trim().length > 0) {
			return node.name;
		}
		else {
			return null;
		}
	},


	findLastAnchorFromChildren: function(node) {
		var children = node.childNodes,
			anchorFound = null,
			i=0, y=0, child, grandchildren,
			grandchild, newAnchorFound;

		if (node.nodeName === 'A') {
			anchorFound = this.anchorNameOrNull(node);
		}

		if (children !== null) {
			for(; i < children.length; i++) {
				child = children[i];
				if (child.nodeName === 'A') {
					anchorFound = this.anchorNameOrNull(child);
				}
				grandchildren = child.childNodes;
				if (grandchildren !== null) {
					for (; y < grandchildren.length; y++) {
						grandchild = grandchildren[y];
						newAnchorFound = this.findLastAnchorFromChildren(grandchild);
						if (newAnchorFound !== null) {
							anchorFound = newAnchorFound;
						}
					}
				}
			}
		}

		return anchorFound;
	},

//tested
	isMathNode: function(node) {
		if (!node || !node.getAttribute) {
			return false;
		}

		var cls = node.getAttribute('className') || node.getAttribute('class');

		return (cls && cls.indexOf('math') >= 0);
	},

//tested
	isTextNode: function(node) {
		return (node && node.nodeType === Node.TEXT_NODE);
	},

//tested
	isImageNode: function(node) {
		return (node && node.nodeName === 'IMG');
	},


	getNodeTextValue: function(node) {
		var math = this.climbToMathNode(node),
			img = this.digForImageNode(node);

		if (math !== null) {
			//we have a math parent node
			//TODO - using the id here is fragile because changing content can break this when saved
			return this.getDOMTreeId(math);
		}
		else if (img !== null) {
			return this.getDOMTreeId(img);
		}
		else if (this.isTextNode(node)) {
			return node.nodeValue;
		}
		else {
			//console.warn("Cannot figure out the textual value of the node " + node);
			return null;
		}

	},


	getDOMTreeId: function(node) {
		var parentNode = node||null,
			previousSibling,
			parents = 0,
			sibs = 0;

		while (parentNode !== null) {
			parents++;

			//Look at all prior siblings at this level looking for an anchor
			previousSibling = parentNode.previousSibling;
			while(previousSibling !== null) {
				sibs++;

				previousSibling = previousSibling.previousSibling;
			}
			parentNode = parentNode.parentNode;
		}

		//if we make it here, we haven't found an anchor name:
		return "DOMTreeID:" + parents + "," + sibs;
	},


//tested
	digForImageNode: function(n) {
		if (this.isImageNode(n)) {
			return n;
		}

		var child = n.firstChild, next;

		while (child) {
			if (this.isImageNode(child)) {
				return child;
			}
			next = child.nextSibling;
			if (next === null) {
				child = child.firstChild;
			}
			else {
				child = next;
			}
		}

		//get here and found nothing? return null:
		return null;
	},

//tested
	climbToMathNode: function(node) {
		var topMathNode = null,
			parent;

		if (this.isMathNode(node)) {
			topMathNode = node;
		}

		parent = node.parentNode;
		while (parent !== null) {
			if (this.isMathNode(parent)) {
				topMathNode = parent;
			}
			parent = parent.parentNode;
		}

		return topMathNode;
	},


	findLastHighlightableNodeFromChildren: function(node, stopNode) {
		var children = node.childNodes,
			last = null, child, grandchildren, grandchild, x,
			i = 0, y = 0;

		if ((this.isTextNode(node) && node.nodeValue.trim() !== '') || this.isMathNode(node) || this.isImageNode(node)) {
			last = node;
		}

		if (children !== null) {
			for(; i < children.length; i++) {
				child = children[i];

				if (child === stopNode) {
					return last;
				}

				if ((this.isTextNode(child) && child.nodeValue.trim() !== '') || this.isMathNode(child) || this.isImageNode(child)) {
					last = child;
				}
				grandchildren = child.childNodes;
				if (grandchildren !== null) {
					for (; y < grandchildren.length; y++) {
						grandchild = grandchildren[y];
						if (grandchild === stopNode) {
							return last;
						}
						x = this.findLastHighlightableNodeFromChildren(grandchild, stopNode);
						if (x) { last = x;}
					}
				}
			}
		}

		return last;
	}
},
function(){
	window.AnnotationUtils = this;
	this.SEPERATOR = Ext.String.format(this.NOTE_BODY_DIVIDER, '', '<hr/>');

	function escapeRegExp(str) {
	  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}


	var part = escapeRegExp(this.SEPERATOR),
		svg = escapeRegExp(this.NOTE_BODY_DIVIDER)
				.replace(/\\\{0\\\}/, '[a-z0-9\\-]+?')
				.replace(/\\\{1\\\}/, '.*?svg.*?');

	this.DIVIDER_REGEX = new RegExp( '('+part+')?('+svg+')('+part+')?', 'gi');
});
