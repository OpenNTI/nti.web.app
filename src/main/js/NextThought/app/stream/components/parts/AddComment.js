Ext.define('NextThought.app.stream.components.parts.AddComment', {
	extend: 'Ext.Component',
	alias: 'widget.stream-parts-addcomment',

	cls: 'add-comment',

	renderTpl: Ext.DomHelper.markup({
		html: 'Add a comment'
	}),


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.addComment.bind(this));
	},


	addComment: function() {
		if (this.onAddComment) {
			this.onAddComment();
		}
	}
});
