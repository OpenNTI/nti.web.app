const Ext = require('@nti/extjs');

require('legacy/common/StateStore');

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.StateStore',
	{
		extend: 'NextThought.common.StateStore',
	}
);
