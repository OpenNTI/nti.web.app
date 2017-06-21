const Ext = require('extjs');

require('./CommentPost');


module.exports = exports = Ext.define('NextThought.model.forums.ContentCommentPost', {
	extend: 'NextThought.model.forums.CommentPost',
	mimeType: 'application/vnd.nextthought.forums.contentforumcomment'
});
