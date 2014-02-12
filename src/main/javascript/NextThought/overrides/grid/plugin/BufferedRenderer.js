Ext.define('NextThought.overrides.grid.plugin.BufferedRenderer', {
	override: 'Ext.grid.plugin.BufferedRenderer',

	onViewRefresh: function() {
		console.debug('Buffered View Refresh?', arguments);
		if (this.grid.isVisible(true)) {
			this.callParent(arguments);
		} else {
			console.debug('droped refresh, not visible');
		}
	},


	onViewResize: function() {
		console.debug('Buffered View Resize?', arguments);
		if (this.grid.isVisible(true)) {
			this.callParent(arguments);
		} else {
			console.debug('droped view resize, not visible');
		}
	},


	renderRange: function() {
		console.debug('Buffered render range?', arguments);
		if (this.grid.isVisible(true)) {
			this.callParent(arguments);
		} else {
			console.debug('droped renderRange, not visible');
		}
	}
});
