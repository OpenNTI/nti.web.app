Ext.define('NextThought.view.courseware.dashboard.tiles.Base', {
	extend: 'Ext.Component',

	cls: 'tile',

	inheritableStatics: {
		WIDTH: 326,
		HEIGHT: 200,

		/**
		 * Return a config to create a tile for a given record,
		 * needs to give a height, and a width
		 * @param 	{Model} record the record we are building the tile for
		 * @return {Object} the config to build this tile
		 */
		getTileConfig: function(record) {
			return {
				xtype: this.xtype,
				width: this.WIDTH,
				height: this.HEIGHT
			};
		}
	},


	onClassExtended: function(cls, data) {
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, this.getRenderData());
	},


	getRenderData: function() {
		return {};
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.top) {
			this.el.setTop(this.top);
		}

		if (this.left) {
			this.el.setLeft(this.left);
		}
	}
});
