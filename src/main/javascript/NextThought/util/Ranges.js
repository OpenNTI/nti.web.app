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
	}

},function(){
	window.RangeUtils = this;
});
