Ext.define('NextThought.mixins.FillScreen', {

	fillScreen: function(node, paddingBottom) {
		var me = this,
			resizeHandler = me.sizeNode.bind(me, node, paddingBottom);

		Ext.EventManager.onWindowResize(resizeHandler, me);

		me.on('destroy', function() {
			Ext.EventManager.removeResizeListener(resizeHandler, me);
		});

		resizeHandler.call();
	},


	sizeNode: function(node, paddingBottom) {
		var rect = node.getBoundingClientRect(),
			viewHeight = Ext.Element.getViewportHeight(),
			height = viewHeight - rect.top - (paddingBottom || 0);

		if (height >= 0) {
			node.style.minHeight = height + 'px';
		}
	}
});
