Ext.define('NextThought.util.Annotations',{
	requires: [
		'NextThought.model.Highlight',
		'NextThought.model.Note',
		'NextThought.view.whiteboard.Canvas',
		'NextThought.util.Anchors'
	],
	singleton: true,


	callbackAfterRender: function(fn,scope){
		var a = AnnotationsRenderer;

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


	selectionToNote: function(range, documentElement) {
		if(range && range.collapsed){
			Ext.Error.raise('Cannot create highlight from null or collapsed range');
		}

		//generate the range description
		var contentRangeDescription = Anchors.createRangeDescriptionFromRange(range, documentElement);

		return Ext.create('NextThought.model.Note', {
			applicableRange: contentRangeDescription
		});
	},


	selectionToHighlight: function(range, style, root) {
		if(range && range.collapsed){
			Ext.Error.raise('Cannot create highlight from null or collapsed range');
		}

		var p = LocationProvider.getPreferences();
		p = p ? p.sharing : null;
		p = p ? p.sharedWith || [] : null;

		//generate the range description
		var contentRangeDescription = Anchors.createRangeDescriptionFromRange(range, root);

		return Ext.create('NextThought.model.Highlight', {
			style: style,
			applicableRange: contentRangeDescription,
			selectedText: range.toString(),
			sharedWith: p
		});
	},


	getBlockParent: function(node, ignoreSpan){
		if(!node || (this.isBlockNode(node) && !(node.tagName === 'SPAN' && ignoreSpan))){
			return node;
		}
		return this.getBlockParent(node.parentNode, ignoreSpan);
	},


	/* tested */
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
});
