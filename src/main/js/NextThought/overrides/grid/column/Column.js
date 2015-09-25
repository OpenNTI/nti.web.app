export default Ext.define('NextThought.overrides.grid.column.Column', {
	override: 'Ext.grid.column.Column',

	afterRender: function() {
		this.callParent(arguments);
		if (this.sortable) {
			this.addCls('sortable');
		}
	}
});
