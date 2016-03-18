var Ext = require('extjs');
var OldComment = require('./old/Comment');
var BlogActions = require('../Actions');


module.exports = exports = Ext.define('NextThought.app.blog.parts.Comment', {
    extend: 'NextThought.app.blog.parts.old.Comment',
    alias: 'widget.profile-blog-comment',
    cls: 'blog-comment',

    initComponent: function() {
		this.callParent(arguments);

		this.BlogActions = NextThought.app.blog.Actions.create();
	},

    fireDeleteEvent: function() {
		this.BlogActions.deleteBlogPost(this.record);
	}
});
