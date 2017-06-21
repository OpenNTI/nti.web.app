const Ext = require('extjs');

require('./Forum');


module.exports = exports = Ext.define('NextThought.model.forums.ContentForum', {
	extend: 'NextThought.model.forums.Forum',
	mimeType: 'application/vnd.nextthought.forums.contentforum'
});
