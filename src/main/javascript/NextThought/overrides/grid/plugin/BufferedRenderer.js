Ext.define('NextThought.overrides.grid.plugin.BufferedRenderer', {
	override: 'Ext.grid.plugin.BufferedRenderer',

	/*onViewRefresh: function() {
		console.debug('BufferedRenderer: View Refresh?', arguments);
		if (this.grid.isVisible(true)) {
			this.callParent(arguments);
		} else {
			console.debug('droped refresh, not visible');
		}
	},*/


	/*onViewResize: function() {
		console.debug('BufferedRenderer: View Resize?', arguments);
		if (this.grid.isVisible(true)) {
			this.callParent(arguments);
		} else {
			console.debug('droped view resize, not visible');
		}
	},*/


	renderRange: function() {
		console.debug('BufferedRenderer: renderRange?', arguments);
		if (this.grid.isVisible(true)) {
			this.callParent(arguments);
		} else {
			console.debug('BufferedRenderer: droped renderRange, not visible');
		}
	},


	init: function(grid) {
		this.callParent(arguments);
		this.__monitorActivation(grid);
	},


	__monitorActivation: function(grid) {
		function monitorCardChange(cmp, me) {
			var c = cmp.up('{isOwnerLayout("card")}');
			me = me || cmp;
			if (c) {
				me.mon(c, {
					buffer: 1,
					show: function() {
						if (grid.isVisible(true)) {
 							grid.updateLayout({defer: false});
						}
					}
				});
				monitorCardChange(c, me);
			}
		}

		monitorCardChange(grid);
	}
});
