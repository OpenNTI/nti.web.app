var Ext = require('extjs');
var ForumsCommentPost = require('./CommentPost');


module.exports = exports = Ext.define('NextThought.model.forums.PersonalBlogComment', {
	extend: 'NextThought.model.forums.CommentPost',

	isBlogComment: true,

	fields: [
		{ name: 'Deleted', type: 'boolean', persist: false},
		{ name: 'FavoriteGroupingField', defaultValue: 'Thoughts', persist: false}
	]
});
