const Ext = require('@nti/extjs');

require('./BaseExtProfile');

module.exports = exports = Ext.define('NextThought.app.profiles.user.Index', {
	extend: 'NextThought.app.profiles.user.Base',
	alias: 'widget.profile-user',
});
