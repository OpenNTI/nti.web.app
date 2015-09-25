export default Ext.define('NextThought.overrides.selection.CellModel', {
	override: 'Ext.selection.CellModel',

	onViewRefresh: function() {
		try {
			this.callParent(arguments);
		} catch (e) {
			console.warn(e.stack || e.message || e);
		}
	}
});
