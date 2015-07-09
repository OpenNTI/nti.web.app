Ext.define('NextThought.app.profiles.community.components.activity.parts.NewPost', {
	extend: 'Ext.Component',
	alias: 'widget.profiles-community-newpost',

	cls: 'new-post',

	renderTpl: Ext.DomHelper.markup({
		cls: 'prompt', html: 'Write something...'
	}),


	afterRender: function() {
		this.callParent(arguments);

		if (this.onNewPost) {
			this.mon(this.el, 'click', this.onNewPost.bind(this));
		}
	}
});
