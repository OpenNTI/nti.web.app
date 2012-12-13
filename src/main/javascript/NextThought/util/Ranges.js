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

	rangeIfItemPropSpan: function(range){
		/*
		 * Special case for annototable images: We don't want to expand past the annototable img.
		 * And since we usually expand by a given number of characters,
		 * if you have multiple consecutive images, we were getting all of them; which is an unexpected behavior.
		 */
		var node = range.commonAncestorContainer;

		if(node.getAttribute && node.getAttribute('itemprop')){
			console.log("we're inside a itemprop span.", node, ', itemprop: ',node.getAttribute('itemprop'));
			return range;
		}
		return null;
	},

	//A nicer OO way of doing this so we don't end up with a giant
	//if else chain
	contentsForObjectTag: function(object){
		var contents = null;

		//For questions we look for the contained div with class naquestion
		//Why do we do this instead of cloning the object?
		contents = object.down('.naquestion');
		if(contents){
			return contents.dom.cloneNode(true);
		}

		return object.dom.cloneNode(true);
	},

    expandRange: function(range, doc){
		var object = this.nodeIfObjectOrInObject(range.commonAncestorContainer) || this.nodeIfObjectOrInObject(range.startContainer), nr;
        if(object) {
            return this.contentsForObjectTag(object);
        }

	    nr = this.rangeIfItemPropSpan(range);
	    if(nr){
		    return this.clearNonContextualGarbage(nr.cloneContents());
	    }

        var r = this.getRangyRange(range, doc),
            sel = rangy.getSelection(doc);

        try {
            r.moveEnd('character', 50);
            r.moveStart('character', -50);
            r.expand('word');
        }
        catch(e){
            //we might overflow boundries, that's okay, get what we can but be sure to ask for word resolution...
            r.expand('word');
        }

        sel.setSingleRange(r);
        Anchors.expandSelectionToIncludeMath(sel);
        r = sel.getRangeAt(0);
        sel.removeAllRanges();

       return this.clearNonContextualGarbage(r.cloneContents());
    },


    expandRangeGetString: function(range, doc){
        var expanded = this.expandRange(range, doc),
            tempDiv = document.createElement('div'),
            str;

        tempDiv.appendChild(expanded);
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
			node;

		doc = doc || document;
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
    }





},function(){
	window.RangeUtils = this;
});
