var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.view.Table', {
	override: 'Ext.view.Table',

	getRecord: function() {
		try {
		//buffered stores may throw an error if we try to access an item that has
		// been paged out... lets not blow a gasket in this senario.
			return this.callParent(arguments);
		} catch (e) {
			return null;
		}
	}
});
