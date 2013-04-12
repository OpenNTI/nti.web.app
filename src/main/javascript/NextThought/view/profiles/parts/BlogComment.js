Ext.define('NextThought.view.profiles.parts.BlogComment',{
	extend: 'NextThought.view.forums.Comment',
	alias: 'widget.profile-blog-comment',

	cls: 'blog-comment',


	fireDeleteEvent: function(){
		this.fireEvent('delete-post', this.record, this);
	}

});
