const Ext = require('@nti/extjs');
const { Identity } = require('@nti/web-profiles');

require('internal/legacy/overrides/ReactHarness');

module.exports = exports = Ext.define(
	'NextThought.app.account.identity.React',
	{
		extend: 'NextThought.ReactHarness',
		alias: 'widget.identity-react',
		component: Identity.Session,

		setTheme(scope, knockout) {},
	}
);
