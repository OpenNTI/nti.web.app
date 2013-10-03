Ext.define('NextThought.layout.component.CustomTemplate', {
	extend: 'Ext.layout.component.Body',
	alias: 'layout.customtemplate',
	type: 'customtemplate',


	calculateOwnerHeightFromContentHeight: function(ownerContext, contentHeight) {
		var height = this.callParent(arguments),
				c = ownerContext.target,
				m = c.el.getMargin();

		return height + (c.el.getHeight()) + (m.top + m.bottom);
	},

	calculateOwnerWidthFromContentWidth: function(ownerContext, contentWidth) {
		var width = this.callParent(arguments),
				c = ownerContext.target,
				m = c.el.getMargin();
		return width + c.el.getWidth() + (m.left + m.right);
	},


	publishInnerWidth: function(ownerContext, width) {
		var innerWidth = width - ownerContext.getFrameInfo().width,
			targetContext = ownerContext.targetContext,
			m = targetContext.el.getMargin();

		if (targetContext !== ownerContext) {
			innerWidth -= (ownerContext.getPaddingInfo().width + ownerContext.getMarginInfo().width + m.left + m.right);
		}

		return ownerContext.bodyContext.setWidth(innerWidth, !ownerContext.widthModel.natural);

	},


	publishInnerHeight: function(ownerContext, height) {
		var innerHeight = height - ownerContext.getFrameInfo().height,
			targetContext = ownerContext.targetContext,
			m = targetContext.el.getMargin();

		if (targetContext !== ownerContext) {
			innerHeight -= (ownerContext.getPaddingInfo().height + ownerContext.getMarginInfo().height + m.top + m.bottom);
		}

		return ownerContext.bodyContext.setHeight(innerHeight, !ownerContext.heightModel.natural);
	}
});
