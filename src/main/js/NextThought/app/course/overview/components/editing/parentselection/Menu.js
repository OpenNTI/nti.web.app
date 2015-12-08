Ext.define('NextThought.app.course.overview.components.editing.parentselection.Menu', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-parentselection-menu',

	requires: [
		'NextThought.app.course.overview.components.editing.parentselection.MenuItem'
	],

	cls: 'overview-editing-parentselection-menu',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var itemTpl = this.itemTpl,
			doSelectRecord = this.doSelectRecord.bind(this),
			parseItemData = this.parseItemData;

		this.add(this.selectionItems.map(function(item) {
			return {
				xtype: 'overview-editing-parentselection-menuitem',
				selectionRecord: item,
				itemTpl: itemTpl,
				parseItemData: parseItemData,
				selectRecord: doSelectRecord
			};
		}));
	},


	doSelectRecord: function() {},


	selectRecord: function(record) {}
});
