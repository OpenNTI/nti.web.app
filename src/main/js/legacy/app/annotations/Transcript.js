const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.annotations.Transcript', {
	extend: 'NextThought.app.annotations.Base',
	alias: ['widget.transcript', 'widget.transcriptsummary'],


	constructor: function (config) {
		this.callParent(arguments);
	}
});
