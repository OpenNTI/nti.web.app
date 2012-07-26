Ext.define('NextThought.layout.component.TemplatedContainer', {
    extend: 'Ext.layout.component.Body',

    alias: 'layout.templated-container',
    type: 'templated-container',

	/*
	be careful where margin/padding is added to the components! it may get missed by this layout.
	 */

    calculateOwnerHeightFromContentHeight: function (ownerContext, contentHeight) {
        var height = this.callParent(arguments),
			c = ownerContext.target,
			m = c.el.getMargin();
        return  (c.el.getHeight()) + (m.top + m.bottom);
    },

    calculateOwnerWidthFromContentWidth: function (ownerContext, contentWidth) {
        var width = this.callParent(arguments),
			c = ownerContext.target,
			m = c.el.getMargin();
        return width + c.el.getWidth() + (m.left + m.right);
    },

	publishInnerWidth: function(ownerContext, width){
		var innerWidth = width - ownerContext.getFrameInfo().width,
			targetContext = ownerContext.targetContext;

		if (targetContext !== ownerContext) {
			innerWidth -= (ownerContext.getPaddingInfo().width + ownerContext.getMarginInfo().width);
		}

		ownerContext.bodyContext.setWidth(innerWidth, !ownerContext.widthModel.natural);

    }
});
