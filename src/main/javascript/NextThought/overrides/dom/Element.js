Ext.define('NextThought.overrides.dom.Element',{
	override: 'Ext.dom.Element',

	/**
	 * @param el
	 * @returns True if the element is within view of the container, False otherwise
	 */
	isInView: function(el){
		var p = Ext.get(el) || this.parent(),
			scroll = p.getScroll(),
			size = p.getSize(),
			y1 = scroll.top,
			y2 = y1 + size.height,

			top = this.getTop()-p.getTop(),
			bottom = top+this.getHeight();

		return y1 <= top	&& top <= y2	&&
				bottom<=y2	&& bottom>=y1;

	},


	getQuery: function(){
		if(window.$ === undefined){
			console.log('WARNING: jQuery not loaded');
			return null;
		}
		return $(this.dom);
	}
}, function(){

	Ext.apply(Ext, {
	    getQuery: function(el){
	        return Ext.get(el).getQuery();
	    }
	});

	if(window.$ === undefined){
		console.log('WARNING: jQuery not loaded');
		return;
	}
	jQuery.extend({
		getExt:function(el){
			return Ext.get($(el).get(0));
		}
	});

});
