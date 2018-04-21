const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.stream.Grid', {
	extend: 'NextThought.app.stream.Base',

	cls: 'grid-stream',


	getPageConfig: function () {
		return {
			xtype: 'stream-grid-page'
		};
	}
});
