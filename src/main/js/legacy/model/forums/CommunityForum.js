const Ext = require('@nti/extjs');

require('./Forum');

module.exports = exports = Ext.define(
	'NextThought.model.forums.CommunityForum',
	{
		extend: 'NextThought.model.forums.Forum',
	}
);
