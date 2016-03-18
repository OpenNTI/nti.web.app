var Ext = require('extjs');
var ForumsHeadlinePost = require('./HeadlinePost');


module.exports = exports = Ext.define('NextThought.model.forums.CommunityHeadlinePost', {
	extend: 'NextThought.model.forums.HeadlinePost',
	searchProps: ['body', 'title', 'tags']
});
