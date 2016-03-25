var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.profiles.community.components.activity.parts.NewPost', {
	extend: 'Ext.Component',
	alias: 'widget.profiles-community-newpost',

	cls: 'new-post',

	defaultText: 'Write something...',

	renderTpl: Ext.DomHelper.markup({
		cls: 'prompt', html: 'Write something...'
	}),

	renderSelectors: {
		promptEl: '.prompt'
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.onNewPost) {
			this.mon(this.el, 'click', this.onNewPost.bind(this));
		}
	},


	setContainerTitle: function (title) {
		if (!this.rendered) {
			this.on('afterrender', this.setContainerTitle.bind(this, title));
			return;
		}

		var text = title ? 'Write something in ' + title + '...' : this.defaultText;

		this.promptEl.update(text);
	}
});
