Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',

	requires: [
		'NextThought.view.library.Panel'
	],

	cls: 'library-container',

	layout: 'fit',
	items: [
		{xtype: 'library-view-panel'}
	],

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		//me.mon(me, 'deactivate', 'onDeactivated', me);
		//me.mon(me, 'beforedeactivate', 'onBeforeDeactivate', me);

		me.removeCls('make-white');

		//me.on('add', function() {
		//me.invertParentsPaddingToMargins(me.lastSides);
		//});
	},


	invertParentsPaddingToMargins: function(sides) {
		this.lastSides = sides;

		this.items.each(function(page) {
			page.updateSidePadding(sides);
		});
		this.callParent(arguments);
	},


	getPanel: function() {
		return this.down('library-view-panel');
	}

});
