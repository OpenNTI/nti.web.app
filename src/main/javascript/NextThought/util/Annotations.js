Ext.define('NextThought.util.Annotations',{
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.view.whiteboard.Canvas',
		'NextThought.util.Anchors'
	],
	singleton: true,

	/** @constant */
	NOTE_BODY_DIVIDER: '\u200b<div id="{0}" class="body-divider" style="text-align: left; margin: 10px; padding: 5px;">{1}</div>\u200b',

	/** @constant */
	WHITEBOARD_THUMBNAIL: '<a class="whiteboard-magnifier"></a><img src="{0}" {2} onclick="{1}" class="whiteboard-thumbnail" alt="Whiteboard Thumbnail" border="0" />',

	SEPERATOR: null,
	DIVIDER_REGEX: null,


	callbackAfterRender: function(fn,scope){
		var a = NextThought.view.annotations.Annotation;

		function cb(){
			Ext.callback(fn,scope);
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
		if (!obj) {return '';}

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
	 * @param callbacks - function or object getResult(string) callback defined
	 */
	compileBodyContent: function(record, callbacks, whiteboardAttrs){

		callbacks = Ext.isFunction(callbacks) ? {getResult: callbacks} : callbacks;

		var me = this,
			body = (record.get('body')||[]).slice().reverse(),
			text = [],
			cb = Ext.applyIf(callbacks||{}, {
				scope:me,
				getClickHandler: function(){return '';},
				getThumbnail: me.generateThumbnail,
				getResult: function(){console.log(arguments);}
			}),
			attrs = this.objectToAttributeString(whiteboardAttrs);

		function render(i){
			var o = body[i], id;

			if(i<0){
				cb.getResult.call(cb.scope,text.join(me.SEPERATOR).replace(me.DIVIDER_REGEX, "$2"));
			}
			else if(typeof(o) === 'string'){
				text.push(Ext.String.htmlEncode(o));
				render(i-1);
			}
			else {
				id = guidGenerator();
				cb.getThumbnail.call(cb.scope, o, id, function(thumbnail){
					text.push(
						Ext.String.format(me.NOTE_BODY_DIVIDER, id,
							Ext.String.format(me.WHITEBOARD_THUMBNAIL,
									thumbnail,
									cb.getClickHandler.call(cb.scope,id),
									attrs
							))
					);
					render(i-1);
				});
			}
		}

		render(body.length-1);
	},

//tested
	/**
	 * Generate a thumbnail from a canvas object.
	 *
	 * @param canvas - the canvas object
	 */
	generateThumbnail: function(canvas, id, callback) {
		Ext.require('NextThought.view.whiteboard.Canvas');
		return NextThought.view.whiteboard.Canvas.getThumbnail(canvas, callback);
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


	isDisplayed:function(a,root){
		if(!a || a === root || a.nodeType===Node.DOCUMENT_NODE || Ext.get(a)===null ){
			return true;
		}

		function check(a){
			var e = Ext.get(a);
			return e.getStyle('display')!=='none'
				&& e.getAttribute('type')!=='hidden'
				&& (e.getWidth(true)!==0 || e.getHeight(true)!==0)
				&& !e.hasCls('hidden');
		}

		return this.isDisplayed(a.parentNode,root) && check(a);
	},


	getNextAnchorInBlock: function(node,createIfNotFound) {
		var anchor = null, pos,
			block = this.getBlockParent(node),
			autoAnchor;

		function sibling(a){
			if(!a || a.parentNode === block){
				return a;
			}
			return sibling(a.parentNode);
		}

		function makeAnchor(){
			var a = block.ownerDocument.createElement('a');
			a.setAttribute('name','generated-anchor-'+guidGenerator());
			return a;
		}


		Ext.each(this.getAnchors(block), function(a){
			pos = a.compareDocumentPosition(node);
			//node precedes the anchor
			if (pos & a.DOCUMENT_POSITION_PRECEDING) {
				anchor = a;
				return false;
			}
		});

		if(createIfNotFound){
			if(!anchor){
				anchor = makeAnchor();
				block.appendChild(anchor);
			}
			else if(!this.isDisplayed(anchor)){
				autoAnchor = makeAnchor();
				block.insertBefore(autoAnchor,sibling(anchor));
				return autoAnchor;
			}
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

		return this.isDisplayed(n)
			&& e
			&& d.test(e.getStyle('display'))
			&& p.test(e.getStyle('position'));
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
		var path, pc, node = null, child, m,
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


	buildRangeFromRecord: function(highlightRecord, root) {
		try {
			return Anchors.toDomRange(highlightRecord.get('applicableRange'), root);
		}
		catch(er){
			console.error('Could not generate range for highlight', er, arguments);
			return null;
		}
	},


	getAnchors: function getAnchors(root){
		return Ext.Array.unique(Ext.query('#NTIContent A[name]',root));
	},


//tested
	getAnchor: function(a,root) {
		var anchor = Ext.query('A[name=' + a +']',root)[0];
		if (!anchor) {
			anchor = Ext.query('[id=' + a +']',root)[0];
		}
		return anchor;
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


	selectionToHighlight: function(range, style, docRoot) {
		if(range && range.collapsed){
			Ext.Error.raise('Cannot create highlight from null or collapsed range')
		}

		//generate the range description
		var contentRangeDescription = Anchors.createRangeDescriptionFromRange(range);

		return Ext.create('NextThought.model.Highlight', {
			style: style,
			applicableRange: contentRangeDescription,
			selectedText: range.toString()
		});
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
