const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.common.Actions', {
	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor: function (config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this, config);
	}
});
