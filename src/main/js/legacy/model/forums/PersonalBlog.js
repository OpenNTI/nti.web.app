const Ext = require('@nti/extjs');

require('./Forum');

module.exports = exports = Ext.define('NextThought.model.forums.PersonalBlog', {
	extend: 'NextThought.model.forums.Forum',

	fields: [],

	getTitle: null,
});
