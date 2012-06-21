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
	/**
	 * From a note, build its reply
	 * @param {NextThought.model.Note} note
	 * @return {NextThought.model.Note}
	 */
	noteToReply: function(note){
		var reply = Ext.create('NextThought.model.Note', {
				applicableRange: Ext.create('NextThought.model.anchorables.ContentRangeDescription')
			}),
			parent = note.get('NTIID'),
			refs = Ext.Array.clone(note.get('references') || []);

		refs.push(parent);

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
		holder.set('ContainerId', note.get('ContainerId'));
		holder.set('NTIID', note.get('inReplyTo'));
		holder.set('references', refs);
		holder.set('Last Modified', note.get('Last Modified'));

		holder.placeHolder = true;
		delete holder.phantom;

		return holder;
	},


	buildRangeFromRecord: function(r, root) {
		try {
			return Anchors.toDomRange(r.get('applicableRange'), root);
		}
		catch(er){
			console.error('Could not generate range for highlight', er, arguments);
			return null;
		}
	},


	selectionToNote: function(range) {
		if(range && range.collapsed){
			Ext.Error.raise('Cannot create highlight from null or collapsed range');
		}

		//generate the range description
		var contentRangeDescription = Anchors.createRangeDescriptionFromRange(range, document);

		return Ext.create('NextThought.model.Note', {
			applicableRange: contentRangeDescription
		});
	},


	selectionToHighlight: function(range, style, root) {
		if(range && range.collapsed){
			Ext.Error.raise('Cannot create highlight from null or collapsed range');
		}

		//generate the range description
		var contentRangeDescription = Anchors.createRangeDescriptionFromRange(range, root);

		return Ext.create('NextThought.model.Highlight', {
			style: style,
			applicableRange: contentRangeDescription,
			selectedText: range.toString()
		});
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
