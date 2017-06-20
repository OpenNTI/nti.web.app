const Ext = require('extjs');

const BlogActions = require('../Actions');

require('./old/Comment');


module.exports = exports = Ext.define('NextThought.app.blog.parts.Comment', {
	extend: 'NextThought.app.blog.parts.old.Comment',
	alias: 'widget.profile-blog-comment',
	cls: 'blog-comment',

	initComponent: function () {
		this.callParent(arguments);

		this.BlogActions = BlogActions.create();
	},

	fireDeleteEvent: function () {
		this.BlogActions.deleteBlogPost(this.record);
	}
});
