Ext.define('NextThought.overrides.dom.Element',{
	override: 'Ext.dom.Element',
//	requires: ['NextThought.util.Rects'],

	needsScrollIntoView : function(containerEl){
		var container = Ext.getDom(containerEl) || Ext.getBody().dom,
			el = this.dom,
            offsets = this.getOffsetsTo(container),

            top = offsets[1] + container.scrollTop,
            bottom = top + el.offsetHeight,

            ctClientHeight = container.clientHeight,
            ctTop = parseInt(container.scrollTop, 10),
            ctBottom = ctTop + ctClientHeight;

        return top > ctBottom || top < ctTop || bottom < ctTop || bottom > ctBottom;
	},


	/**
	 *
	 * @param el
	 * @param [bufferZone]
	 * @return {*}
	 */
	isOnScreenRelativeTo: function(el, bufferZone){
		var myRect = Ext.getDom(this).getBoundingClientRect(),
			parentRect = Ext.getDom(el).getBoundingClientRect();

		return RectUtils.contains(parentRect, myRect, bufferZone);
	},


	getAttribute: function(attr, ns){
		var v = this.callParent(arguments);
		return v || (attr === 'class' ? this.callParent(['className',ns]) : null);
	},


	getAndRemoveAttr: function(attr){
		var r = this.dom.getAttribute(attr);
		this.dom.removeAttribute(attr);
		return r;
	}
});
