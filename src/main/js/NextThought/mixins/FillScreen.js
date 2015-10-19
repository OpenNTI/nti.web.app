Ext.define('NextThought.mixins.FillScreen', {

	fillScreen: function(node) {
		var me = this,
			resizeHandler = me.sizeNode.bind(me, node);

		Ext.EventManager.onWindowResize(resizeHandler, me);

		me.on('destroy', function() {
			Ext.EventManager.removeResizeListener(resizeHandler, me);
		});

		resizeHandler.call();
	},


	sizeNode: function(node) {
		var rect = node.getBoundingClientRect(),
			viewHeight = Ext.Element.getViewportHeight(),
			height = viewHeight - rect.top;

		if (height >= 0) {
			node.style.minHeight = height + 'px';
		}
	}
});
