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


    expandRange: function(range, doc){
        if(Ext.fly(range.commonAncestorContainer).up('object')) {
            return Ext.fly(range.commonAncestorContainer).up('object').down('.naquestion').dom.cloneNode(true);
        }

        if(Ext.fly(range.startContainer).up('object')) {
            return Ext.fly(range.startContainer).up('object').down('.naquestion').dom.cloneNode(true);
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
                console.log('removing', remove);
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
    }





},function(){
	window.RangeUtils = this;
});
