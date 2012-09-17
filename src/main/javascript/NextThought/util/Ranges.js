Ext.define('NextThought.util.Ranges',{
	singleton: true,

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
            console.log('Range is inside an object, just return the contents of Object');
            return Ext.fly(range.commonAncestorContainer).up('object').down('.naquestionpart').dom;
        }


        var r = this.getRangyRange(range, doc),
            sel = rangy.getSelection(doc);

        r.moveEnd('character', 50);
        r.moveStart('character', -50);
        r.expand('word');

        sel.setSingleRange(r);
        Anchors.expandSelectionToIncludeMath(sel);
        r = sel.getRangeAt(0);
        sel.removeAllRanges();

        return r.cloneContents();
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
