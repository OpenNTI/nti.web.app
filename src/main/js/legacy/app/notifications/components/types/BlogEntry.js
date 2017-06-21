const Ext = require('extjs');

require('./ForumTopic');


module.exports = exports = Ext.define('NextThought.app.notifications.components.types.BlogEntry', {
	extend: 'NextThought.app.notifications.components.types.ForumTopic',
	alias: 'widget.notifications-item-blog-entry',

	statics: {
		mimeType: 'application/vnd.nextthought.forums.personalblogentry'
	},

	wording: 'created a thought {title}'
});
