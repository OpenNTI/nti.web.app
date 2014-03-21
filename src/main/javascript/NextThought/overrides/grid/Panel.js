Ext.define('NextThought.overrides.grid.Panel', {
	override: 'Ext.grid.Panel',

	ui: 'nti',
	plain: true,
	border: false,
	frame: false,

	sealedColumns: true,
	enableColumnHide: false,
	enableColumnMove: false,
	enableColumnResize: false,
	columnLines: false,
	rowLines: false,

	columnDefaults: {
		ui: 'nt',
		plain: true,
		border: false,
		frame: false,
		defaults: {
			ui: 'nt',
			border: false,
			sortable: true,
			menuDisabled: true
		}
	},

	initComponent: function() {
		var headerCtCfg = this.columns;
		if (Ext.isArray(headerCtCfg)) {
			headerCtCfg = {
				items: headerCtCfg
			};
		}
		this.columns = Ext.merge({}, this.columnDefaults, headerCtCfg);

		this.callParent(arguments);
	}
});
