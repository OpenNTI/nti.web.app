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

	}
});
