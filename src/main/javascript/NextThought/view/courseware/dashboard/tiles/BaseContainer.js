Ext.define('NextThought.view.courseware.dashboard.tiles.BaseContainer', {
	extend: 'Ext.Container',

	cls: 'tile',

	inheritableStatics: {
		WIDTH: 330,
		HEIGHT: 200,

		/**
		 * returns Promise the fulfills with a config with a width and height
		 * @param	{Model} record the record we are building the tile for
		 * @return	{Object} the config to build this tile
		 */
		getTileConfig: function(/*record*/) {
			return Promise.resolve({
				xtype: this.xtype,
				width: this.WIDTH,
				height: this.HEIGHT
			});
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
