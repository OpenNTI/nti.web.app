Ext.define('NextThought.view.courseware.dashboard.TileContainer', {
	extend: 'NextThought.view.courseware.dashboard.AbstractView',
	alias: 'widget.dashboard-tile-container',


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		this.addCls(this.name);

		me.addLoadingMask();

		me.loadTiles
			.then(function(tiles) {
				me.removeLoadingMask();

				me.setTiles(tiles);
			});
	},


	addLoadingMask: function() {
		this.addCls('loading');
		this.el.mask('loading...');
	},


	removeLoadingMask: function() {
		this.removeCls('loading');
		this.el.unmask();
	},


	updateName: function(name) {
		this.removeCls(this.name);

		this.name = name;
		this.addCls(name);
	}
});
