const Ext = require('@nti/extjs');

require('internal/legacy/common/StateStore');

module.exports = exports = Ext.define(
	'NextThought.app.account.emailverify.StateStore',
	{
		extend: 'NextThought.common.StateStore',
	}
).getInstance();
