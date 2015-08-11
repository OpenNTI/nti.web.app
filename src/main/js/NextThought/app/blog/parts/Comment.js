Ext.define('NextThought.app.blog.parts.Comment', {
	extend: 'NextThought.app.blog.parts.old.Comment',
	alias: 'widget.profile-blog-comment',

	cls: 'blog-comment',

	requires: ['NextThought.app.blog.Actions'],


	initComponent: function() {
		this.callParent(arguments);

		this.BlogActions = NextThought.app.blog.Actions.create();
	},


	fireDeleteEvent: function() {
		this.BlogActions.deleteBlogPost(this.record);
	}
});
