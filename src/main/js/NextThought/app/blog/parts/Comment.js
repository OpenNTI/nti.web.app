Ext.define('NextThought.app.blog.parts.Comment', {
	extend: 'NextThought.app.blog.parts.old.Comment',
	alias: 'widget.profile-blog-comment',

	cls: 'blog-comment',


	fireDeleteEvent: function() {
		this.fireEvent('delete-post', this.record, this);
	}

});
