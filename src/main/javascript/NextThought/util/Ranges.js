Ext.define('NextThought.util.Ranges',{
	singleton: true,

    nonContextWorthySelectors: [
        'object'
    ],

	saveRange: function(r){
		if(!r){ return null; }
		return{
			startContainer: r.startContainer,
			startOffset: r.startOffset,
			endContainer: r.endContainer,
			endOffset: r.endOffset
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

    expandRange: function(range, doc){
		var object = this.nodeIfObjectOrInObject(range.commonAncestorContainer) || this.nodeIfObjectOrInObject(range.startContainer);
        if(object) {
            return object.down('.naquestion').dom.cloneNode(true);
        }

        var r = this.getRangyRange(range, doc),
            sel = rangy.getSelection(doc);

        try {
            r.moveEnd('character', 50);
            r.moveStart('character', -50);
            r.expand('word');
        }
        catch(e){
            //we might overflow boundries, that's okay, get what we can...
        }

        sel.setSingleRange(r);
        Anchors.expandSelectionToIncludeMath(sel);
        r = sel.getRangeAt(0);
        sel.removeAllRanges();

        return this.clearNonContextualGarbage(r.cloneContents());
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
            }, this);
        }, this);
        return dom;
    },


    getRangyRange: function(range, doc) {
        doc.getSelection().removeAllRanges();
        doc.getSelection().addRange(range);
        var sel = rangy.getSelection(doc);
        return sel.getRangeAt(0);
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
            next,
        	parentNodesSeen = [],
			doc = doc || document, node;

//        walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT//,
//            { acceptNode: function(node) {
//                var seen = false;
//                Ext.each(parentNodesSeen, function(pn){
//                    if (pn === node.parentNode){
//                        seen = true;
//                    }
//                });
//                if (!seen){parentNodesSeen.push(node);}
//                return seen ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
//            }}
//        );

		//NOTE in every browser but IE the last two params are optional, but IE explodes if they aren't provided

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
            if (walker.currentNode === startAt || startAt === true){
                if (!Ext.isTextNode(walker.currentNode)){nodes.push(walker.currentNode);}
                startAt = true;
            }
            if (walker.currentNode === endAt){
                break;
            }
			node = walker.nextNode();
        }
      // console.log('nodes from getSelectedNdoes', nodes);
        return nodes;
    }





},function(){
	window.RangeUtils = this;
});
