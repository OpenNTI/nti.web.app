var Ext = require('extjs');
var ForumsHeadlinePost = require('./HeadlinePost');


module.exports = exports = Ext.define('NextThought.model.forums.ContentHeadlinePost', {
	extend: 'NextThought.model.forums.HeadlinePost',
	mimeType: 'application/vnd.nextthought.forums.contentheadlinepost'
});
