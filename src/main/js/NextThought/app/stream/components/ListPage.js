Ext.define('NextThought.app.stream.components.ListPage', {
	extend: 'NextThought.app.stream.components.BasePage',
	alias: 'widget.stream-list-page',

	requires: [
		'NextThought.app.stream.components.listTiles.*'
	],


	cls: 'list-page',


	initComponent: function() {
		this.callParent(arguments);

		this.streamItems.forEach(this.addItem.bind(this));
	},


	addItem: function(record) {
		record = this.unwrapRecord(record);

		var cmp = this.getForMimeType(record.mimeType);

		if (!cmp) {
			console.error('No cmp for MimeType: ', record.mimeType);
			return;
		}

		this.add(cmp.create({
			record: record
		}));
	}

}, function() {
	var me = this,
		tiles = NextThought.app.stream.components.tiles,
		keys = Object.keys(tiles) || [];

	keys.forEach(function(key) {
		var cmp = tiles[key];

		me.registerItem(cmp.mimeTypes, cmp);
	});
});
