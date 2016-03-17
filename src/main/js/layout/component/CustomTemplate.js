export default Ext.define('NextThought.layout.component.CustomTemplate', {
	extend: 'Ext.layout.component.Body',
	alias: 'layout.customtemplate',
	type: 'customtemplate',


	publishInnerHeight: function(ownerContext, height) {
		var innerHeight = height - ownerContext.getFrameInfo().height,
			targetContext = ownerContext.targetContext,
			m = targetContext.el.getMargin();

		innerHeight -= (ownerContext.bodyContext.el.getY() - ownerContext.el.getY());

		if (targetContext !== ownerContext) {
			innerHeight -= (ownerContext.getPaddingInfo().height + ownerContext.getMarginInfo().height + m.top + m.bottom);
		}

		return ownerContext.bodyContext.setHeight(innerHeight, !ownerContext.heightModel.natural);
	}
});
