Ext.define('NextThought.view.profiles.parts.BlogComment',{
	extend: 'NextThought.view.forums.Comment',
	alias: 'widget.profile-blog-comment',

	cls: 'blog-comment',


	fireDeleteEvent: function(){
		me.fireEvent('delete-post',me.record, me);
	}

});
